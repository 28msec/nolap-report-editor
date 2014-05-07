angular
.module('nolapReportEditor', [])
;angular
.module('nolapReportEditor')
.factory('Report', function(){

    //Constructor
    var Report = function(model){
        this.model = model;
    };

    Report.prototype.getModel = function(){
        return this.model;    
    };

    return Report;
});