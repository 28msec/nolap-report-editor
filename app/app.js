'use strict';

angular.module('report-editor', [
    'ui.router',
    'ui.bootstrap',
    'jmdobry.angular-cache',
    'ngProgressLite',
    'constants',
    'session-api',
    'session-model',
    'report-api',
    'report-model',
    'rules-model',
    'excel-parser',
    'formula-parser',
    'forms-ui'
])

.constant("HTTP_DEBUG", false)

.factory('ConnectionHandler', function($q, $rootScope, DEBUG, HTTP_DEBUG){
    return {
        'request': function(config) {
            if(HTTP_DEBUG) console.log('HTTP request: ' + JSON.stringify(config));
            return config;
        },
        'requestError': function(rejection) {
            if(HTTP_DEBUG) console.error('HTTP requestError: ' + JSON.stringify(rejection));
            return $q.reject(rejection);
        },
        'response': function(response) {
            if(HTTP_DEBUG) console.log('HTTP response: ' + JSON.stringify(response));
            return response;
        },
        'responseError': function(rejection){
            if(HTTP_DEBUG) console.error('HTTP responseError: ' + JSON.stringify(rejection));
            if(rejection.status === 401) {
                if(DEBUG) console.error('intercepted 401: emitting auth');
                $rootScope.$emit('auth');
            }
            return $q.reject(rejection);
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

    $httpProvider.interceptors.push('ConnectionHandler');

    $locationProvider.html5Mode(true);

    $stateProvider
        //Auth
        .state('auth', {
            url: '/auth{returnPage:.*}',
            templateUrl: '/auth/auth.html',
            controller: 'AuthCtrl',
            data: {
                title: 'Login'
            }
        });
})

.run(function($rootScope, ngProgressLite, $state, $location, $angularCacheFactory, Session) {

    $rootScope.session = Session;

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

    $rootScope.$on('error', function(event, status, error){
        switch (status)
        {
            case 401:
                $rootScope.$emit('auth');
                break;
            /*case 403:
                $modal.open( {
                    template: '<div class="modal-header h3"> Subscription required<a class="close" ng-click="cancel()">&times;</a></div><div class="modal-body"><h4>The page you are trying to access displays information about an entity not included in the DOW30.</h4>To view that information you need to subscribe to Pro.<br><br><a href="/account/billing" ng-click="cancel()" class="dotted">Go to Billing</a></div>',
                    controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                    }]
                });
                break;*/
            default:
                $modal.open( {
                    template: '<div class="modal-header h3"> Error {{object.status}} <a class="close" ng-click="cancel()">&times;</a></div><div class="modal-body"> {{object.error.description }} <br><a ng-click="details=true" ng-hide="details" class="dotted">Show details</a><pre ng-show="details" class="small">{{object.error | json }}</pre></div>',
                    controller: ['$scope', '$modalInstance', 'object', function ($scope, $modalInstance, object) {
                        $scope.object = object;
                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                    }],
                    resolve: {
                        object: function() { return { status: status, error: error }; }
                    }
                });
        }
    });

    $rootScope.$on('auth', function() {
        var p = $location.url();
        if (p.substring(0, 5) === '/auth')
        {
            p = p.substring(5);
        }
        $state.go('auth', { returnPage: p }, { reload: true });
    });
})
;
