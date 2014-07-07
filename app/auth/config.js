'use strict';

angular
.module('report-editor')
.config(function ($stateProvider) {
    $stateProvider
    //Auth
    .state('auth', {
        url: '/auth{returnPage:.*}',
        templateUrl: '/auth/auth.html',
        controller: 'AuthCtrl'
    });
})
;