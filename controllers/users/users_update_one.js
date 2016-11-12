//update user model

var UserModel = require('../../models/user_model'),
    AccountModel = require ('../../models/accounts_model'),
    errHandle = require('../error_handle'),
    async = require('async');

//below the newperson function for export -- validates and generates new account model, user model and initial post model
var updatePerson = function updatePerson(req, res, next){

    //Declare all defined variables
    var newUserObj, newAccountObj, newPostObj, addNewPost, addNewAccount, user, post, account, check, accountSpace;
    var isAccountBeingUpdated = true;

    //assemble the new user object
    newUserObj = {};
    if(req.body.name){
        newUserObj.name = req.body.name;
    }
    if(req.body.pref_name){
        newUserObj.pref_name = req.body.pref_name;
    }
    if(req.body.gender){
        newUserObj.gender = req.body.gender;
    }
    if(req.body.dob_year && req.body.dob_month && req.body.dob_day){
        newUserObj.dob = new Date(req.body.dob_year, req.body.dob_month, req.body.dob_day, 0,0,0,0);
    }
    if(req.body.description){
        newUserObj.description = req.body.description;
    }
    if(req.body.height){
        newUserObj.height = req.body.height;
    }
    if(req.body.weight){
        newUserObj.weight = req.body.weight;
    }
    if(req.body.rel_status){
        newUserObj.rel_status = req.body.rel_status;
    }
    if(req.body.sexuality){
        newUserObj.sexuality = req.body.sexuality;
    }
    if(req.body.likes_1){
        newUserObj.likes_1 = req.body.likes_1;
    }
    if(req.body.likes_2){
        newUserObj.likes_2 = req.body.likes_2;
    }
    if(req.body.likes_3){
        newUserObj.likes_3 = req.body.likes_3;
    }



    if(req.body.ethnicity){
        newUserObj.ethnicity = req.body.ethnicity;
    }
    if(req.body.eye_color){
        newUserObj.eye_color = req.body.eye_color;
    }
    if(req.body.hair_color){
        newUserObj.hair_color = req.body.hair_color;
    }
    if(req.body.political_views){
        newUserObj.political_views = req.body.political_views;
    }
    if(req.body.religous_views){
        newUserObj.religous_views = req.body.religous_views;
    }
    if(req.body.education){
        newUserObj.education = req.body.education;
    }
    if(req.body.pets){
        newUserObj.pets = req.body.pets;
    }
    if(req.body.work_status){
        newUserObj.work_status = req.body.work_status;
    }

    //prepare new error object
    var newErr = {};
        newErr.name = 'nightparty_error';

    //get the current user id below
    var userId = req.user.user_id;

    async.waterfall([
        function(callback){
            if(req.body.email){
                AccountModel.checkEmailExist(req.body.email, function(err, user){
                    if(err){
                        callback(err);
                    }else if(user){
                        newErr.message = 'Email already registered.';
                        callback(newErr);
                    }else{
                        callback(null);
                    }//end inner if
                });
            }else{
                isAccountBeingUpdated = false;
                callback(null);
            }
        },
        function(callback){
            if(isAccountBeingUpdated){
                AccountModel.findAccountById(userId, callback);
            }else{
                callback(null, null);
            }
        },
        function(account, callback){
            if(isAccountBeingUpdated){
                console.log(account);
                account.email = req.body.email;
                account.save(callback);
            }else{
                callback(null, null, null);
            }
        },
        function(result, numAffected, callback){
            console.log(userId);
            // UserModel.findUserById(req.user.user_id, function(err, resul){
            //  console.log(111);
            //  console.log(err);
            //  console.log(resul);
            //  res.end();
            // });
            UserModel.findUserById(userId, callback);
        },
        function(user, callback){
            if(user){
                for(var attr in newUserObj){
                    user[attr] = newUserObj[attr];  
                }
                user.save(callback);
            }else{
                newErr.message = 'Cannot find user.';
                callback(newErr);
            }
        },
        function(){
            res.status(200);
            res.end();
        }
    ],
    function(err, results){
        //this is generic error function
        //delegate the error to the errHandle Module
        console.log('ERROR');
        errHandle.errIdentify(err, function(message){
            errHandle.errSendResponse(res, message);
        });
    });//end of async series
};

module.exports = updatePerson;
