'use strict';

angular
.module('report-editor')
.directive('apiStatus', function($rootScope, $timeout){
    return {
        restrict: 'A',
        templateUrl: '/modules/ui/api-status.html',
        link: function($scope){
            $rootScope.$on('apiStatus', function(event, data){
                if(data.message) {
                    $scope.message = data.message;
                    $scope.code = data.code;
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