//Report User
var ReportModel = require('../../models/report_model');

var createOneReport = function createOneReport(req, res, next){
    if(req.user.user_id == req.body.user_id){
        // Don't allow people to report themselves - that would be silly
        res.status(400);
        res.end();
    }else{
        var reportObj = {};
            reportObj.user_id = req.user.user_id;
            reportObj.reported_id = req.body.user_id;
            reportObj.server_timestamp = new Date();
        console.log(reportObj);

        var report = new ReportModel(reportObj);

            report.save(function(err){
                if(err){
                    res.status(500);
                    res.end();
                }else{
                    res.status(200);
                    res.end();
                }
            });
    }
};

module.exports = createOneReport;