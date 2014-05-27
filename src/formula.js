'use strict';

angular.module('formulaEditor',['excelParser'])
.factory('Formula', [ '$log', 'ExcelParser', function($log, ExcelParser){

    var ensureParameter = function(paramValue, paramName, paramType, functionName, regex, regexErrorMessage) {
        if(paramValue === null || paramValue === undefined) {
            throw new Error(functionName + ': function called without mandatory "' + paramName + '" parameter.');
        }
        if(typeof paramValue !== paramType) {
            throw new Error(functionName + ': function called with mandatory "' + paramName + '" parameter which is of wrong type "' + typeof paramValue + '" (should be of type "' + paramType + '" instead).');
        }
        if(regex !== undefined && paramValue.match(regex) === null) {
            throw new Error(functionName + ': ' + regexErrorMessage);
        }
    };

    //Constructor
    var Formula = function(type){
        ensureParameter(type, 'type', 'string', 'Formula (Const.)');
        this.model = {
            'Id': '',
            'Type': type,
            'Label': '',
            'Description': '',
            'ComputableConcepts': [],
            'DependsOn': [],
            'AllowCrossPeriod': false,
            'Formulae': [
                {
                    'PrereqSrc': '',
                    'Prereq': {},
                    'SourceFact': [],
                    'BodySrc': '',
                    'Body': {}
                }
            ]
        };
    };

    Formula.prototype.getParser = function() {
        if(this.parser === undefined || this.parser === null ) {
            this.parser = new ExcelParser();
        }
        return this.parser;
    };

    Formula.prototype.updateView = function() {
        this.view = JSON.stringify(this.model, null, ' ');
    };


    Formula.prototype.compile = function() {
        for (var i = 0; i < this.model.Formulae.length; ++i) {
            this.compilePrereq(i);
            this.compileBody(i);
        }
    };

    Formula.prototype.compileBody = function(index) {
        ensureParameter(index, 'index', 'number', 'compileBody');
        var parser = this.getParser();
        var altComp = this.model.Formulae[index];
        var body;
        try{
            body = parser.parse(altComp.BodySrc);
            altComp.Body = body;
            if(altComp.BodyErr !== undefined){
                delete altComp.BodyErr;
            }
            $log.log("Body ok");
        }
        catch(e) {
            var errMsg = e.name + ' Error: (' + e.line + ',' + e.column + ') ' + e.message;
            altComp.BodyErr = errMsg;
            altComp.Body = {};
            $log.log(errMsg);
        }
        this.model.Formulae[index] = altComp;
    };

    Formula.prototype.compilePrereq = function(index) {
        ensureParameter(index, 'index', 'number', 'compilePrereq');
        var parser = this.getParser();
        var altComp = this.model.Formulae[index];
        var prereq;
        try{
            prereq = parser.parse(altComp.PrereqSrc);
            altComp.Prereq = prereq;
            if(altComp.PrereqErr !== undefined){
                delete altComp.PrereqErr;
            }
            $log.log("Prereq ok");
        }
        catch(e) {
            var errMsg = e.name + ' Error: (' + e.line + ',' + e.column + ') ' + e.message;
            altComp.PrereqErr = errMsg;
            altComp.Prereq = {};
            $log.log(errMsg);
        }
        this.model.Formulae[index] = altComp;
    };

    Formula.prototype.getModel = function () {
        return this.model;
    };

    Formula.prototype.setModel = function (model) {
        ensureParameter(model, 'model', 'object', 'setModel');
        this.model = model;
    };

    Formula.prototype.Id = function() {
        return this.model.Id;
    };
    return Formula;
}]);



