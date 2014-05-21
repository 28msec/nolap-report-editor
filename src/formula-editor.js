'use strict';

angular
.module('formulaEditor', ['reports.api.28.io'])
.directive('formula', function(FormulaParser){
    return {
        restrict: 'A',
        scope: {
        },
        link: function(){
            var parser = new FormulaParser();
            parser.parse('');
        }
    };
})
;
