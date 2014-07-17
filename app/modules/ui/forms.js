'use strict';

angular.module('forms-ui', [])
.directive('tristate', function(){
    return {
        require: '?ngModel',
        scope: {
            tristate: '='
        },
        link: function($scope, el){
            $scope.$watch('tristate', function(value){
                if(value === null) {
                    el.prop('indeterminate', true);
                } else {
                    el.prop('indeterminate', false);
                }
            });
        }
    };
})
.directive('indeterminate', function() {
    return {
        require: '?ngModel',
        link: function(scope, el, attrs, ctrl) {
            var truthy = true;
            var falsy = false;
            var nully = null;
            ctrl.$formatters = [];
            ctrl.$parsers = [];
            ctrl.$render = function() {
                var d = ctrl.$viewValue;
                el.data('checked', d);
                switch(d){
                case truthy:
                    el.prop('indeterminate', false);
                    el.prop('checked', true);
                    break;
                case falsy:
                    el.prop('indeterminate', false);
                    el.prop('checked', false);
                    break;
                default:
                    el.prop('indeterminate', true);
                }
            };
            el.bind('click', function() {
                var d;
                switch(el.data('checked')){
                case falsy:
                    d = truthy;
                    break;
                case truthy:
                    d = nully;
                    break;
                default:
                    d = falsy;
                }
                ctrl.$setViewValue(d);
                scope.$apply(ctrl.$render);
            });
        }
    };
})
;