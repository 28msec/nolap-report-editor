'use strict';

/* global accounting : false */

angular.module('report-editor')
.controller('FactTableCtrl', function($scope, Session, API, report, API_URL) {
    $scope.columns = [];
    $scope.data = null;
    $scope.error = null;
    $scope.loading = false;
    
	$scope.reload = function() {
		  var params = { report: report[0]["_id"], token: Session.getToken(), $method: 'POST' };		  
		  //params.aik = "0000021344-14-000008";	
		  
		  $scope.loading = true;
		  $scope.data = null;
		  $scope.error = null;
		  
		  API.Queries.listFactTableForReport(params).then(function(data){		  
			console.log(data);
		    $scope.data = data.FactTable;	
		    $scope.error = null;
		    
		    if ($scope.data && $scope.data.length > 0)
		    {
		        $scope.columns.push('xbrl:Entity');
		        $scope.columns.push('xbrl:Period');
		        $scope.columns.push('xbrl:Concept');
		        var insertIndex = 3;
		        Object.keys($scope.data[0].Aspects).forEach(function (key) {
		            switch (key)
		            {
		                case 'xbrl:Entity':
		                    $scope.entityIndex = 0;
		                    break;
		                case 'xbrl:Concept':
		                case 'xbrl:Period':
		                case 'sec:Accepted':
		                case 'sec:FiscalYear':
		                case 'sec:FiscalPeriod':
		                case 'sec:Archive':
		                    break;
		                case 'dei:LegalEntityAxis':
		                    $scope.columns.splice(insertIndex, 0, key);
		                    insertIndex++;
		                    break;
		                default:
		                    $scope.columns.splice(insertIndex, 0, key);
		            }
		        });
		    }
		    
		    $scope.loading = false;
		    		    		    
		  })
		  .catch(function(error){
            $scope.loading = false;
            $scope.data = null;
            $scope.error = error;
          });;
	  };
	  
	$scope.reload();
	/*
	var facttable = {
		  'CIK' : 'http://www.sec.gov/CIK 0000021344', 
		  'EntityRegistrantName' : 'COCA COLA CO', 
		  'TableName' : 'us-gaap:StatementTable', 
		  'Label' : '1001000 - Statement - CONSOLIDATED STATEMENTS OF INCOME', 
		  'AccessionNumber' : '0000021344-14-000008', 
		  'FormType' : '10-K', 
		  'FiscalPeriod' : 'FY', 
		  'FiscalYear' : 2013, 
		  'AcceptanceDatetime' : '2014-02-27T13:24:23Z', 
		  'NetworkIdentifier' : 'http://www.thecocacolacompany.com/role/ConsolidatedStatementsOfIncome', 
		  'Disclosure' : 'IncomeStatement', 
		  'FactTable' : [ {
		    'Aspects' : {
		      'xbrl:Entity' : 'http://www.sec.gov/CIK 0000021344', 
		      'dei:LegalEntityAxis' : 'sec:DefaultLegalEntity', 
		      'xbrl:Period' : '2013-01-01/2013-12-31', 
		      'xbrl:Concept' : 'ko:UnusualOrInfrequentItemOperating', 
		      'sec:Archive' : '0000021344-14-000008', 
		      'sec:FiscalPeriod' : 'FY', 
		      'sec:FiscalYear' : 2013, 
		      'sec:Accepted' : '20140227132423', 
		      'us-gaap:StatementScenarioAxis' : 'us-gaap:ScenarioUnspecifiedDomain'
		    }, 
		    'Type' : 'NumericValue', 
		    'Value' : 895000000, 
		    'Decimals' : -6, 
		    'Unit' : 'iso4217:USD'
		  }, {
		    'Aspects' : {
		      'xbrl:Entity' : 'http://www.sec.gov/CIK 0000021344', 
		      'dei:LegalEntityAxis' : 'sec:DefaultLegalEntity', 
		      'xbrl:Period' : '2013-01-01/2013-12-31', 
		      'xbrl:Concept' : 'us-gaap:CostOfGoodsSold', 
		      'sec:Archive' : '0000021344-14-000008', 
		      'sec:FiscalPeriod' : 'FY', 
		      'sec:FiscalYear' : 2013, 
		      'sec:Accepted' : '20140227132423', 
		      'us-gaap:StatementScenarioAxis' : 'us-gaap:ScenarioUnspecifiedDomain'
		    }, 
		    'Type' : 'NumericValue', 
		    'Value' : 18421000000, 
		    'Decimals' : -6, 
		    'Unit' : 'iso4217:USD'
		  }, {
		    'Aspects' : {
		      'xbrl:Entity' : 'http://www.sec.gov/CIK 0000021344', 
		      'dei:LegalEntityAxis' : 'sec:DefaultLegalEntity', 
		      'xbrl:Period' : '2013-01-01/2013-12-31', 
		      'xbrl:Concept' : 'us-gaap:EarningsPerShareBasic', 
		      'sec:Archive' : '0000021344-14-000008', 
		      'sec:FiscalPeriod' : 'FY', 
		      'sec:FiscalYear' : 2013, 
		      'sec:Accepted' : '20140227132423', 
		      'us-gaap:StatementScenarioAxis' : 'us-gaap:ScenarioUnspecifiedDomain'
		    }, 
		    'Type' : 'NumericValue', 
		    'Value' : 1.94, 
		    'Decimals' : 2, 
		    'Unit' : 'iso4217:USD / xbrli:shares'
		  }, {
		    'Aspects' : {
		      'xbrl:Entity' : 'http://www.sec.gov/CIK 0000021344', 
		      'dei:LegalEntityAxis' : 'sec:DefaultLegalEntity', 
		      'xbrl:Period' : '2013-01-01/2013-12-31', 
		      'xbrl:Concept' : 'us-gaap:EarningsPerShareDiluted', 
		      'sec:Archive' : '0000021344-14-000008', 
		      'sec:FiscalPeriod' : 'FY', 
		      'sec:FiscalYear' : 2013, 
		      'sec:Accepted' : '20140227132423', 
		      'us-gaap:StatementScenarioAxis' : 'us-gaap:ScenarioUnspecifiedDomain'
		    }, 
		    'Type' : 'NumericValue', 
		    'Value' : 1.9, 
		    'Decimals' : 2, 
		    'Unit' : 'iso4217:USD / xbrli:shares'
		  }, {
		    'Aspects' : {
		      'xbrl:Entity' : 'http://www.sec.gov/CIK 0000021344', 
		      'dei:LegalEntityAxis' : 'sec:DefaultLegalEntity', 
		      'xbrl:Period' : '2013-01-01/2013-12-31', 
		      'xbrl:Concept' : 'us-gaap:GrossProfit', 
		      'sec:Archive' : '0000021344-14-000008', 
		      'sec:FiscalPeriod' : 'FY', 
		      'sec:FiscalYear' : 2013, 
		      'sec:Accepted' : '20140227132423', 
		      'us-gaap:StatementScenarioAxis' : 'us-gaap:ScenarioUnspecifiedDomain'
		    }, 
		    'Type' : 'NumericValue', 
		    'Value' : 28433000000, 
		    'Decimals' : -6, 
		    'Unit' : 'iso4217:USD'
		  }, {
		    'Aspects' : {
		      'xbrl:Entity' : 'http://www.sec.gov/CIK 0000021344', 
		      'dei:LegalEntityAxis' : 'sec:DefaultLegalEntity', 
		      'xbrl:Period' : '2013-01-01/2013-12-31', 
		      'xbrl:Concept' : 'us-gaap:IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest', 
		      'sec:Archive' : '0000021344-14-000008', 
		      'sec:FiscalPeriod' : 'FY', 
		      'sec:FiscalYear' : 2013, 
		      'sec:Accepted' : '20140227132423', 
		      'us-gaap:StatementScenarioAxis' : 'us-gaap:ScenarioUnspecifiedDomain'
		    }, 
		    'Type' : 'NumericValue', 
		    'Value' : 11477000000, 
		    'Decimals' : -6, 
		    'Unit' : 'iso4217:USD'
		  }, {
		    'Aspects' : {
		      'xbrl:Entity' : 'http://www.sec.gov/CIK 0000021344', 
		      'dei:LegalEntityAxis' : 'sec:DefaultLegalEntity', 
		      'xbrl:Period' : '2013-01-01/2013-12-31', 
		      'xbrl:Concept' : 'us-gaap:IncomeLossFromEquityMethodInvestments', 
		      'sec:Archive' : '0000021344-14-000008', 
		      'sec:FiscalPeriod' : 'FY', 
		      'sec:FiscalYear' : 2013, 
		      'sec:Accepted' : '20140227132423', 
		      'us-gaap:StatementScenarioAxis' : 'us-gaap:ScenarioUnspecifiedDomain'
		    }, 
		    'Type' : 'NumericValue', 
		    'Value' : 602000000, 
		    'Decimals' : -6, 
		    'Unit' : 'iso4217:USD'
		  }, {
		    'Aspects' : {
		      'xbrl:Entity' : 'http://www.sec.gov/CIK 0000021344', 
		      'dei:LegalEntityAxis' : 'sec:DefaultLegalEntity', 
		      'xbrl:Period' : '2013-01-01/2013-12-31', 
		      'xbrl:Concept' : 'us-gaap:IncomeTaxExpenseBenefit', 
		      'sec:Archive' : '0000021344-14-000008', 
		      'sec:FiscalPeriod' : 'FY', 
		      'sec:FiscalYear' : 2013, 
		      'sec:Accepted' : '20140227132423', 
		      'us-gaap:StatementScenarioAxis' : 'us-gaap:ScenarioUnspecifiedDomain'
		    }, 
		    'Type' : 'NumericValue', 
		    'Value' : 2851000000, 
		    'Decimals' : -6, 
		    'Unit' : 'iso4217:USD'
		  }, {
		    'Aspects' : {
		      'xbrl:Entity' : 'http://www.sec.gov/CIK 0000021344', 
		      'dei:LegalEntityAxis' : 'sec:DefaultLegalEntity', 
		      'xbrl:Period' : '2013-01-01/2013-12-31', 
		      'xbrl:Concept' : 'us-gaap:InterestExpense', 
		      'sec:Archive' : '0000021344-14-000008', 
		      'sec:FiscalPeriod' : 'FY', 
		      'sec:FiscalYear' : 2013, 
		      'sec:Accepted' : '20140227132423', 
		      'us-gaap:StatementScenarioAxis' : 'us-gaap:ScenarioUnspecifiedDomain'
		    }, 
		    'Type' : 'NumericValue', 
		    'Value' : 463000000, 
		    'Decimals' : -6, 
		    'Unit' : 'iso4217:USD'
		  }, {
		    'Aspects' : {
		      'xbrl:Entity' : 'http://www.sec.gov/CIK 0000021344', 
		      'dei:LegalEntityAxis' : 'sec:DefaultLegalEntity', 
		      'xbrl:Period' : '2013-01-01/2013-12-31', 
		      'xbrl:Concept' : 'us-gaap:InvestmentIncomeInterest', 
		      'sec:Archive' : '0000021344-14-000008', 
		      'sec:FiscalPeriod' : 'FY', 
		      'sec:FiscalYear' : 2013, 
		      'sec:Accepted' : '20140227132423', 
		      'us-gaap:StatementScenarioAxis' : 'us-gaap:ScenarioUnspecifiedDomain'
		    }, 
		    'Type' : 'NumericValue', 
		    'Value' : 534000000, 
		    'Decimals' : -6, 
		    'Unit' : 'iso4217:USD'
		  }, {
		    'Aspects' : {
		      'xbrl:Entity' : 'http://www.sec.gov/CIK 0000021344', 
		      'dei:LegalEntityAxis' : 'sec:DefaultLegalEntity', 
		      'xbrl:Period' : '2013-01-01/2013-12-31', 
		      'xbrl:Concept' : 'us-gaap:NetIncomeLoss', 
		      'sec:Archive' : '0000021344-14-000008', 
		      'sec:FiscalPeriod' : 'FY', 
		      'sec:FiscalYear' : 2013, 
		      'sec:Accepted' : '20140227132423', 
		      'us-gaap:StatementScenarioAxis' : 'us-gaap:ScenarioUnspecifiedDomain'
		    }, 
		    'Type' : 'NumericValue', 
		    'Value' : 8584000000, 
		    'Decimals' : -6, 
		    'Unit' : 'iso4217:USD'
		  }, {
		    'Aspects' : {
		      'xbrl:Entity' : 'http://www.sec.gov/CIK 0000021344', 
		      'dei:LegalEntityAxis' : 'sec:DefaultLegalEntity', 
		      'xbrl:Period' : '2013-01-01/2013-12-31', 
		      'xbrl:Concept' : 'us-gaap:NetIncomeLossAttributableToNoncontrollingInterest', 
		      'sec:Archive' : '0000021344-14-000008', 
		      'sec:FiscalPeriod' : 'FY', 
		      'sec:FiscalYear' : 2013, 
		      'sec:Accepted' : '20140227132423', 
		      'us-gaap:StatementScenarioAxis' : 'us-gaap:ScenarioUnspecifiedDomain'
		    }, 
		    'Type' : 'NumericValue', 
		    'Value' : 42000000, 
		    'Decimals' : -6, 
		    'Unit' : 'iso4217:USD'
		  }, {
		    'Aspects' : {
		      'xbrl:Entity' : 'http://www.sec.gov/CIK 0000021344', 
		      'dei:LegalEntityAxis' : 'sec:DefaultLegalEntity', 
		      'xbrl:Period' : '2013-01-01/2013-12-31', 
		      'xbrl:Concept' : 'us-gaap:OperatingIncomeLoss', 
		      'sec:Archive' : '0000021344-14-000008', 
		      'sec:FiscalPeriod' : 'FY', 
		      'sec:FiscalYear' : 2013, 
		      'sec:Accepted' : '20140227132423', 
		      'us-gaap:StatementScenarioAxis' : 'us-gaap:ScenarioUnspecifiedDomain'
		    }, 
		    'Type' : 'NumericValue', 
		    'Value' : 10228000000, 
		    'Decimals' : -6, 
		    'Unit' : 'iso4217:USD'
		  }, {
		    'Aspects' : {
		      'xbrl:Entity' : 'http://www.sec.gov/CIK 0000021344', 
		      'dei:LegalEntityAxis' : 'sec:DefaultLegalEntity', 
		      'xbrl:Period' : '2013-01-01/2013-12-31', 
		      'xbrl:Concept' : 'us-gaap:OtherNonoperatingIncomeExpense', 
		      'sec:Archive' : '0000021344-14-000008', 
		      'sec:FiscalPeriod' : 'FY', 
		      'sec:FiscalYear' : 2013, 
		      'sec:Accepted' : '20140227132423', 
		      'us-gaap:StatementScenarioAxis' : 'us-gaap:ScenarioUnspecifiedDomain'
		    }, 
		    'Type' : 'NumericValue', 
		    'Value' : 576000000, 
		    'Decimals' : -6, 
		    'Unit' : 'iso4217:USD'
		  }, {
		    'Aspects' : {
		      'xbrl:Entity' : 'http://www.sec.gov/CIK 0000021344', 
		      'dei:LegalEntityAxis' : 'sec:DefaultLegalEntity', 
		      'xbrl:Period' : '2013-01-01/2013-12-31', 
		      'xbrl:Concept' : 'us-gaap:ProfitLoss', 
		      'sec:Archive' : '0000021344-14-000008', 
		      'sec:FiscalPeriod' : 'FY', 
		      'sec:FiscalYear' : 2013, 
		      'sec:Accepted' : '20140227132423', 
		      'us-gaap:StatementScenarioAxis' : 'us-gaap:ScenarioUnspecifiedDomain'
		    }, 
		    'Type' : 'NumericValue', 
		    'Value' : 8626000000, 
		    'Decimals' : -6, 
		    'Unit' : 'iso4217:USD'
		  }, {
		    'Aspects' : {
		      'xbrl:Entity' : 'http://www.sec.gov/CIK 0000021344', 
		      'dei:LegalEntityAxis' : 'sec:DefaultLegalEntity', 
		      'xbrl:Period' : '2013-01-01/2013-12-31', 
		      'xbrl:Concept' : 'us-gaap:SalesRevenueGoodsNet', 
		      'sec:Archive' : '0000021344-14-000008', 
		      'sec:FiscalPeriod' : 'FY', 
		      'sec:FiscalYear' : 2013, 
		      'sec:Accepted' : '20140227132423', 
		      'us-gaap:StatementScenarioAxis' : 'us-gaap:ScenarioUnspecifiedDomain'
		    }, 
		    'Type' : 'NumericValue', 
		    'Value' : 46854000000, 
		    'Decimals' : -6, 
		    'Unit' : 'iso4217:USD'
		  }, {
		    'Aspects' : {
		      'xbrl:Entity' : 'http://www.sec.gov/CIK 0000021344', 
		      'dei:LegalEntityAxis' : 'sec:DefaultLegalEntity', 
		      'xbrl:Period' : '2013-01-01/2013-12-31', 
		      'xbrl:Concept' : 'us-gaap:SellingGeneralAndAdministrativeExpense', 
		      'sec:Archive' : '0000021344-14-000008', 
		      'sec:FiscalPeriod' : 'FY', 
		      'sec:FiscalYear' : 2013, 
		      'sec:Accepted' : '20140227132423', 
		      'us-gaap:StatementScenarioAxis' : 'us-gaap:ScenarioUnspecifiedDomain'
		    }, 
		    'Type' : 'NumericValue', 
		    'Value' : 17310000000, 
		    'Decimals' : -6, 
		    'Unit' : 'iso4217:USD'
		  }, {
		    'Aspects' : {
		      'xbrl:Entity' : 'http://www.sec.gov/CIK 0000021344', 
		      'dei:LegalEntityAxis' : 'sec:DefaultLegalEntity', 
		      'xbrl:Period' : '2013-01-01/2013-12-31', 
		      'xbrl:Concept' : 'us-gaap:WeightedAverageNumberDilutedSharesOutstandingAdjustment', 
		      'sec:Archive' : '0000021344-14-000008', 
		      'sec:FiscalPeriod' : 'FY', 
		      'sec:FiscalYear' : 2013, 
		      'sec:Accepted' : '20140227132423', 
		      'us-gaap:StatementScenarioAxis' : 'us-gaap:ScenarioUnspecifiedDomain'
		    }, 
		    'Type' : 'NumericValue', 
		    'Value' : 75000000, 
		    'Decimals' : -6, 
		    'Unit' : 'xbrli:shares'
		  }, {
		    'Aspects' : {
		      'xbrl:Entity' : 'http://www.sec.gov/CIK 0000021344', 
		      'dei:LegalEntityAxis' : 'sec:DefaultLegalEntity', 
		      'xbrl:Period' : '2013-01-01/2013-12-31', 
		      'xbrl:Concept' : 'us-gaap:WeightedAverageNumberOfDilutedSharesOutstanding', 
		      'sec:Archive' : '0000021344-14-000008', 
		      'sec:FiscalPeriod' : 'FY', 
		      'sec:FiscalYear' : 2013, 
		      'sec:Accepted' : '20140227132423', 
		      'us-gaap:StatementScenarioAxis' : 'us-gaap:ScenarioUnspecifiedDomain'
		    }, 
		    'Type' : 'NumericValue', 
		    'Value' : 4509000000, 
		    'Decimals' : -6, 
		    'Unit' : 'xbrli:shares'
		  }, {
		    'Aspects' : {
		      'xbrl:Entity' : 'http://www.sec.gov/CIK 0000021344', 
		      'dei:LegalEntityAxis' : 'sec:DefaultLegalEntity', 
		      'xbrl:Period' : '2013-01-01/2013-12-31', 
		      'xbrl:Concept' : 'us-gaap:WeightedAverageNumberOfSharesOutstandingBasic', 
		      'sec:Archive' : '0000021344-14-000008', 
		      'sec:FiscalPeriod' : 'FY', 
		      'sec:FiscalYear' : 2013, 
		      'sec:Accepted' : '20140227132423', 
		      'us-gaap:StatementScenarioAxis' : 'us-gaap:ScenarioUnspecifiedDomain'
		    }, 
		    'Type' : 'NumericValue', 
		    'Value' : 4434000000, 
		    'Decimals' : -6, 
		    'Unit' : 'xbrli:shares'
		  } ], 
		  'Comment' : 'Generated by 28.io, for more information see http://www.28.io/xbrl (2014-07-02T10:16:34.608976Z)', 
		  'Statistics' : {
		    'NumFacts' : 20, 
		    'TotalNumFacts' : 68640646, 
		    'TotalNumArchives' : 96842, 
		    'TotalNumEntities' : 9576
		  }
		};
		*/
	
	

  

    /*
    $scope.Label = facttable.Label;
    $scope.cik = (facttable.CIK || '').substring(23);
    $scope.EntityRegistrantName = facttable.EntityRegistrantName;
    $scope.NetworkIdentifier = facttable.NetworkIdentifier;
    var p = facttable.Label.lastIndexOf(' - ');
    if (p > 0) {
        $scope.component = facttable.Label.substring(p+3);
    } else {
        $scope.component = facttable.Label;
    }
    $scope.AccessionNumber = facttable.AccessionNumber;
    $scope.Table = facttable.TableName;
    $scope.FiscalYear = facttable.FiscalYear;
    $scope.FiscalPeriod = facttable.FiscalPeriod;
    $scope.AcceptanceDatetime = facttable.AcceptanceDatetime;
    $scope.FormType = facttable.FormType;
    */

  

  
    $scope.showText = function(html) {
        $scope.$emit('alert', 'Text Details', html);
    };

    $scope.showNumber = function(value) {
        return accounting.formatNumber(value);
    };

    $scope.isBlock = function(string) {
        if (!string) {
            return false;
        }
        return string.length > 60;
    };
    
    $scope.getExportURL = function(format) {
        return API_URL + '/_queries/public/api/facttable-for-report.jq?_method=POST&format=' + format + '&report=' + encodeURIComponent(report._id) + '&token=' + Session.getToken();
    };
       
});
