/*global angular:false */
/**
 * <p>This API can be used to authorize requests.</p><p>Exposes endpoints used for logging in with an email address and a password in order to retrieve a token that can be used for authorizing future request, creating or revoking a token having a custom expiration that can be used in consumer applications, destroying a session identified by a token, and listing the active tokens.</p><p>Also note, that the POST method can be simulated by using GET and adding the _method=POST parameter to the HTTP request.</p><p>Please keep in mind that URLs are case sensitive. That is, all parameters need to be provided as shown in the documentation.</p>
 */
angular.module('session-service', [])
    .factory('SessionService', function($q, $http, $rootScope) {
        'use strict';

        /**
         * @class " || SessionService || "
         * @param {string} domain - The project domain
         * @param {string} cache - An angularjs cache implementation
         */
        return function(domain, cache) {

            if (typeof(domain) !== 'string') {
                throw new Error('Domain parameter must be specified as a string.');
            }

            this.$on = function($scope, path, handler) {
                var url = domain + path;
                $scope.$on(url, function() {
                    handler();
                });
                return this;
            };

            this.$broadcast = function(path) {
                var url = domain + path;
                //cache.remove(url);
                $rootScope.$broadcast(url);
                return this;
            };

            /**
             * Login with email and password in order to retrieve a token.
             * @method
             * @name SessionService#login
             * @param {{string}} format - The result format
             * @param {{string}} email - Email of user to login
             * @param {{string}} password - Password of user to login
             *
             */
            this.login = function(parameters) {
                var deferred = $q.defer();

                var path = '/session/login.jq';

                var body;
                var queryParameters = {};
                var headers = {};

                queryParameters['format'] = parameters.format;

                if (parameters.email === undefined) {
                    deferred.reject(new Error('Missing required query parameter: email'));
                    return deferred.promise;
                }

                queryParameters['email'] = parameters.email;

                if (parameters.password === undefined) {
                    deferred.reject(new Error('Missing required query parameter: password'));
                    return deferred.promise;
                }

                queryParameters['password'] = parameters.password;

                var url = domain + path;
                $http({
                    timeout: parameters.$timeout,
                    method: 'POST',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                })
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject(data);
                    });

                return deferred.promise;
            };
            /**
             * Logout the user identified by the given API key.
             * @method
             * @name SessionService#logout
             * @param {{string}} format - The result format
             * @param {{string}} token - API token of the current user
             *
             */
            this.logout = function(parameters) {
                var deferred = $q.defer();

                var path = '/session/logout.jq';

                var body;
                var queryParameters = {};
                var headers = {};

                queryParameters['format'] = parameters.format;

                if (parameters.token === undefined) {
                    deferred.reject(new Error('Missing required query parameter: token'));
                    return deferred.promise;
                }

                queryParameters['token'] = parameters.token;

                var url = domain + path;
                $http({
                    timeout: parameters.$timeout,
                    method: 'POST',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                })
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject(data);
                    });

                return deferred.promise;
            };
            /**
             * Create a token having a custom expiration duration.
             * @method
             * @name SessionService#token
             * @param {{string}} format - The result format
             * @param {{string}} email - Email of user that creates the token
             * @param {{string}} password - Password of user that creates the token
             * @param {{string}} expiration - Expiration of the token, in ISO format (e.g.: 2014-04-29T14:32:05.0321Z)
             *
             */
            this.token = function(parameters) {
                var deferred = $q.defer();

                var path = '/session/token.jq';

                var body;
                var queryParameters = {};
                var headers = {};

                queryParameters['format'] = parameters.format;

                if (parameters.email === undefined) {
                    deferred.reject(new Error('Missing required query parameter: email'));
                    return deferred.promise;
                }

                queryParameters['email'] = parameters.email;

                if (parameters.password === undefined) {
                    deferred.reject(new Error('Missing required query parameter: password'));
                    return deferred.promise;
                }

                queryParameters['password'] = parameters.password;

                if (parameters.expiration === undefined) {
                    deferred.reject(new Error('Missing required query parameter: expiration'));
                    return deferred.promise;
                }

                queryParameters['expiration'] = parameters.expiration;

                var url = domain + path;
                $http({
                    timeout: parameters.$timeout,
                    method: 'POST',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                })
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject(data);
                    });

                return deferred.promise;
            };
            /**
             * Revoke a token having a custom expiration duration.
             * @method
             * @name SessionService#revoke
             * @param {{string}} format - The result format
             * @param {{string}} email - Email of user that owns the token
             * @param {{string}} password - Password of user that owns the token
             * @param {{string}} token - API token to revoke
             *
             */
            this.revoke = function(parameters) {
                var deferred = $q.defer();

                var path = '/session/revoke.jq';

                var body;
                var queryParameters = {};
                var headers = {};

                queryParameters['format'] = parameters.format;

                if (parameters.email === undefined) {
                    deferred.reject(new Error('Missing required query parameter: email'));
                    return deferred.promise;
                }

                queryParameters['email'] = parameters.email;

                if (parameters.password === undefined) {
                    deferred.reject(new Error('Missing required query parameter: password'));
                    return deferred.promise;
                }

                queryParameters['password'] = parameters.password;

                if (parameters.token === undefined) {
                    deferred.reject(new Error('Missing required query parameter: token'));
                    return deferred.promise;
                }

                queryParameters['token'] = parameters.token;

                var url = domain + path;
                $http({
                    timeout: parameters.$timeout,
                    method: 'POST',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                })
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject(data);
                    });

                return deferred.promise;
            };
            /**
             * List tokens of a user identified by its token.
             * @method
             * @name SessionService#tokens
             * @param {{string}} format - The result format
             * @param {{string}} token - A valid API token
             *
             */
            this.tokens = function(parameters) {
                var deferred = $q.defer();

                var path = '/session/tokens.jq';

                var body;
                var queryParameters = {};
                var headers = {};

                queryParameters['format'] = parameters.format;

                if (parameters.token === undefined) {
                    deferred.reject(new Error('Missing required query parameter: token'));
                    return deferred.promise;
                }

                queryParameters['token'] = parameters.token;

                var url = domain + path;
                var cached = parameters.$cache && parameters.$cache.get(url);
                if (cached !== undefined && parameters.$refresh !== true) {
                    deferred.resolve(cached);
                    return deferred.promise;
                }
                $http({
                    timeout: parameters.$timeout,
                    method: 'GET',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                })
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject(data);
                    });

                return deferred.promise;
            };
        };
    });