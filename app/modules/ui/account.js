'use strict';

angular
.module('report-editor')
.directive('account', function(Session, ACCOUNT_URL){
    return {
        restrict: 'E',
        template: '<ul class="nav navbar-nav navbar-right"><li><a ng-href="{{accountUrl}}" class="std-right-margin"><i class="fa fa-user"></i>&nbsp;<span ng-bind="name"></span></a></li></ul>',
        replace: true,
        link: function($scope){
            var user = Session.getUser();
            $scope.name = user.firstname + ' ' + user.lastname;
            $scope.accountUrl = ACCOUNT_URL;
        }
    };
});