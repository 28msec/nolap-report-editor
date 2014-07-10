'use strict';
angular
.module('report-editor')
.controller('TaxonomyCtrl', function($scope){

    $scope.presentationNetwork = $scope.report.getNetwork('Presentation').Trees;
    $scope.presentationTree = [];
    
    $scope.treeOptions = {
        dropped: function(event){
            $scope.report.moveTreeBranch('Presentation', event.source.nodeScope.$modelValue.Id, event.dest.nodesScope.$nodeScope.$modelValue.Id, event.dest.index);
        },
        removed: function(node){
            $scope.report.removeTreeBranch('Presentation', node.$modelValue.Id);
        }
    };

    $scope.selectConcept = function(){
        console.log('selectConcept');
    };

    var setPresentationTree = function(element, current){
        Object.keys(element).sort(function(elem1, elem2){
            elem1 = element[elem1];
            elem2 = element[elem2];
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
        }).forEach(function(key){
            var child = element[key];
            var concept = $scope.report.getConcept(child.Name);
            if(concept === null) {
                console.error('Invalid report detected. This is a serious bug!');
                return;
            }
            current.push(child);
            if(concept.IsAbstract === true) {
                child.children = [];
                setPresentationTree(child.To ? child.To : {}, child.children);
            }
        });
    };

    setPresentationTree(angular.copy($scope.presentationNetwork), $scope.presentationTree);
});