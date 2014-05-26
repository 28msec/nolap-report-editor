'use strict';

angular.module('formulaEditor',[])
.factory('Formula', function(){

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

    Formula.prototype.updateView = function() {
        this.view = JSON.stringify(this.model, null, ' ');
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
});


