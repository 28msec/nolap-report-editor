describe('Basic Test', function () {
    'use strict';

    /* global Report */

    it('Create a New Report', function () {
        var report = new Report({
            '_id' : 'ReportName',
            'Archive' : null,
            'Label' : 'Report Label',
            'Description': 'Default report',
            'Role' : 'http://my.com/report-role',
            'Networks' : [],
            'Hypercubes' : {},
            'Rules' : []
        });
        var model = report.getModel();
        expect(model._id).toBeDefined();
        expect(model._id).toEqual('ReportName');
    });
});
