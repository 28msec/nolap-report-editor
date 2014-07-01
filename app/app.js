 'use strict';

angular.module('report-editor', [
    'ui.router',
    'ui.bootstrap',
    'jmdobry.angular-cache',
    'ngProgressLite',

    'report-api',
    'report-model',
    'rules-model',
    'excel-parser',
    'formula-parser',
    'forms-ui'
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
//TODO: to be removed by the final version of the REST API
.factory('ReportEditorConfig', function(){
    return {
        api: {
            endpoint: 'http://secxbrld.xbrl.io/v1/_queries/public/reports',
            token: '0ed3b9a9-2795-412d-9863-6186d1cb64bc'
        }
    };
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
        url: '/',
        templateUrl: '/reports/reports.html',
        controller: 'ReportsCtrl',
        resolve: {
            reports: ['ReportEditorConfig', 'ReportAPI', function(ReportEditorConfig, ReportAPI) {
                var api = new ReportAPI(ReportEditorConfig.api.endpoint);
                return api.listReports({
                    token: ReportEditorConfig.api.token,
                    $method: 'POST'
                });
            }]
        }
    })
    .state('report', {
        url: '/:id',
        templateUrl: 'report/report.html',
        controller: 'ReportCtrl',
        resolve: {
            report: ['$stateParams', 'ReportEditorConfig', 'ReportAPI', function($stateParams, ReportEditorConfig, ReportAPI) {
                var api = new ReportAPI(ReportEditorConfig.api.endpoint);
                return api.listReports({
                    _id: $stateParams.id,
                    token: ReportEditorConfig.api.token,
                    $method: 'POST'
                });
            }]
        }
    })
    .state('report.taxonomy', {
        url: '/taxonomy',
        templateUrl: 'report/taxonomy/taxonomy.html',
        controller: 'TaxonomyCtrl'
    })
    .state('report.filters', {
        url: '/filters',
        templateUrl: 'report/filters/filters.html',
        controller: 'FiltersCtrl'
    })
    .state('report.factTable', {
        url: '/fact-table',
        templateUrl: 'report/fact-table/fact-table.html',
        controller: 'FactTableCtrl'
    })
    .state('report.preview', {
        url: '/preview',
        templateUrl: 'report/preview/preview.html',
        controller: 'PreviewCtrl'
    })
    ;
})
;
