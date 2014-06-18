angular.module('report-api', [])
/**
 * <p>This API can be used to manage reports.</p> <p>This API is only accesible for users having granted priviliges to work with reports.</p> <p>Note, that the POST method can be simulated by using GET and adding the _method=POST parameter to the HTTP request.</p>
 */
.factory('ReportAPI', function($q, $http, $rootScope){
    /**
     * @class report-api
     * @param {string} domain - The project domain
     */
    return function(domain) {
        if(typeof(domain) !== 'string') {
            throw new Error('Domain parameter must be specified as a string.');
        }

        var root = '';

        this.$on = function($scope, path, handler) {
            var url = domain + path;
            $scope.$on(url, function(event, data){
                handler(data);
            });
            return this;
        };

        this.$broadcast = function(path, data){
            var url = domain + path;
            $rootScope.$broadcast(url, data);
            return this;
        };

        /**
         * 
         * @method
         * @name report-api#listReports
         * @param {string} _id - A report id (e.g. FundamentalAccountingConcepts),
         * @param {string} token - The token of the current session,
         * 
         */
        this.listReports = function(parameters){
            var deferred = $q.defer();
            var that = this;
            var path = '/reports.jq'
            var url = domain + path;
            var params = {};
            params['_id'] = parameters['_id'];
            params['token'] = parameters['token'];
            var body = null;
            var method = 'GET'.toUpperCase();
            if (parameters.$method)
            {
                params['_method'] = parameters.$method;
                method = 'GET';
            }
            var cached = parameters.$cache && parameters.$cache.get(url);
            if(method === 'GET' && cached !== undefined && parameters.$refresh !== true) {
                deferred.resolve(cached);
            } else {
            $http({
                method: method,
                url: url,
                params: params,
                cache: (parameters.$refresh !== true)
            })
            .success(function(data, status, headers, config){
                deferred.resolve(data);
                //that.$broadcast(url);
                if(parameters.$cache !== undefined) parameters.$cache.put(url, data, parameters.$cacheItemOpts ?
parameters.$cacheItemOpts : {});
            })
            .error(function(data, status, headers, config){
                deferred.reject({data: data, status: status, headers: headers, config: config});
                //cache.removeAll();
            })
            ;
            }
            return deferred.promise;
        };

        /**
         * 
         * @method
         * @name report-api#addOrReplaceOrValidateReport
         * @param {object} report - A JSON object containing the report,
         * @param {boolean} validation-only - This parameter is either given without any value (means: on) or absent (means: off) or its value is castable to a boolean. Turns validation-only mode on or off.,
         * @param {string} token - The token of the current session,
         * 
         */
        this.addOrReplaceOrValidateReport = function(parameters){
            var deferred = $q.defer();
            var that = this;
            var path = '/add-report.jq'
            var url = domain + path;
            var params = {};
            params['validation-only'] = parameters['validationOnly'];
            params['token'] = parameters['token'];
            var body = parameters['report'];
            var method = 'POST'.toUpperCase();
            if (parameters.$method)
            {
                params['_method'] = parameters.$method;
                method = 'POST';
            }
            var cached = parameters.$cache && parameters.$cache.get(url);
            if(method === 'GET' && cached !== undefined && parameters.$refresh !== true) {
                deferred.resolve(cached);
            } else {
            $http({
                method: method,
                url: url,
                params: params,
data: body,
                cache: (parameters.$refresh !== true)
            })
            .success(function(data, status, headers, config){
                deferred.resolve(data);
                //cache.removeAll();
            })
            .error(function(data, status, headers, config){
                deferred.reject({data: data, status: status, headers: headers, config: config});
                //cache.removeAll();
            })
            ;
            }
            return deferred.promise;
        };

        /**
         * 
         * @method
         * @name report-api#removeReport
         * @param {string} _id - A report id (e.g. FundamentalAccountingConcepts),
         * @param {string} token - The token of the current session,
         * 
         */
        this.removeReport = function(parameters){
            var deferred = $q.defer();
            var that = this;
            var path = '/delete-report.jq'
            var url = domain + path;
            var params = {};
            if(parameters['_id'] === undefined) {
                deferred.reject(new Error('The _id parameter is required'));
                return deferred.promise;
            } else {
                params['_id'] = parameters['_id'];
            }
            params['token'] = parameters['token'];
            var body = null;
            var method = 'POST'.toUpperCase();
            if (parameters.$method)
            {
                params['_method'] = parameters.$method;
                method = 'GET';
            }
            var cached = parameters.$cache && parameters.$cache.get(url);
            if(method === 'GET' && cached !== undefined && parameters.$refresh !== true) {
                deferred.resolve(cached);
            } else {
            $http({
                method: method,
                url: url,
                params: params,
                cache: (parameters.$refresh !== true)
            })
            .success(function(data, status, headers, config){
                deferred.resolve(data);
                //cache.removeAll();
            })
            .error(function(data, status, headers, config){
                deferred.reject({data: data, status: status, headers: headers, config: config});
                //cache.removeAll();
            })
            ;
            }
            return deferred.promise;
        };
    };
});