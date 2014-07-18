'use strict';

angular
    .module('filter-model', ['constants', 'api'])
    .factory('Filter', function($q, $angularCacheFactory, API, APPNAME, Session){

        return (function() {

            var cache;

            function getCache(){
                if(cache === undefined){
                    cache = $angularCacheFactory.get(APPNAME);
                }
                if(cache === undefined){
                    // default settings
                    cache = $angularCacheFactory(APPNAME, {
                        maxAge: null, // no max age
                        recycleFreq: 60 * 1000,
                        deleteOnExpire: 'aggressive',
                        storageMode: 'localStorage'
                    });
                }
                return cache;
            }

            var promise;
            var selection;

            function init(){
                if(promise === undefined) {
                    var deferred = $q.defer();

                    API.Report.getParameters({$method: 'POST'})
                        .then(
                        function (data) {
                            setSics(data.sics);
                            setEntities(data.entities);
                            setYears(data.years);
                            setPeriods(data.periods);
                            setTags(data.tags);
                            promise = undefined;
                            deferred.resolve(data);
                        },
                        function (e) {
                            promise = undefined;
                            deferred.reject(e);
                        }
                    );

                    promise = deferred.promise;
                }
                return promise;
            }

            function getSics(){
                var deferred = $q.defer();

                var sics = getCache().get('sics');
                if(sics === undefined){
                    init()
                        .then(
                            function(){
                                sics = getCache().get('sics');
                                deferred.resolve(sics);
                            },
                            function(e){
                                deferred.reject(e);
                            }
                        );
                } else {
                    deferred.resolve(sics);
                }

                return deferred.promise;
            }

            function getEntities(){
                var deferred = $q.defer();

                var entities = getCache().get('entities');
                if(entities === undefined){
                    init()
                        .then(
                            function(){
                                entities = getCache().get('entities');
                                deferred.resolve(entities);
                            },
                            function(e){
                                deferred.reject(e);
                            }
                        );
                }else {
                    deferred.resolve(entities);
                }

                return deferred.promise;
            }

            function getYears(){
                var deferred = $q.defer();

                var years = getCache().get('years');
                if(years === undefined){
                    init()
                        .then(
                            function(){
                                years = getCache().get('years');
                                deferred.resolve(years);
                            },
                            function(e){
                                deferred.reject(e);
                            }
                        );
                }else {
                    deferred.resolve(years);
                }

                return deferred.promise;
            }

            function getPeriods(){
                var deferred = $q.defer();

                var periods = getCache().get('periods');
                if(periods === undefined){
                    init()
                        .then(
                            function(){
                                periods = getCache().get('periods');
                                deferred.resolve(periods);
                            },
                            function(e){
                                deferred.reject(e);
                            }
                        );
                }else {
                    deferred.resolve(periods);
                }

                return deferred.promise;
            }

            function getTags(){
                var deferred = $q.defer();

                var tags = getCache().get('tags');
                if(tags === undefined){
                    init()
                        .then(
                            function(){
                                tags = getCache().get('tags');
                                deferred.resolve(tags);
                            },
                            function(e){
                                deferred.reject(e);
                            }
                        );
                }else {
                    deferred.resolve(tags);
                }

                return deferred.promise;
            }

            function setSics(sics){
                if(sics !== undefined && sics !== null && typeof sics === 'object' && sics.length !== undefined) {
                    getCache().put('sics', sics);
                }
            }

            function setEntities(entities){
                if(entities !== undefined && entities !== null && typeof entities === 'object' && entities.length !== undefined) {
                    getCache().put('entities', entities);
                }
            }

            function setYears(years){
                if(years !== undefined && years !== null && typeof years === 'object' && years.length !== undefined) {
                    getCache().put('years', years);
                }
            }

            function setPeriods(periods){
                if(periods !== undefined && periods !== null && typeof periods === 'object' && periods.length !== undefined) {
                    getCache().put('periods', periods);
                }
            }

            function setTags(tags){
                if(tags !== undefined && tags !== null && typeof tags === 'object' && tags.length !== undefined) {
                    getCache().put('tags', tags);
                }
            }

            function arrayContains(array, value){
                if(array === undefined || array === null || array.length === 0){
                    return false;
                }
                for( var i=0; i < array.length; i++){
                    if (array[i] === value) {
                        return true;
                    }
                }
                return false;
            }

            function selectEntity(entity) {
                if (selection.cik)
                {
                    if (!arrayContains(selection.cik, entity.cik)) {
                        selection.cik.push(entity.cik);
                    }
                }
                else
                {
                    selection.cik = [ entity.cik ];
                }
            }

            function selectSic(sic) {
                if (selection.sic)
                {
                    if (!arrayContains(selection.sic, sic.ID)) {
                        selection.sic.push(sic.ID);
                    }
                }
                else
                {
                    selection.sic = [ sic.ID ];
                }
            }

            function getEntity(cik){
                var entities = getCache().get('entities');
                var result;
                entities.forEach(function(entity){
                    if(entity.cik === cik){
                        result = entity;
                    }
                });
                return result;
            }

            function getSic(sicCode){
                var sics = getCache().get('sics');
                var result;
                sics.forEach(function(sic){
                    if(sic.ID === sicCode){
                        result = sic;
                    }
                });
                return result;
            }

            function getAspects(){
                var deferred = $q.defer();

                var aspects = {
                    'sec:FiscalPeriod': selection.fiscalPeriod,
                    'sec:FiscalYear': [],
                    'xbrl:Entity': [],
                    'sec:Archive':[]
                };
                var entities = getCache().get('entities');

                // fiscal year
                if((selection.fiscalYear.length || 0) > 0){
                    selection.fiscalYear.forEach(
                        function(year){
                            aspects['sec:FiscalYear'].push(parseInt(year,10));
                        }
                    );
                }

                // cik
                if((selection.cik.length || 0) > 0){
                    selection.cik.forEach(function(cik){
                        if(!arrayContains(aspects['xbrl:Entity'], cik)){
                            aspects['xbrl:Entity'].push(cik);
                        }
                    });
                }

                // tag
                if((selection.tag.length || 0)  > 0){
                    selection.tag.forEach(function(tag){
                        entities.forEach(function(entity){
                            if(arrayContains(entity.tags, tag)){
                                if(!arrayContains(aspects['xbrl:Entity'], entity.cik)){
                                    aspects['xbrl:Entity'].push(entity.cik);
                                }
                            }
                        });
                    });
                }

                // sic
                if((selection.sic.length || 0)  > 0){
                    selection.sic.forEach(function(sic){
                        entities.forEach(function(entity){
                            if(entity.sic === sic){
                                if(!arrayContains(aspects['xbrl:Entity'], entity.cik)){
                                    aspects['xbrl:Entity'].push(entity.cik);
                                }
                            }
                        });
                    });
                }

                // restrict sec:Archives
                var parameters = {
                    $method: 'POST',
                    cik: aspects['xbrl:Entity'],
                    fiscalYear: aspects['sec:FiscalYear'],
                    fiscalPeriod: aspects['sec:FiscalPeriod'],
                    token: Session.getToken()
                };
                API.Queries.listFilings(parameters)
                    .then(
                        function(filings){
                            var archives = filings.Archives;
                            if((archives.length || 0) > 0){
                                if(aspects['sec:Archive'] === undefined){
                                    aspects['sec:Archive'] = [];
                                }
                                archives.forEach(function(archive){
                                    var aid = archive.AccessionNumber;
                                    if(!arrayContains(aspects['sec:Archive'], aid)){
                                        aspects['sec:Archive'].push(aid);
                                    }
                                });
                            }
                            deferred.resolve(aspects);
                        }
                    );

                return deferred.promise;
            }

            function resetSelection(report){
                var deferred = $q.defer();

                selection = report.resetFilters();

                var years = getYears()
                    .then(function(years){selection.fiscalYear = [years[1]];});
                var periods = getPeriods()
                    .then(function(periods){selection.fiscalPeriod = [periods[0]];});
                $q.all([years, periods])
                    .then(function(){
                        getAspects()
                            .then(
                                function (aspects) {
                                    if (report !== undefined && typeof report === 'object') {
                                        report.updateAspects(aspects);
                                    }
                                }
                            );
                        deferred.resolve(selection);
                    });

                return deferred.promise;
            }

            function getSelection(report){
                var deferred = $q.defer();

                selection = report.getFilters();

                if(selection === undefined){
                    resetSelection(report)
                        .then(
                            function(selection){
                                deferred.resolve(selection);
                            }
                        );
                } else {
                    deferred.resolve(selection);
                }
                return deferred.promise;
            }

            return {
                getSics: getSics,
                getSic: getSic,
                selectSic: selectSic,
                getEntities: getEntities,
                getEntity: getEntity,
                selectEntity: selectEntity,
                getYears: getYears,
                getPeriods: getPeriods,
                getTags: getTags,
                getSelection: getSelection,
                resetSelection: resetSelection,
                getAspects: getAspects
            };
        })();
    });
