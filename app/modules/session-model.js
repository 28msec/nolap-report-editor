'use strict';

angular
    .module('session-model', ['constants', 'api'])
    .factory('Session', function($state, $location, $angularCacheFactory, API, APPNAME){

        return (function() {

            var cache;
            var token;
            var user;

            function redirectToLoginPage(){
                var p = $location.url();
                if (p.substring(0, 5) === '/auth')
                {
                    p = p.substring(5);
                }
                $state.go('auth', { returnPage: p }, { reload: true });
            }

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
                    redirectToLoginPage();
                }
                return token;
            }

            function setToken(ltoken){
                token = ltoken;
                getCache().put('token', ltoken);
            }

            function getUser(){
                if(user === undefined){
                    user = getCache().get('user');
                }
                return user;
            }

            function setUser(id, email, firstname, lastname){
                user = { id: id, email: email, firstname: firstname, lastname: lastname };
                getCache().put('user', user);
            }

            function login(email, password, successCallback, errorCallback) {
                API.Session.login({ 'email': email, 'password': password })
                    .then(
                        // success
                        function(data) {
                            setToken(data.token);
                            setUser(data._id, email, data.firstname, data.lastname);
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
                token = undefined;
                user = undefined;
                getCache().remove('token');
                getCache().remove('user');
            }

            return {
                redirectToLoginPage: redirectToLoginPage,
                login: login,
                logout: logout,
                getUser: getUser,
                getToken: getToken
            };
        })();
    });
