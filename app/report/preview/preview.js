'use strict';

angular.module('report-editor')
.controller('PreviewCtrl', function($scope, Session, API, report, API_URL){
	  $scope.mymodel = null;
	  $scope.error = null;
	  $scope.labelidx = 0;
	  $scope.constraints = true;
	  $scope.checks = true;	  
	  $scope.css = 'preview-style';
	  $scope.loading = true;
	  		  
	  $scope.reload = function() {
		  console.log(report);		  
		  var id = report[0]["_id"];
		  console.log("id: "+ id);
		  var params = { report: id, validate : true, token: Session.getToken(), $method: 'POST' };
		  //params.cik = "0000021344";
		  //params.fiscalYear = "2013";
		  //params.fiscalPeriod = "";
		  API.Queries.listSpreadsheetForReport(params).then(function(data){		  
			console.log(data);
		    $scope.mymodel = data;
		    $scope.error = null;
		    $scope.loading = false;
		  })
		  .catch(function(error){
            $scope.loading = false;
            $scope.mymodel = null;
            $scope.error = error;
          });
	  };
	  
	  $scope.getExportURL = function(format) {
	       return API_URL + '/_queries/public/api/spreadsheet-for-report.jq?_method=POST&format=' + format + '&report=' + encodeURIComponent(report._id) + '&token=' + Session.getToken();
	  };
	  
	  $scope.reload();
	  
	  /*
	  {
			  'ModelKind' : 'LayoutModel', 
			  'TableSetLabels' : [ 'Grid' ], 
			  'TableSet' : [ {
			    'TableHeaders' : {
			      'x' : [ {
			        'GroupLabels' : [ 'Director Breakdown' ], 
			        'GroupCells' : [ [ {
			          'CellLabels' : [ 'Equity [Member]', 'pattern:EquityMember' ], 
			          'CellConstraints' : {
			            '' : {
			              'pattern:EquityComponentAxis' : 'pattern:EquityMember'
			            }
			          }, 
			          'TagSelectors' : [  ], 
			          'CellSpan' : 4, 
			          'RollUp' : false, 
			          'IsRollUp' : false
			        } ], [ {
			          'CellLabels' : [ 'Common Stock [Member]', 'pattern:CommonStockMember' ], 
			          'CellConstraints' : {
			            '' : {
			              'pattern:EquityComponentAxis' : 'pattern:CommonStockMember'
			            }
			          }, 
			          'TagSelectors' : [  ], 
			          'CellSpan' : 1, 
			          'RollUp' : false, 
			          'IsRollUp' : false
			        }, {
			          'CellLabels' : [ 'Retained Earnings (Accumulated Deficit) [Member]', 'pattern:RetainedEarningsAccumulatedDeficitMember' ], 
			          'CellConstraints' : {
			            '' : {
			              'pattern:EquityComponentAxis' : 'pattern:RetainedEarningsAccumulatedDeficitMember'
			            }
			          }, 
			          'TagSelectors' : [  ], 
			          'CellSpan' : 1, 
			          'RollUp' : false, 
			          'IsRollUp' : false
			        }, {
			          'CellLabels' : [ 'Additional Paid-in Capital [Member]', 'pattern:AdditionalPaidInCapitalMember' ], 
			          'CellConstraints' : {
			            '' : {
			              'pattern:EquityComponentAxis' : 'pattern:AdditionalPaidInCapitalMember'
			            }
			          }, 
			          'TagSelectors' : [  ], 
			          'CellSpan' : 1, 
			          'RollUp' : false, 
			          'IsRollUp' : false
			        }, {
			          'CellLabels' : [  ], 
			          'CellConstraints' : {
			            '' : {

			            }
			          }, 
			          'TagSelectors' : [  ], 
			          'CellSpan' : 1, 
			          'RollUp' : true, 
			          'IsRollUp' : false
			        } ] ]
			      }, {
			        'GroupLabels' : [ 'Period' ], 
			        'GroupCells' : [ [ {
			          'CellLabels' : [ '2010', '2010-01-01/2010-12-31' ], 
			          'CellConstraints' : {
			            '' : {
			              'xbrl:Period' : '2010-01-01/2010-12-31'
			            }, 
			            'before' : {
			              'xbrl:Period' : '2009-12-31'
			            }, 
			            'after' : {
			              'xbrl:Period' : '2010-12-31'
			            }
			          }, 
			          'TagSelectors' : [  ], 
			          'CellSpan' : 1, 
			          'RollUp' : false, 
			          'IsRollUp' : false
			        }, {
			          'CellLabels' : [ '2010', '2010-01-01/2010-12-31' ], 
			          'CellConstraints' : {
			            '' : {
			              'xbrl:Period' : '2010-01-01/2010-12-31'
			            }, 
			            'before' : {
			              'xbrl:Period' : '2009-12-31'
			            }, 
			            'after' : {
			              'xbrl:Period' : '2010-12-31'
			            }
			          }, 
			          'TagSelectors' : [  ], 
			          'CellSpan' : 1, 
			          'RollUp' : false, 
			          'IsRollUp' : false
			        }, {
			          'CellLabels' : [ '2010', '2010-01-01/2010-12-31' ], 
			          'CellConstraints' : {
			            '' : {
			              'xbrl:Period' : '2010-01-01/2010-12-31'
			            }, 
			            'before' : {
			              'xbrl:Period' : '2009-12-31'
			            }, 
			            'after' : {
			              'xbrl:Period' : '2010-12-31'
			            }
			          }, 
			          'TagSelectors' : [  ], 
			          'CellSpan' : 1, 
			          'RollUp' : false, 
			          'IsRollUp' : false
			        }, {
			          'CellLabels' : [ '2010', '2010-01-01/2010-12-31' ], 
			          'CellConstraints' : {
			            '' : {
			              'xbrl:Period' : '2010-01-01/2010-12-31'
			            }, 
			            'before' : {
			              'xbrl:Period' : '2009-12-31'
			            }, 
			            'after' : {
			              'xbrl:Period' : '2010-12-31'
			            }
			          }, 
			          'TagSelectors' : [  ], 
			          'CellSpan' : 1, 
			          'RollUp' : false, 
			          'IsRollUp' : false
			        } ] ]
			      } ], 
			      'y' : [ {
			        'GroupLabels' : [ 'Breakdown on concepts' ], 
			        'GroupCells' : [ [ {
			          'CellLabels' : [ 'Equity, Beginning Balance', 'Equity, Ending Balance', 'Equity', 'pattern:Equity' ], 
			          'CellConstraints' : {
			            '' : {
			              'xbrl:Concept' : 'pattern:Equity'
			            }
			          }, 
			          'TagSelectors' : [ 'before' ], 
			          'IsRollUp' : false, 
			          'Depth' : 1
			        }, {
			          'CellLabels' : [ 'Net Income (Loss)', 'Net Income (Loss)', 'pattern:NetIncomeLoss' ], 
			          'CellConstraints' : {
			            '' : {
			              'xbrl:Concept' : 'pattern:NetIncomeLoss'
			            }
			          }, 
			          'TagSelectors' : [  ], 
			          'IsRollUp' : false, 
			          'Depth' : 1
			        }, {
			          'CellLabels' : [ 'Common Stock Issued', 'Common Stock Issued', 'pattern:CommonStockIssued' ], 
			          'CellConstraints' : {
			            '' : {
			              'xbrl:Concept' : 'pattern:CommonStockIssued'
			            }
			          }, 
			          'TagSelectors' : [  ], 
			          'IsRollUp' : false, 
			          'Depth' : 1
			        }, {
			          'CellLabels' : [ 'Dividends', 'Dividends', 'pattern:Dividends' ], 
			          'CellConstraints' : {
			            '' : {
			              'xbrl:Concept' : 'pattern:Dividends'
			            }
			          }, 
			          'TagSelectors' : [  ], 
			          'IsRollUp' : false, 
			          'Depth' : 1
			        }, {
			          'CellLabels' : [ 'Equity, Ending Balance', 'Equity, Ending Balance', 'Equity', 'pattern:Equity' ], 
			          'CellConstraints' : {
			            '' : {
			              'xbrl:Concept' : 'pattern:Equity'
			            }
			          }, 
			          'TagSelectors' : [ 'after' ], 
			          'IsRollUp' : false, 
			          'Depth' : 1
			        } ] ]
			      } ]
			    }, 
			    'TableCells' : {
			      'AxisOrder' : [ 'y', 'x' ], 
			      'Facts' : [ [ {
			        '_id' : '8e089c78-db99-40e5-a50e-b91325af2b1b', 
			        'Archive' : '09-Grid', 
			        'IsInDefaultHypercube' : false, 
			        'Aspects' : {
			          'xbrl:Concept' : 'pattern:Equity', 
			          'xbrl:Entity' : 'http://www.SampleCompany.com SAMP', 
			          'xbrl:Period' : '2009-12-31', 
			          'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			          'pattern:EquityComponentAxis' : 'pattern:CommonStockMember', 
			          'xbrl:Unit' : 'iso4217:USD'
			        }, 
			        'Type' : 'NumericValue', 
			        'Value' : 150000, 
			        'Valid' : true, 'Decimals' : 'INF'
			      }, {
			        '_id' : 'bc373c83-867b-48b4-9091-56a3d2396b51', 
			        'Archive' : '09-Grid', 
			        'IsInDefaultHypercube' : false, 
			        'Aspects' : {
			          'xbrl:Concept' : 'pattern:Equity', 
			          'xbrl:Entity' : 'http://www.SampleCompany.com SAMP', 
			          'xbrl:Period' : '2009-12-31', 
			          'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			          'pattern:EquityComponentAxis' : 'pattern:RetainedEarningsAccumulatedDeficitMember', 
			          'xbrl:Unit' : 'iso4217:USD'
			        }, 
			        'Type' : 'NumericValue', 
			        'Value' : 200000, 
			        'Valid' : true, 'Decimals' : 'INF'
			      }, {
			        '_id' : '248bc2c3-319c-4dee-a0ab-d33dc16dfedf', 
			        'Archive' : '09-Grid', 
			        'IsInDefaultHypercube' : false, 
			        'Aspects' : {
			          'xbrl:Concept' : 'pattern:Equity', 
			          'xbrl:Entity' : 'http://www.SampleCompany.com SAMP', 
			          'xbrl:Period' : '2009-12-31', 
			          'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			          'pattern:EquityComponentAxis' : 'pattern:AdditionalPaidInCapitalMember', 
			          'xbrl:Unit' : 'iso4217:USD'
			        }, 
			        'Type' : 'NumericValue', 
			        'Value' : 50000, 
			        'Valid' : true, 'Decimals' : 'INF'
			      }, {
			        '_id' : 'a0700b7c-a405-46ba-abc5-b46ebf600798', 
			        'Archive' : '09-Grid', 
			        'IsInDefaultHypercube' : false, 
			        'Aspects' : {
			          'xbrl:Concept' : 'pattern:Equity', 
			          'xbrl:Entity' : 'http://www.SampleCompany.com SAMP', 
			          'xbrl:Period' : '2009-12-31', 
			          'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			          'pattern:EquityComponentAxis' : 'pattern:EquityMember', 
			          'xbrl:Unit' : 'iso4217:USD'
			        }, 
			        'Type' : 'NumericValue', 
			        'Value' : 400000, 
			        'Valid' : true, 'Decimals' : 'INF'
			      } ], [ {
			        'Aspects' : {
			          'xbrl:Period' : '2010-01-01/2010-12-31', 
			          'pattern:EquityComponentAxis' : 'pattern:CommonStockMember', 
			          'xbrl:Concept' : 'pattern:NetIncomeLoss', 
			          'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			          'xbrl:Entity' : 'http://www.SampleCompany.com SAMP'
			        }
			      }, {
			        '_id' : '13ba8d62-9f3c-4a77-80d1-8651a01dec32', 
			        'Archive' : '09-Grid', 
			        'IsInDefaultHypercube' : false, 
			        'Aspects' : {
			          'xbrl:Concept' : 'pattern:NetIncomeLoss', 
			          'xbrl:Entity' : 'http://www.SampleCompany.com SAMP', 
			          'xbrl:Period' : '2010-01-01/2010-12-31', 
			          'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			          'pattern:EquityComponentAxis' : 'pattern:RetainedEarningsAccumulatedDeficitMember', 
			          'xbrl:Unit' : 'iso4217:USD'
			        }, 
			        'Type' : 'NumericValue', 
			        'Value' : 200000, 
			        'Valid' : true, 'Decimals' : 'INF'
			      }, {
			        'Aspects' : {
			          'xbrl:Period' : '2010-01-01/2010-12-31', 
			          'pattern:EquityComponentAxis' : 'pattern:AdditionalPaidInCapitalMember', 
			          'xbrl:Concept' : 'pattern:NetIncomeLoss', 
			          'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			          'xbrl:Entity' : 'http://www.SampleCompany.com SAMP'
			        }
			      }, {
			        '_id' : '334d6461-f8c9-4862-9677-34e8cc681d46', 
			        'Archive' : '09-Grid', 
			        'IsInDefaultHypercube' : false, 
			        'Aspects' : {
			          'xbrl:Concept' : 'pattern:NetIncomeLoss', 
			          'xbrl:Entity' : 'http://www.SampleCompany.com SAMP', 
			          'xbrl:Period' : '2010-01-01/2010-12-31', 
			          'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			          'pattern:EquityComponentAxis' : 'pattern:EquityMember', 
			          'xbrl:Unit' : 'iso4217:USD'
			        }, 
			        'Type' : 'NumericValue', 
			        'Value' : 200000, 
			        'Valid' : true, 'Decimals' : 'INF'
			      } ], [ {
			        '_id' : 'e666278d-7cb7-4b74-ae58-44e9e97f0aac', 
			        'Archive' : '09-Grid', 
			        'IsInDefaultHypercube' : false, 
			        'Aspects' : {
			          'xbrl:Concept' : 'pattern:CommonStockIssued', 
			          'xbrl:Entity' : 'http://www.SampleCompany.com SAMP', 
			          'xbrl:Period' : '2010-01-01/2010-12-31', 
			          'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			          'pattern:EquityComponentAxis' : 'pattern:CommonStockMember', 
			          'xbrl:Unit' : 'iso4217:USD'
			        }, 
			        'Type' : 'NumericValue', 
			        'Value' : 25000, 
			        'Valid' : true, 'Decimals' : 'INF'
			      }, {
			        'Aspects' : {
			          'xbrl:Period' : '2010-01-01/2010-12-31', 
			          'pattern:EquityComponentAxis' : 'pattern:RetainedEarningsAccumulatedDeficitMember', 
			          'xbrl:Concept' : 'pattern:CommonStockIssued', 
			          'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			          'xbrl:Entity' : 'http://www.SampleCompany.com SAMP'
			        }
			      }, {
			        '_id' : '8db5774a-ff14-4fcb-bbf7-419e74d92ae9', 
			        'Archive' : '09-Grid', 
			        'IsInDefaultHypercube' : false, 
			        'Aspects' : {
			          'xbrl:Concept' : 'pattern:CommonStockIssued', 
			          'xbrl:Entity' : 'http://www.SampleCompany.com SAMP', 
			          'xbrl:Period' : '2010-01-01/2010-12-31', 
			          'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			          'pattern:EquityComponentAxis' : 'pattern:AdditionalPaidInCapitalMember', 
			          'xbrl:Unit' : 'iso4217:USD'
			        }, 
			        'Type' : 'NumericValue', 
			        'Value' : 25000, 
			        'Valid' : true, 'Decimals' : 'INF'
			      }, {
			        '_id' : 'ecb245d8-7eeb-42a2-965b-d7e39587098c', 
			        'Archive' : '09-Grid', 
			        'IsInDefaultHypercube' : false, 
			        'Aspects' : {
			          'xbrl:Concept' : 'pattern:CommonStockIssued', 
			          'xbrl:Entity' : 'http://www.SampleCompany.com SAMP', 
			          'xbrl:Period' : '2010-01-01/2010-12-31', 
			          'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			          'pattern:EquityComponentAxis' : 'pattern:EquityMember', 
			          'xbrl:Unit' : 'iso4217:USD'
			        }, 
			        'Type' : 'NumericValue', 
			        'Value' : 50000, 
			        'Valid' : true, 'Decimals' : 'INF'
			      } ], [ {
			        'Aspects' : {
			          'xbrl:Period' : '2010-01-01/2010-12-31', 
			          'pattern:EquityComponentAxis' : 'pattern:CommonStockMember', 
			          'xbrl:Concept' : 'pattern:Dividends', 
			          'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			          'xbrl:Entity' : 'http://www.SampleCompany.com SAMP'
			        }
			      }, {
			        '_id' : '851b2d54-137e-414c-ba79-d49bdfbab579', 
			        'Archive' : '09-Grid', 
			        'IsInDefaultHypercube' : false, 
			        'Aspects' : {
			          'xbrl:Concept' : 'pattern:Dividends', 
			          'xbrl:Entity' : 'http://www.SampleCompany.com SAMP', 
			          'xbrl:Period' : '2010-01-01/2010-12-31', 
			          'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			          'pattern:EquityComponentAxis' : 'pattern:RetainedEarningsAccumulatedDeficitMember', 
			          'xbrl:Unit' : 'iso4217:USD'
			        }, 
			        'Type' : 'NumericValue', 
			        'Value' : 100000, 
			        'Valid' : true, 'Decimals' : 'INF'
			      }, {
			        'Aspects' : {
			          'xbrl:Period' : '2010-01-01/2010-12-31', 
			          'pattern:EquityComponentAxis' : 'pattern:AdditionalPaidInCapitalMember', 
			          'xbrl:Concept' : 'pattern:Dividends', 
			          'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			          'xbrl:Entity' : 'http://www.SampleCompany.com SAMP'
			        }
			      }, {
			        '_id' : '92442713-01bb-4b90-9a7c-b35f1d8e119f', 
			        'Archive' : '09-Grid', 
			        'IsInDefaultHypercube' : false, 
			        'Aspects' : {
			          'xbrl:Concept' : 'pattern:Dividends', 
			          'xbrl:Entity' : 'http://www.SampleCompany.com SAMP', 
			          'xbrl:Period' : '2010-01-01/2010-12-31', 
			          'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			          'pattern:EquityComponentAxis' : 'pattern:EquityMember', 
			          'xbrl:Unit' : 'iso4217:USD'
			        }, 
			        'Type' : 'NumericValue', 
			        'Value' : 100000, 
			        'Valid' : true, 'Decimals' : 'INF'
			      } ], [ {
			        '_id' : '17aff72d-dbdb-4efb-b150-17b04a986a16', 
			        'Archive' : '09-Grid', 
			        'IsInDefaultHypercube' : false, 
			        'Aspects' : {
			          'xbrl:Concept' : 'pattern:Equity', 
			          'xbrl:Entity' : 'http://www.SampleCompany.com SAMP', 
			          'xbrl:Period' : '2010-12-31', 
			          'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			          'pattern:EquityComponentAxis' : 'pattern:CommonStockMember', 
			          'xbrl:Unit' : 'iso4217:USD'
			        }, 
			        'Type' : 'NumericValue', 
			        'Value' : 175000, 
			        'Valid' : false, 'Decimals' : 'INF'
			      }, {
			        '_id' : '92e280a1-185e-475b-8240-b91f6146e19c', 
			        'Archive' : '09-Grid', 
			        'IsInDefaultHypercube' : false, 
			        'Aspects' : {
			          'xbrl:Concept' : 'pattern:Equity', 
			          'xbrl:Entity' : 'http://www.SampleCompany.com SAMP', 
			          'xbrl:Period' : '2010-12-31', 
			          'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			          'pattern:EquityComponentAxis' : 'pattern:RetainedEarningsAccumulatedDeficitMember', 
			          'xbrl:Unit' : 'iso4217:USD'
			        }, 
			        'Type' : 'NumericValue', 
			        'Value' : 300000, 
			        'Valid' : false, 'Decimals' : 'INF'
			      }, {
			        '_id' : '21bd0ca2-f0a9-47d0-be4e-32975f4b7a8e', 
			        'Archive' : '09-Grid', 
			        'IsInDefaultHypercube' : false, 
			        'Aspects' : {
			          'xbrl:Concept' : 'pattern:Equity', 
			          'xbrl:Entity' : 'http://www.SampleCompany.com SAMP', 
			          'xbrl:Period' : '2010-12-31', 
			          'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			          'pattern:EquityComponentAxis' : 'pattern:AdditionalPaidInCapitalMember', 
			          'xbrl:Unit' : 'iso4217:USD'
			        }, 
			        'Type' : 'NumericValue', 
			        'Value' : 75000, 
			        'Valid' : true, 'Decimals' : 'INF'
			      }, {
			        '_id' : '243b8569-5e1b-4eb6-a6ab-8254fa03a890', 
			        'Archive' : '09-Grid', 
			        'IsInDefaultHypercube' : false, 
			        'Aspects' : {
			          'xbrl:Concept' : 'pattern:Equity', 
			          'xbrl:Entity' : 'http://www.SampleCompany.com SAMP', 
			          'xbrl:Period' : '2010-12-31', 
			          'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			          'pattern:EquityComponentAxis' : 'pattern:EquityMember', 
			          'xbrl:Unit' : 'iso4217:USD'
			        }, 
			        'Type' : 'NumericValue', 
			        'Value' : 550000, 
			        'Valid' : true, 'Decimals' : 'INF'
			      } ] ]
			    }
			  } ], 
			  'GlobalConstraints' : {
			    'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			    'xbrl:Entity' : 'http://www.SampleCompany.com SAMP'
			  }, 
			  'GlobalConstraintLabels' : {
			    'frm:LegalEntityAxis' : {
			      'DimensionLabels' : [ 'Legal Entity [Axis]', 'frm:LegalEntityAxis' ], 
			      'ValueLabels' : [ 'Consolidated Entity [Member]', 'frm:ConsolidatedEntityMember' ]
			    }, 
			    'xbrl:Entity' : {
			      'DimensionLabels' : [ 'Implicit XBRL Entity Dimension', 'xbrl:Entity' ], 
			      'ValueLabels' : [ 'http://www.SampleCompany.com SAMP' ]
			    }
			  }, 
			  'DebugInfo' : {
			    'Hypercube' : {
			      'Name' : 'xbrl:UserDefinedHypercube', 
			      'Label' : 'User-defined Hypercube', 
			      'Aspects' : {
			        'xbrl:Concept' : {
			          'Name' : 'xbrl:Concept', 
			          'Label' : 'XBRL Concept Dimension', 
			          'Domains' : {
			            'xbrl:ConceptDomain' : {
			              'Name' : 'xbrl:ConceptDomain', 
			              'Label' : 'XBRL Concept Domain', 
			              'Members' : {
			                'pattern:Equity' : {
			                  'Name' : 'pattern:Equity'
			                }, 
			                'pattern:NetIncomeLoss' : {
			                  'Name' : 'pattern:NetIncomeLoss'
			                }, 
			                'pattern:CommonStockIssued' : {
			                  'Name' : 'pattern:CommonStockIssued'
			                }, 
			                'pattern:Dividends' : {
			                  'Name' : 'pattern:Dividends'
			                }
			              }
			            }
			          }
			        }, 
			        'xbrl:Entity' : {
			          'Name' : 'xbrl:Entity', 
			          'Label' : 'XBRL Entity Dimension', 
			          'Domains' : {
			            'xbrl:EntityDomain' : {
			              'Name' : 'xbrl:EntityDomain', 
			              'Label' : 'XBRL Entity Domain', 
			              'Members' : {
			                'http://www.SampleCompany.com SAMP' : {
			                  'Name' : 'http://www.SampleCompany.com SAMP'
			                }
			              }
			            }
			          }
			        }, 
			        'xbrl:Period' : {
			          'Name' : 'xbrl:Period', 
			          'Label' : 'XBRL Period Dimension', 
			          'Domains' : {
			            'xbrl:PeriodDomain' : {
			              'Name' : 'xbrl:PeriodDomain', 
			              'Label' : 'XBRL Period Domain', 
			              'Members' : {
			                '2010-01-01/2010-12-31' : {
			                  'Name' : '2010-01-01/2010-12-31'
			                }, 
			                '2009-12-31' : {
			                  'Name' : '2009-12-31'
			                }, 
			                '2010-12-31' : {
			                  'Name' : '2010-12-31'
			                }
			              }
			            }
			          }
			        }, 
			        'xbrl:Unit' : {
			          'Name' : 'xbrl:Unit', 
			          'Label' : 'XBRL Unit Dimension', 
			          'Default' : 'xbrl:NonNumeric'
			        }, 
			        'pattern:EquityComponentAxis' : {
			          'Name' : 'pattern:EquityComponentAxis', 
			          'Domains' : {
			            'pattern:EquityComponentAxisDomain' : {
			              'Name' : 'pattern:EquityComponentAxisDomain', 
			              'Label' : 'pattern:EquityComponentAxis Domain', 
			              'Members' : {
			                'pattern:EquityMember' : {
			                  'Name' : 'pattern:EquityMember'
			                }, 
			                'pattern:CommonStockMember' : {
			                  'Name' : 'pattern:CommonStockMember'
			                }, 
			                'pattern:RetainedEarningsAccumulatedDeficitMember' : {
			                  'Name' : 'pattern:RetainedEarningsAccumulatedDeficitMember'
			                }, 
			                'pattern:AdditionalPaidInCapitalMember' : {
			                  'Name' : 'pattern:AdditionalPaidInCapitalMember'
			                }
			              }
			            }
			          }
			        }, 
			        'frm:LegalEntityAxis' : {
			          'Name' : 'frm:LegalEntityAxis', 
			          'Domains' : {
			            'frm:LegalEntityAxisDomain' : {
			              'Name' : 'frm:LegalEntityAxisDomain', 
			              'Label' : 'frm:LegalEntityAxis Domain', 
			              'Members' : {
			                'frm:ConsolidatedEntityMember' : {
			                  'Name' : 'frm:ConsolidatedEntityMember'
			                }
			              }
			            }
			          }
			        }
			      }
			    }, 
			    'OriginalHypercube' : {
			      'Name' : 'xbrl:UserDefinedHypercube', 
			      'Label' : 'User-defined Hypercube', 
			      'Aspects' : {
			        'xbrl:Concept' : {
			          'Name' : 'xbrl:Concept', 
			          'Label' : 'XBRL Concept Dimension'
			        }, 
			        'xbrl:Entity' : {
			          'Name' : 'xbrl:Entity', 
			          'Label' : 'XBRL Entity Dimension'
			        }, 
			        'xbrl:Period' : {
			          'Name' : 'xbrl:Period', 
			          'Label' : 'XBRL Period Dimension'
			        }, 
			        'xbrl:Unit' : {
			          'Name' : 'xbrl:Unit', 
			          'Label' : 'XBRL Unit Dimension', 
			          'Default' : 'xbrl:NonNumeric'
			        }
			      }
			    }, 
			    'Facts' : [ {
			      '_id' : '334d6461-f8c9-4862-9677-34e8cc681d46', 
			      'Archive' : '09-Grid', 
			      'IsInDefaultHypercube' : false, 
			      'Aspects' : {
			        'xbrl:Concept' : 'pattern:NetIncomeLoss', 
			        'xbrl:Entity' : 'http://www.SampleCompany.com SAMP', 
			        'xbrl:Period' : '2010-01-01/2010-12-31', 
			        'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			        'pattern:EquityComponentAxis' : 'pattern:EquityMember', 
			        'xbrl:Unit' : 'iso4217:USD'
			      }, 
			      'Type' : 'NumericValue', 
			      'Value' : 200000, 
			      'Valid' : true, 'Decimals' : 'INF'
			    }, {
			      '_id' : '13ba8d62-9f3c-4a77-80d1-8651a01dec32', 
			      'Archive' : '09-Grid', 
			      'IsInDefaultHypercube' : false, 
			      'Aspects' : {
			        'xbrl:Concept' : 'pattern:NetIncomeLoss', 
			        'xbrl:Entity' : 'http://www.SampleCompany.com SAMP', 
			        'xbrl:Period' : '2010-01-01/2010-12-31', 
			        'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			        'pattern:EquityComponentAxis' : 'pattern:RetainedEarningsAccumulatedDeficitMember', 
			        'xbrl:Unit' : 'iso4217:USD'
			      }, 
			      'Type' : 'NumericValue', 
			      'Value' : 200000, 
			      'Valid' : true, 'Decimals' : 'INF'
			    }, {
			      '_id' : 'ecb245d8-7eeb-42a2-965b-d7e39587098c', 
			      'Archive' : '09-Grid', 
			      'IsInDefaultHypercube' : false, 
			      'Aspects' : {
			        'xbrl:Concept' : 'pattern:CommonStockIssued', 
			        'xbrl:Entity' : 'http://www.SampleCompany.com SAMP', 
			        'xbrl:Period' : '2010-01-01/2010-12-31', 
			        'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			        'pattern:EquityComponentAxis' : 'pattern:EquityMember', 
			        'xbrl:Unit' : 'iso4217:USD'
			      }, 
			      'Type' : 'NumericValue', 
			      'Value' : 50000, 
			      'Valid' : true, 'Decimals' : 'INF'
			    }, {
			      '_id' : 'e666278d-7cb7-4b74-ae58-44e9e97f0aac', 
			      'Archive' : '09-Grid', 
			      'IsInDefaultHypercube' : false, 
			      'Aspects' : {
			        'xbrl:Concept' : 'pattern:CommonStockIssued', 
			        'xbrl:Entity' : 'http://www.SampleCompany.com SAMP', 
			        'xbrl:Period' : '2010-01-01/2010-12-31', 
			        'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			        'pattern:EquityComponentAxis' : 'pattern:CommonStockMember', 
			        'xbrl:Unit' : 'iso4217:USD'
			      }, 
			      'Type' : 'NumericValue', 
			      'Value' : 25000, 
			      'Valid' : true, 'Decimals' : 'INF'
			    }, {
			      '_id' : '8db5774a-ff14-4fcb-bbf7-419e74d92ae9', 
			      'Archive' : '09-Grid', 
			      'IsInDefaultHypercube' : false, 
			      'Aspects' : {
			        'xbrl:Concept' : 'pattern:CommonStockIssued', 
			        'xbrl:Entity' : 'http://www.SampleCompany.com SAMP', 
			        'xbrl:Period' : '2010-01-01/2010-12-31', 
			        'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			        'pattern:EquityComponentAxis' : 'pattern:AdditionalPaidInCapitalMember', 
			        'xbrl:Unit' : 'iso4217:USD'
			      }, 
			      'Type' : 'NumericValue', 
			      'Value' : 25000, 
			      'Valid' : true, 'Decimals' : 'INF'
			    }, {
			      '_id' : '92442713-01bb-4b90-9a7c-b35f1d8e119f', 
			      'Archive' : '09-Grid', 
			      'IsInDefaultHypercube' : false, 
			      'Aspects' : {
			        'xbrl:Concept' : 'pattern:Dividends', 
			        'xbrl:Entity' : 'http://www.SampleCompany.com SAMP', 
			        'xbrl:Period' : '2010-01-01/2010-12-31', 
			        'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			        'pattern:EquityComponentAxis' : 'pattern:EquityMember', 
			        'xbrl:Unit' : 'iso4217:USD'
			      }, 
			      'Type' : 'NumericValue', 
			      'Value' : 100000, 
			      'Valid' : true, 'Decimals' : 'INF'
			    }, {
			      '_id' : '851b2d54-137e-414c-ba79-d49bdfbab579', 
			      'Archive' : '09-Grid', 
			      'IsInDefaultHypercube' : false, 
			      'Aspects' : {
			        'xbrl:Concept' : 'pattern:Dividends', 
			        'xbrl:Entity' : 'http://www.SampleCompany.com SAMP', 
			        'xbrl:Period' : '2010-01-01/2010-12-31', 
			        'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			        'pattern:EquityComponentAxis' : 'pattern:RetainedEarningsAccumulatedDeficitMember', 
			        'xbrl:Unit' : 'iso4217:USD'
			      }, 
			      'Type' : 'NumericValue', 
			      'Value' : 100000, 
			      'Valid' : true, 'Decimals' : 'INF'
			    }, {
			      '_id' : 'a0700b7c-a405-46ba-abc5-b46ebf600798', 
			      'Archive' : '09-Grid', 
			      'IsInDefaultHypercube' : false, 
			      'Aspects' : {
			        'xbrl:Concept' : 'pattern:Equity', 
			        'xbrl:Entity' : 'http://www.SampleCompany.com SAMP', 
			        'xbrl:Period' : '2009-12-31', 
			        'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			        'pattern:EquityComponentAxis' : 'pattern:EquityMember', 
			        'xbrl:Unit' : 'iso4217:USD'
			      }, 
			      'Type' : 'NumericValue', 
			      'Value' : 400000, 
			      'Valid' : true, 'Decimals' : 'INF'
			    }, {
			      '_id' : '243b8569-5e1b-4eb6-a6ab-8254fa03a890', 
			      'Archive' : '09-Grid', 
			      'IsInDefaultHypercube' : false, 
			      'Aspects' : {
			        'xbrl:Concept' : 'pattern:Equity', 
			        'xbrl:Entity' : 'http://www.SampleCompany.com SAMP', 
			        'xbrl:Period' : '2010-12-31', 
			        'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			        'pattern:EquityComponentAxis' : 'pattern:EquityMember', 
			        'xbrl:Unit' : 'iso4217:USD'
			      }, 
			      'Type' : 'NumericValue', 
			      'Value' : 550000, 
			      'Valid' : true, 'Decimals' : 'INF'
			    }, {
			      '_id' : '8e089c78-db99-40e5-a50e-b91325af2b1b', 
			      'Archive' : '09-Grid', 
			      'IsInDefaultHypercube' : false, 
			      'Aspects' : {
			        'xbrl:Concept' : 'pattern:Equity', 
			        'xbrl:Entity' : 'http://www.SampleCompany.com SAMP', 
			        'xbrl:Period' : '2009-12-31', 
			        'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			        'pattern:EquityComponentAxis' : 'pattern:CommonStockMember', 
			        'xbrl:Unit' : 'iso4217:USD'
			      }, 
			      'Type' : 'NumericValue', 
			      'Value' : 150000, 
			      'Valid' : false, 'Decimals' : 'INF'
			    }, {
			      '_id' : '17aff72d-dbdb-4efb-b150-17b04a986a16', 
			      'Archive' : '09-Grid', 
			      'IsInDefaultHypercube' : false, 
			      'Aspects' : {
			        'xbrl:Concept' : 'pattern:Equity', 
			        'xbrl:Entity' : 'http://www.SampleCompany.com SAMP', 
			        'xbrl:Period' : '2010-12-31', 
			        'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			        'pattern:EquityComponentAxis' : 'pattern:CommonStockMember', 
			        'xbrl:Unit' : 'iso4217:USD'
			      }, 
			      'Type' : 'NumericValue', 
			      'Value' : 175000, 
			      'Valid' : true, 'Decimals' : 'INF'
			    }, {
			      '_id' : '248bc2c3-319c-4dee-a0ab-d33dc16dfedf', 
			      'Archive' : '09-Grid', 
			      'IsInDefaultHypercube' : false, 
			      'Aspects' : {
			        'xbrl:Concept' : 'pattern:Equity', 
			        'xbrl:Entity' : 'http://www.SampleCompany.com SAMP', 
			        'xbrl:Period' : '2009-12-31', 
			        'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			        'pattern:EquityComponentAxis' : 'pattern:AdditionalPaidInCapitalMember', 
			        'xbrl:Unit' : 'iso4217:USD'
			      }, 
			      'Type' : 'NumericValue', 
			      'Value' : 50000, 
			      'Valid' : true, 'Decimals' : 'INF'
			    }, {
			      '_id' : '21bd0ca2-f0a9-47d0-be4e-32975f4b7a8e', 
			      'Archive' : '09-Grid', 
			      'IsInDefaultHypercube' : false, 
			      'Aspects' : {
			        'xbrl:Concept' : 'pattern:Equity', 
			        'xbrl:Entity' : 'http://www.SampleCompany.com SAMP', 
			        'xbrl:Period' : '2010-12-31', 
			        'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			        'pattern:EquityComponentAxis' : 'pattern:AdditionalPaidInCapitalMember', 
			        'xbrl:Unit' : 'iso4217:USD'
			      }, 
			      'Type' : 'NumericValue', 
			      'Value' : 75000, 
			      'Valid' : false, 'Decimals' : 'INF'
			    }, {
			      '_id' : 'bc373c83-867b-48b4-9091-56a3d2396b51', 
			      'Archive' : '09-Grid', 
			      'IsInDefaultHypercube' : false, 
			      'Aspects' : {
			        'xbrl:Concept' : 'pattern:Equity', 
			        'xbrl:Entity' : 'http://www.SampleCompany.com SAMP', 
			        'xbrl:Period' : '2009-12-31', 
			        'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			        'pattern:EquityComponentAxis' : 'pattern:RetainedEarningsAccumulatedDeficitMember', 
			        'xbrl:Unit' : 'iso4217:USD'
			      }, 
			      'Type' : 'NumericValue', 
			      'Value' : 200000, 
			      'Valid' : true, 'Decimals' : 'INF'
			    }, {
			      '_id' : '92e280a1-185e-475b-8240-b91f6146e19c', 
			      'Archive' : '09-Grid', 
			      'IsInDefaultHypercube' : false, 
			      'Aspects' : {
			        'xbrl:Concept' : 'pattern:Equity', 
			        'xbrl:Entity' : 'http://www.SampleCompany.com SAMP', 
			        'xbrl:Period' : '2010-12-31', 
			        'frm:LegalEntityAxis' : 'frm:ConsolidatedEntityMember', 
			        'pattern:EquityComponentAxis' : 'pattern:RetainedEarningsAccumulatedDeficitMember', 
			        'xbrl:Unit' : 'iso4217:USD'
			      }, 
			      'Type' : 'NumericValue', 
			      'Value' : 300000, 
			      'Valid' : true, 'Decimals' : 'INF'
			    } ]
			  }
			};
			*/
	  	  
});