'use strict';

angular
    .module('session-model', ['constants', 'api'])
    .factory('Session', function($state, $location, $angularCacheFactory, API, APPNAME){

        return (function() {

            var cache;

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
                var token = getCache().get('token');
                if(token === undefined){
                    redirectToLoginPage();
                }
                prolong(token);
                return token;
            }

            function setToken(ltoken){
                getCache().put('token', ltoken);
            }

            function getUser(){
                var user = getCache().get('user');
                if(user === undefined){
                    redirectToLoginPage();
                }
                prolong(undefined, user);
                return user;
            }

            function setUser(id, email, firstname, lastname){
                var luser = { id: id, email: email, firstname: firstname, lastname: lastname };
                getCache().put('user', luser);
            }

            function login(email, password) {
                return API.Session.login({ 'email': email, 'password': password })
                .then(function(data) {
                    setToken(data.token);
                    setUser(data._id, email, data.firstname, data.lastname);
                });
            }

            function prolong(token, user) {
                getCache().put('token', token || getCache().get('token'));
                getCache().put('user', user || getCache().get('user'));
            }

            function logout() {
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
