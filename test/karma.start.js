var fail = function (msg) {
    expect('should not reach this!: ' + msg).toEqual('failure');
};

var Report = {}, $rootScope, $httpBackend, $cacheFactory;
beforeEach(module('nolap.report.editor'));

beforeEach(inject(function (_$rootScope_, _$httpBackend_, _$cacheFactory_, Report) {
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    $cacheFactory = _$cacheFactory_;
    API.Report = Report;
}));

afterEach(function () {});
