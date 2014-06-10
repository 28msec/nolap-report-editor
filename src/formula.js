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
    var Formula = function(model_or_ruleType, computable_concept){
        if(typeof model_or_ruleType === 'object' && model_or_ruleType !== null){
            this.setModel(model_or_ruleType);
        } else {
            ensureParameter(model_or_ruleType, 'model_or_ruleType', 'string', 'Formula (Const.)');
            ensureParameter(computable_concept, 'computable_concept', 'string', 'Formula (Const.)');
            this.parser = null;
            if(model_or_ruleType === 'xbrl28:arithmetic' || model_or_ruleType === 'xbrl28:excel') {
                this.setModel({
                    'Id': '',
                    'Type': model_or_ruleType,
                    'Label': '',
                    'Description': '',
                    'ComputableConcepts': [ computable_concept ],
                    'DependsOn': [],
                    'AllowCrossPeriod': false,
                    'AllowCrossBalance': false,
                    'Formulae': [
                        {
                            'PrereqSrc': 'TRUE',
                            'Prereq': {},
                            'SourceFact': [],
                            'BodySrc': '',
                            'Body': {}
                        }
                    ]
                });
            } else if (model_or_ruleType === 'xbrl28:validation'){
                this.setModel({
                    'Id': '',
                    'Type': model_or_ruleType,
                    'Label': '',
                    'Description': '',
                    'ComputableConcepts': [ computable_concept + 'Validation' ],
                    'ValidatedConcepts': [ computable_concept ],
                    'DependsOn': [],
                    'Formula': ''
                });
            } else if (model_or_ruleType === 'xbrl28:formula') {
                this.setModel({
                    'Id': '',
                    'Type': model_or_ruleType,
                    'Label': '',
                    'Description': '',
                    'ComputableConcepts': [ computable_concept ],
                    'DependsOn': [],
                    'Formula': ''
                });
            }
        }
    };

    Formula.prototype.getParser = function() {
        if(this.parser === undefined || this.parser === null ) {
            if(this.model.Type === 'xbrl28:arithmetic') {
                this.parser = FormulaParser;
                this.parserType = 'FormulaParser';
            }
            if(this.model.Type === 'xbrl28:excel') {
                this.parser = ExcelParser;
                this.parserType = 'ExcelParser';
            }
        }
        return this.parser;
    };

    /*Formula.prototype.updateView = function() {
        this.view = JSON.stringify(this.model, null, ' ');
    };*/


    Formula.prototype.compileDeferred = function() {
        var deferred = $q.defer();

        $log.log('starting compilation');
        if((this.model.Type === 'xbrl28:excel' || this.model.Type === 'xbrl28:arithmetic')
            && this.model.Formulae !== undefined && this.model.Formulae !== null) {
            for (var i = 0; i < this.model.Formulae.length; ++i) {
                this.compilePrereq(i);
                this.compileBody(i);
            }
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
        if(altComp.BodySrc === undefined || altComp.BodySrc === '' || altComp.BodySrc === null){
            deferred.reject('Rule code section cannot be empty. Example code: "((NetIncomeLoss/Revenues)*(1+(Assets-Equity)/Equity))/((1/(Revenues/Assets))-((NetIncomeLoss/Revenues)*(1+(Assets-Equity)/Equity)))"');
        }else {
            try {
                body = parser.parse(altComp.BodySrc);
                deferred.resolve(body);
            }
            catch (e) {
                var errMsg = this.parserType + ' ' + e.name + ' Error: (' + e.line + ',' + e.column + ') ' + e.message;
                deferred.reject(errMsg);
            }
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
        if(altComp.PrereqSrc === undefined || altComp.PrereqSrc === '' || altComp.PrereqSrc === null){
            deferred.reject('Rule precondition section cannot be empty. If you don\'t want to check a precondition just put "TRUE".');
        }else {
            try {
                prereq = parser.parse(altComp.PrereqSrc);
                deferred.resolve(prereq);
            }
            catch (e) {
                var errMsg = this.parserType + ' ' + e.name + ' Error: (' + e.line + ',' + e.column + ') ' + e.message;
                deferred.reject(errMsg);
            }
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

    Formula.prototype.getRule = function () {
        if(this.model.Type === 'xbrl28:excel' || this.model.Type === 'xbrl28:arithmetic'){
            var rule = {
                'Id': this.model.Id,
                'Type': this.model.Type,
                'Label': this.model.Label,
                'Description': this.model.Description,
                'ComputableConcepts': this.model.ComputableConcepts,
                'DependsOn': this.model.DependsOn
            };
            rule.Formulae = this.model.Formulae;
            rule.AllowCrossPeriod = this.model.AllowCrossPeriod;
            rule.AllowCrossBalance = this.model.AllowCrossBalance;
            return rule;
        } else if(this.model.Type === 'xbrl28:formula' || this.model.Type === 'xbrl28:validation'){
            return this.getModel();
        }
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


