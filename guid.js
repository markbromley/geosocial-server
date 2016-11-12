var generateUid = function (userId) {

    userId = userId || '';

    var date = new Date();
    var dateString = date.getTime().toString();

    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    return (dateString + userId + S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
};

module.exports = generateUid;