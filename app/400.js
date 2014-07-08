'use strict';

angular
.module('report-editor')
.config(function ($urlRouterProvider, $stateProvider) {
    $stateProvider
    .state('404', {
        url: '{path:.*}',
        templateUrl: '/404.html'
    });
});
