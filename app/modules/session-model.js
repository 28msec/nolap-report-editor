'use strict';

angular
    .module('session-model', ['constants', 'session-api'])
    .factory('Session', function($rootScope, $angularCacheFactory, SessionAPI, APPNAME){

        return (function() {

            var cache;
            var token;
            var user;

            function getCache(){
                if(cache === undefined){
                    cache = $angularCacheFactory.get(APPNAME);
                }
                if(cache === undefined){
                    // default settings
                    cache = $angularCacheFactory(APPNAME, {
                        maxAge: 60 * 60 * 1000,
                        recycleFreq: 60 * 1000,
                        deleteOnExpire: 'aggressive',
                        storageMode: 'localStorage'
                    });
                }
                return cache;
            }

            function getToken(){
                if(token === undefined){
                    token = getCache().get('token');
                }
                if(token === undefined){
                    $rootScope.$emit('auth');
                }
                return token;
            }

            function setToken(ltoken){
                token = ltoken;
                getCache().put('token', ltoken);
            }

            function getUser(){
                if(user === undefined){
                    user = this.getCache().get('user');
                }
                return user;
            }

            function setUser(id, email, firstname, lastname){
                user = { id: id, email: email, firstname: firstname, lastname: lastname };
                getCache().put('user', user);
            }

            function login(email, password, successCallback, errorCallback) {
                SessionAPI.login({ 'email': email, 'password': password })
                    .then(
                        // success
                        function(data) {
                            setToken(data.token);
                            setUser(data._id, $scope.loginEmail, data.firstname, data.lastname);
                            if(successCallback !== undefined){
                                successCallback(data);
                            }
                        },
                        // error
                        function() {
                            if(errorCallback !== undefined){
                                errorCallback();
                            }
                        });
            }

            function logout() {
                $rootScope.token = null;
                $rootScope.user = null;
                var cache = $angularCacheFactory.get(APPNAME);
                if (cache) {
                    cache.remove('token');
                    cache.remove('user');
                }
            }

            return {
                login: login,
                logout: logout,
                getUser: getUser,
                getToken: getToken
            };
        })()
    });
