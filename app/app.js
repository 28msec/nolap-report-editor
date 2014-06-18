 'use strict';

angular.module('report-editor', [
    'ui.router',
    'ui.bootstrap',
    'jmdobry.angular-cache',
    'ngProgressLite',

    'report-api',
    'report-model',
    'excel-parser',
    'formula-parser'
])
.run(function($rootScope, ngProgressLite) {
  
    $rootScope.$on('$stateChangeStart', function() {
        ngProgressLite.start();
    });

    $rootScope.$on('$stateChangeSuccess', function() {
        ngProgressLite.done();
    });

    $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
        console.error(error);
        ngProgressLite.done();
    });
})
.config(function ($urlRouterProvider, $stateProvider, $locationProvider, $httpProvider) {

    //Because angularjs default transformResponse is not based on ContentType
    $httpProvider.defaults.transformResponse = function(response, headers){
        var contentType = headers('Content-Type');
        if(/^application\/(.*\+)?json/.test(contentType)) {
            try {
                return JSON.parse(response);
            } catch(e) {
                console.error('Couldn\'t parse the following response:');
                console.error(response);
                return response;
            }
        } else {
            return response;
        }
    };

    $locationProvider.html5Mode(true);
    
    $stateProvider
    .state('reports', {
        templateUrl: '/views/reports.html',
        controller: 'ReportsCtrl',
        url: '/'
    })
    .state('report', {
        templateUrl: '/views/report.html',
        controller: 'ReportCtrl',
        url: '/:id'
    })
    ;
    
})
;