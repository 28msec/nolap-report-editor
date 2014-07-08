'use strict';

angular
.module('report-editor')
.directive('treeView', function($drag){
    return {
        restrict: 'E',
        templateUrl: '/report/taxonomy/tree-view.html',
        scope: {
            treeData: '=',
            selected: '=' 
        },  
        link: function($scope, element) {

            $scope.collapse = function(row) {
                if(row.branch.To) {
                    row.branch.Expanded = !row.branch.Expanded;
                }
            };  
    
            var setRows = function(branches, level, visible){
                Object.keys(branches)
                .sort(function(elem1, elem2){
                    elem1 = branches[elem1];
                    elem2 = branches[elem2];
                    var order1 = elem1.Order;
                    if(order1 === undefined || order1 === null){
                        order1 = 1;
                    } else if(typeof order1 !== 'number'){
                        order1 = parseInt(order1, 10);
                    }   
                    var order2 = elem2.Order;
                    if(order2 === undefined || order2 === null){
                        order2 = 1;
                    } else if(typeof order2 !== 'number'){
                        order2 = parseInt(order2, 10);
                    }   
                    if (order1 < order2){
                        return -1; 
                    }   
                    if (order1 > order2){
                        return 1;
                    }   
                    return 0;
                })
                .forEach(function(key){
                    var branch = branches[key];
                    branch.Expanded = branch.Expanded !== undefined ? branch.Expanded : true;
                    $scope.rows.push({ branch: branch, level: level, visible: visible }); 
                    if(branch.To) {
                        setRows(branch.To, level + 1, visible === false ? false : branch.Expanded);
                    }
                });
            };  
    
            var onChange = function(){
                $scope.rows = [];
                setRows($scope.treeData, 1, true);
                angular.forEach(element.find('li'), function(li){
                    $drag.draggable(li, {
                        keepSize: true
                    });
                });
            };  
    
            $scope.$watch('treeData', onChange, true);
        }   
    };  
});