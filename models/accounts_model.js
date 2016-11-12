var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt'),
    constants = require('../constants');

    SALT_WORK_FACTOR = constants.SALT_WORK_FACTOR;
    MAX_LOGIN_ATTEMPTS = constants.MAX_LOGIN_ATTEMPTS;
    LOCK_TIME = constants.LOCK_TIME;

var AccountSchema = new Schema({
    user_id: {type: String, required: true, index: true},
    email: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    loginAttempts: { type: Number, required: true, default: 0 },
    lockUntil: { type: Number },
    token: {type: String, index: {unique: true}},
    token_expire: {type: Date}
});

AccountSchema.virtual('isLocked').get(function() {
    // check for a future lockUntil timestamp
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

AccountSchema.pre('save', function(next) {
    var account = this;

    // only hash the password if it has been modified (or is new)
    if (!account.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(account.password, salt, function (err, hash) {
            if (err) return next(err);

            // set the hashed password back on our account document
            account.password = hash;
            next();
        });
    });
});

AccountSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

AccountSchema.methods.incLoginAttempts = function(cb) {
    // if we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.update({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        }, cb);
    }
    // otherwise we're incrementing
    var updates = { $inc: { loginAttempts: 1 } };
    // lock the account if we've reached max attempts and it's not locked already
    if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + LOCK_TIME };
    }
    return this.update(updates, cb);
};

// expose enum on the model, and provide an internal convenience reference 
var reasons = AccountSchema.statics.failedLogin = {
    NOT_FOUND: 0,
    PASSWORD_INCORRECT: 1,
    MAX_ATTEMPTS: 2
};

AccountSchema.statics.getAuthenticated = function(email, password, cb) {
    this.findOne({ email: email }, function(err, account) {
        if (err) return cb(err, null, null);

        // make sure the account exists
        if (!account) {
            return cb(null, null, reasons.NOT_FOUND);
        }

        // check if the account is currently locked
        if (account.isLocked) {
            // just increment login attempts if account is already locked
            return account.incLoginAttempts(function(err) {
                if (err) return cb(err, null, null);
                return cb(null, null, reasons.MAX_ATTEMPTS);
            });
        }

        // test for a matching password
        account.comparePassword(password, function(err, isMatch) {
            if (err) return cb(err, null, null);

            // check if the password was a match
            if (isMatch) {
                // if there's no lock or failed attempts, just return the account
                if (!account.loginAttempts && !account.lockUntil) return cb(null, account, null);
                // reset attempts and lock info
                var updates = {
                    $set: { loginAttempts: 0 },
                    $unset: { lockUntil: 1 }
                };
                return account.update(updates, function(err) {
                    if (err) return cb(err, null, null);
                    return cb(null, account, null);
                });
            }

            // password is incorrect, so increment login attempts before responding
            account.incLoginAttempts(function(err) {
                if (err) return cb(err, null, null);
                return cb(null, null, reasons.PASSWORD_INCORRECT);
            });
        });
    });
};

AccountSchema.statics.getTokenAuthenticated = function(token, cb){
    this.findOne({token: token, token_expire:{$gte: Date.now()}}, function(err, account){
        if(err) return cb(err);
        if(!account){
            return cb(1);
        }else{
            return cb(null, account);
        }

    });
};

AccountSchema.statics.findAccountById = function(accountId, callback){
    return this.findOne({_id: accountId}).exec(callback);
};

AccountSchema.statics.findAccountByToken = function(accountToken, callback){
    return this.findOne({token: accountToken}).exec(callback);
};

AccountSchema.statics.checkEmailExist = function(email, callback){
    return this.findOne({email: email}).exec(callback);
};

module.exports = mongoose.model('Account', AccountSchema);