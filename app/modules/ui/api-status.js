'use strict';

angular
.module('report-editor')
.directive('apiStatus', function($rootScope, $timeout, $window){
    var code;
    var onBeforeUnloadHandler = function(event){
        if(code === 'warning') {
            var message = 'A report is currently being saved.';
            (event || $window.event).returnValue = message;
		    return message;
        }
    };
    
    if ($window.addEventListener) {
        $window.addEventListener('beforeunload', onBeforeUnloadHandler);
    } else {
        $window.onbeforeunload = onBeforeUnloadHandler;
    }
    
    return {
        restrict: 'A',
        templateUrl: '/modules/ui/api-status.html',
        link: function($scope){
            $rootScope.$on('apiStatus', function(event, data){
                if(data.message) {
                    $scope.message = data.message;
                    code = data.code;
                    $scope.code = code;
                    if(data.expires) {
                        $timeout(function(){
                            $scope.message = undefined;
                        }, data.expires);
                    }
                } else {
                    $scope.message = undefined;
                }
            });
        }
    };
})
;