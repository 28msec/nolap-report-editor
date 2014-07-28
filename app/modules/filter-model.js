'use strict';

angular
    .module('filter-model', ['constants', 'api'])
    .factory('Filter', function($q, $angularCacheFactory, API, APPNAME, Session){

        return (function() {

            var promise;
            var selection;
            var sics, years, periods, entities, tags;

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

                if(sics === undefined){
                    init()
                        .then(
                            function (data) {
                                setSics(data.sics);
                                deferred.resolve(data.sics);
                            },
                            function (e) {
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

                if(entities === undefined){
                    init()
                        .then(
                            function (data) {
                                setEntities(data.entities);
                                deferred.resolve(data.entities);
                            },
                            function (e) {
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

                if(years === undefined){
                    init()
                        .then(
                            function (data) {
                                setYears(data.years);
                                deferred.resolve(data.years);
                            },
                            function (e) {
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

                if(periods === undefined){
                    init()
                        .then(
                            function (data) {
                                setPeriods(data.periods);
                                deferred.resolve(data.periods);
                            },
                            function (e) {
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

                if(tags === undefined){
                    init()
                        .then(
                            function (data) {
                                setTags(data.tags);
                                deferred.resolve(data.tags);
                            },
                            function (e) {
                                deferred.reject(e);
                            }
                        );
                }else {
                    deferred.resolve(tags);
                }

                return deferred.promise;
            }

            function setSics(lSics){
                if(lSics !== undefined && lSics !== null && typeof lSics === 'object' && lSics.length !== undefined) {
                    sics = lSics;
                }
            }

            function setEntities(lEntities){
                if(lEntities !== undefined && lEntities !== null && typeof lEntities === 'object' && lEntities.length !== undefined) {
                    entities = lEntities;
                }
            }

            function setYears(lYears){
                if(lYears !== undefined && lYears !== null && typeof lYears === 'object' && lYears.length !== undefined) {
                    years = lYears;
                }
            }

            function setPeriods(lPeriods){
                if(lPeriods !== undefined && lPeriods !== null && typeof lPeriods === 'object' && lPeriods.length !== undefined) {
                    periods = lPeriods;
                }
            }

            function setTags(lTags){
                if(lTags !== undefined && lTags !== null && typeof lTags === 'object' && lTags.length !== undefined) {
                    tags = lTags;
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
                var result;
                if(entities !== undefined) {
                    entities.forEach(function (entity) {
                        if (entity.cik === cik) {
                            result = entity;
                        }
                    });
                }
                return result;
            }

            function getSic(sicCode){
                var result;
                if(sics !== undefined) {
                    sics.forEach(function (sic) {
                        if (sic.ID === sicCode) {
                            result = sic;
                        }
                    });
                }
                return result;
            }

            function isLatestFiscalYearSelected(){
                var hasLatest = false;
                if((selection.fiscalYear.length || 0) > 0){
                    selection.fiscalYear.forEach(
                        function(year){
                            if(year === 'LATEST'){
                                hasLatest = true;
                            }
                        });
                }
                return hasLatest;
            }

            function getAspects(){
                var deferred = $q.defer();

                var hasLatest = isLatestFiscalYearSelected();
                var aspects = {
                    'sec:FiscalPeriod': selection.fiscalPeriod,
                    'sec:FiscalYear': [],
                    'xbrl:Entity': [],
                    'sec:Archive':[]
                };

                // fiscal year
                if((selection.fiscalYear.length || 0) > 0){
                    if(!hasLatest) {
                        selection.fiscalYear.forEach(
                            function (year) {
                                aspects['sec:FiscalYear'].push(parseInt(year, 10));
                            }
                        );
                    } else {
                        selection.fiscalYear = ['LATEST'];
                    }
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

                if(hasLatest) {
                    // restrict sec:Archives in case Fiscal Year is latest
                    var parameters = {
                        $method: 'POST',
                        cik: aspects['xbrl:Entity'],
                        fiscalYear: [ 'LATEST' ],
                        fiscalPeriod: aspects['sec:FiscalPeriod'],
                        token: Session.getToken()
                    };
                    API.Queries.listFilings(parameters)
                        .then(
                        function (filings) {
                            var archives = filings.Archives;
                            if ((archives.length || 0) > 0) {
                                if (aspects['sec:Archive'] === undefined) {
                                    aspects['sec:Archive'] = [];
                                }
                                archives.forEach(function (archive) {
                                    var aid = archive.AccessionNumber;
                                    if (!arrayContains(aspects['sec:Archive'], aid)) {
                                        aspects['sec:Archive'].push(aid);
                                    }
                                });
                            }
                            deferred.resolve(aspects);
                        }
                    );
                } else {
                    deferred.resolve(aspects);
                }

                return deferred.promise;
            }

            function resetSelection(report){
                var deferred = $q.defer();

                selection = report.resetFilters();

                var date = new Date();
                var year = date.getFullYear();
                var month = date.getMonth();
                if(month < 8){
                    year = year - 1;
                }
                var yearsPromise = getYears()
                    .then(function(years){
                        if(arrayContains(years, year)){
                            selection.fiscalYear = [year];
                        } else {
                            selection.fiscalYear = [years[1]];
                        }
                    });
                var periodsPromise = getPeriods()
                    .then(function(periods){selection.fiscalPeriod = [periods[0]];});
                $q.all([yearsPromise, periodsPromise])
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
                isLatestFiscalYearSelected: isLatestFiscalYearSelected,
                getPeriods: getPeriods,
                getTags: getTags,
                getSelection: getSelection,
                resetSelection: resetSelection,
                getAspects: getAspects
            };
        })();
    });
