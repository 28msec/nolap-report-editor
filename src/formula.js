'use strict';

angular.module('formulaEditor',['excelParser', 'formulaParser'])
.factory('Formula', ['$q', '$log', 'ExcelParser', 'FormulaParser', function($q, $log, ExcelParser, FormulaParser){

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
        this.parser = null;
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
            if(this.model.Type === 'xbrl28:arithmetic') {
                this.parser = new FormulaParser();
                this.parserType = 'FormulaParser';
            }
            if(this.model.Type === 'xbrl28:excel') {
                this.parser = new ExcelParser();
                this.parserType = 'ExcelParser';
            }
        }
        return this.parser;
    };

    Formula.prototype.updateView = function() {
        this.view = JSON.stringify(this.model, null, ' ');
    };


    Formula.prototype.compileDeferred = function() {
        var deferred = $q.defer();

        $log.log('starting compilation');
        for (var i = 0; i < this.model.Formulae.length; ++i) {
            this.compilePrereq(i);
            this.compileBody(i);
        }

        return deferred.promise;
    };

    Formula.prototype.compile = function() {
        this.compileDeferred().then(
            function(){
                $log.log('compilation finished');
            }
        );
    };

    Formula.prototype.compileBodyDeferred = function(index) {
        ensureParameter(index, 'index', 'number', 'compileBodyDeferred');
        var deferred = $q.defer();
        var parser = this.getParser();
        var altComp = this.model.Formulae[index];
        var body;
        try{
            body = parser.parse(altComp.BodySrc);
            deferred.resolve(body);
        }
        catch(e) {
            var errMsg = this.parserType + ' ' + e.name + ' Error: (' + e.line + ',' + e.column + ') ' + e.message;
            deferred.reject(errMsg);
        }
        return deferred.promise;
    };

    Formula.prototype.compileBody = function(index) {
        ensureParameter(index, 'index', 'number', 'compileBody');
        var that = this;
        this.compileBodyDeferred(index).then(
            function(body){
                var altComp = that.model.Formulae[index];
                altComp.Body = body;
                if(altComp.BodyErr !== undefined){
                    delete altComp.BodyErr;
                }
                $log.log(that.parserType + ' Body ok');
                that.model.Formulae[index] = altComp;
            },
            function(errMsg){
                var altComp = that.model.Formulae[index];
                altComp.BodyErr = errMsg;
                altComp.Body = {};
                $log.log(errMsg);
                that.model.Formulae[index] = altComp;
            }
        );
    };

    Formula.prototype.compilePrereqDeferred = function(index) {
        ensureParameter(index, 'index', 'number', 'compilePrereqDeferred');
        var deferred = $q.defer();
        var parser = this.getParser();
        var altComp = this.model.Formulae[index];
        var prereq;
        try{
            prereq = parser.parse(altComp.PrereqSrc);
            deferred.resolve(prereq);
        }
        catch(e) {
            var errMsg = this.parserType + ' ' + e.name + ' Error: (' + e.line + ',' + e.column + ') ' + e.message;
            deferred.reject(errMsg);
        }
        return deferred.promise;
    };

    Formula.prototype.compilePrereq = function(index) {
        ensureParameter(index, 'index', 'number', 'compilePrereq');
        var that = this;
        this.compilePrereqDeferred(index).then(
            function(prereq){
                var altComp = that.model.Formulae[index];
                altComp.Prereq = prereq;
                if(altComp.PrereqErr !== undefined){
                    delete altComp.PrereqErr;
                }
                $log.log(that.parserType + ' Prereq ok');
                that.model.Formulae[index] = altComp;
            },
            function(errMsg){
                var altComp = that.model.Formulae[index];
                altComp.PrereqErr = errMsg;
                altComp.Prereq = {};
                $log.log(errMsg);
                that.model.Formulae[index] = altComp;
            }
        );
    };

    Formula.prototype.getModel = function () {
        return this.model;
    };

    Formula.prototype.setModel = function (model) {
        ensureParameter(model, 'model', 'object', 'setModel');
        this.model = model;
        this.parser = null;
        this.compile();
    };

    Formula.prototype.Id = function() {
        return this.model.Id;
    };
    return Formula;
}]);

