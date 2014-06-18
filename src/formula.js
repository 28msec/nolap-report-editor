'use strict';

angular.module('formulaEditor',['excelParser', 'formulaParser'])
.factory('Formula', ['$q', '$log', 'ExcelParser', 'FormulaParser', function($q, $log, ExcelParser, FormulaParser){

    var ensureParameter = function(paramValue, paramName, paramType, functionName, regex, regexErrorMessage) {
        if(paramValue === null || paramValue === undefined) {
            throw new Error(functionName + ': function called without mandatory "' + paramName + '" parameter.');
        }
        if(typeof paramValue !== paramType) {
            throw new Error(functionName + ': function called with mandatory "' + paramName + '" parameter which is of wrong type "' + typeof paramValue + '" (should be of type "' + paramType + '" instead).');
        }
        if(regex !== undefined && paramValue.match(regex) === null) {
            throw new Error(functionName + ': ' + regexErrorMessage);
        }
    };

    //Constructor
    var Formula = function(modelOrRuleType, report, computableConcept, language){
        if(typeof modelOrRuleType === 'object' && modelOrRuleType !== null){
            this.report = report;
            this.setModel(modelOrRuleType);
        } else {
            ensureParameter(modelOrRuleType, 'modelOrRuleType', 'string', 'Formula (Const.)',/^(xbrl28:formula)|(xbrl28:validation)$/g,'unknown rule type: ' + modelOrRuleType);
            ensureParameter(computableConcept, 'computableConcept', 'string', 'Formula (Const.)');
            ensureParameter(language, 'language', 'string', 'Formula (Const.)');
            ensureParameter(report, 'report', 'object', 'Formula (Const.)');
            this.report = report;
            this.parser = null;
            if (modelOrRuleType === 'xbrl28:validation'){
                this.setModel({
                    'Id': report.uuid(),
                    'Type': modelOrRuleType,
                    'Label': '',
                    'Description': '',
                    'ComputableConcepts': [ computableConcept + 'Validation' ],
                    'ValidatedConcepts': [ computableConcept ],
                    'DependsOn': [],
                    'Formula': ''
                });
            } else if (modelOrRuleType === 'xbrl28:formula') {
                if(language === 'SpreadsheetFormula') {
                    this.setModel({
                        'Id': report.uuid(),
                        'Type': modelOrRuleType,
                        'OriginalLanguage': language,
                        'Label': '',
                        'Description': '',
                        'ComputableConcepts': [ computableConcept ],
                        'DependsOn': [],
                        'AllowCrossPeriod': true,
                        'AllowCrossBalance': true,
                        'Formulae': [
                            {
                                'PrereqSrc': 'TRUE',
                                'Prereq': {},
                                'SourceFact': [],
                                'BodySrc': '',
                                'Body': {},
                                'active': true
                            }
                        ]
                    });
                } else {
                    this.setModel({
                        'Id': report.uuid(),
                        'Type': modelOrRuleType,
                        'Label': '',
                        'Description': '',
                        'ComputableConcepts': [ computableConcept ],
                        'DependsOn': [],
                        'Formula': ''
                    });
                }
            }
        }
    };

    Formula.prototype.addAlternative = function(){
        if(this.model.Formulae === undefined || this.model.Formulae === null){
            this.model.Formulae = [];
        }
        var language = this.model.OriginalLanguage;
        if(language === 'SpreadsheetFormula') {
            this.model.Formulae.push(
                {
                    'PrereqSrc': 'TRUE',
                    'Prereq': {},
                    'SourceFact': [],
                    'BodySrc': '',
                    'Body': {},
                    'active': true
                });
        }
    };

    Formula.prototype.copyAlternative = function(index){
        var formulae = this.model.Formulae;
        if(formulae === undefined || formulae === null || index >= formulae.length){
            throw new Error('Index out of bounds: ' + index + '. Array: ' + JSON.stringify(formulae));
        }
        var alternative = angular.copy(formulae[index]);
        var language = this.model.OriginalLanguage;
        if(language === 'SpreadsheetFormula') {
            formulae.push( alternative);
            alternative.active = true;
        }
    };

    Formula.prototype.removeAlternative = function(index){
        var formulae = this.model.Formulae;
        if(formulae === undefined || formulae === null || index >= formulae.length){
            throw new Error('Index out of bounds: ' + index + '. Array: ' + JSON.stringify(formulae));
        }
        formulae.splice(index, 1);
    };

    Formula.prototype.getPrefix = function(){
        var prefix;
        if(this.report !== undefined && this.report !== null && typeof this.report === 'object'){
            prefix = this.report.getPrefix();
        }
        if(this.report === undefined || prefix === undefined || prefix === null || prefix === ''){
            return 'ext';
        }
        return prefix;
    };

    Formula.prototype.getParser = function() {
        if(this.parser === undefined || this.parser === null ) {
            if(this.model.OriginalLanguage === 'ArithmeticFormula') {
                this.parser = FormulaParser;
                this.parserType = 'FormulaParser';
            }
            if(this.model.OriginalLanguage === 'SpreadsheetFormula') {
                this.parser = ExcelParser;
                this.parserType = 'ExcelParser';
            }
        }
        return this.parser;
    };

    /*Formula.prototype.updateView = function() {
        this.view = JSON.stringify(this.model, null, ' ');
    };*/

    var alignConceptPrefix = function(prefix, concept){
        var result;
        if(concept !== undefined && concept !== null && typeof concept === 'string') {
            if (concept.indexOf(':') === -1) {
                result = prefix + ':' + concept;
            } else {
                result = concept;
            }
        }
        return result;
    };

    var alignConceptPrefixes = function(prefix, conceptsArray){
        var result = [];
        if(conceptsArray !== undefined && conceptsArray !== null && typeof conceptsArray === 'object') {
            for (var i in conceptsArray) {
                var concept = conceptsArray[i];
                result.push(alignConceptPrefix(prefix, concept));
            }
        }
        return result;
    };

    var makeUnique = function(array){
        ensureParameter(array, 'array', 'object', 'makeUnique');
        var unique = {}, result = [];
        for(var j in array){
            var item = array[j];
            if(unique.hasOwnProperty(item)) {
                continue;
            }
            result.push(item);
            unique[item] = 1;
        }
        return result;
    };

    var inferDependenciesImpl = function(formula, obj){
        ensureParameter(formula, 'formula', 'object', 'inferDependenciesImpl');
        ensureParameter(obj, 'obj', 'object', 'inferDependenciesImpl');
        var prefix = formula.getPrefix();
        var result = [];
        var formulae = obj.Formulae;
        if(formulae !== undefined && formulae !== null && typeof formulae === 'object'){
            for(var i in formulae){
                var alternative = formulae[i];
                result = result.concat(inferDependenciesImpl(formula, alternative));
            }
            result = alignConceptPrefixes(prefix, result);
            result = makeUnique(result);
            obj.DependsOn = result;
        } else {
            var prereq = obj.Prereq;
            var body = obj.Body;
            var sourceFacts = obj.SourceFact;
            if (prereq !== undefined || body !== undefined || sourceFacts !== undefined) {
                if (prereq !== undefined && prereq !== null && typeof prereq === 'object') {
                    result = result.concat(inferDependenciesImpl(formula, prereq));
                }
                if (body !== undefined && body !== null && typeof body === 'object') {
                    result = result.concat(inferDependenciesImpl(formula, body));
                }
                if (sourceFacts !== undefined && sourceFacts !== null && typeof sourceFacts === 'object') {
                    result = result.concat(sourceFacts);
                }
            } else {
                var type = obj.Type;
                var children = obj.Children;
                if(type === 'variable'){
                    var name = obj.Name;
                    result.push(name);
                } else if(children !== undefined && children !== null && typeof children === 'object'){
                    for(var j in children){
                        var child = children[j];
                        result = result.concat(inferDependenciesImpl(formula, child));
                    }
                }
            }
        }
        return result;
    };

    var inferDependencies = function(formula, obj, async) {
        ensureParameter(formula, 'formula', 'object', 'inferDependencies');
        ensureParameter(obj, 'obj', 'object', 'inferDependencies');
        if(async === undefined || async === null || async) {
            var deferred = $q.defer();
            var result = inferDependenciesImpl(formula, obj);
            deferred.resolve(result);
            return deferred.promise;
        } else {
            return inferDependenciesImpl(formula, obj);
        }
    };

    // computation is the jsoniq code part that computes the value of the new
    // fact
    var toComputation = function(ast){
        if(ast !== undefined && ast !== null && typeof ast === 'object'){
            var type = ast.Type;
            var children = ast.Children;
            var value = ast.Value;
            var name = ast.Name;
            switch(type){
                // comparisons
                case 'eq':
                case 'ne':
                case 'gt':
                case 'ge':
                case 'lt':
                case 'le': return toComputation(children[0]) + ' ' + type + ' ' + toComputation(children[1]);

                // arithmetics
                case 'add': return toComputation(children[0]) + ' + ' + toComputation(children[1]);
                case 'mul': return toComputation(children[0]) + ' * ' + toComputation(children[1]);
                case 'div': return toComputation(children[0]) + ' div ' + toComputation(children[1]);
                case 'sub': return toComputation(children[0]) + ' - ' + toComputation(children[1]);

                // primaries
                case 'block':
                    var inner = [];
                    for(var i in children) {
                        var child = children[i];
                        inner.push(toComputation(child));
                    }
                    return '(' + inner.join(',') + ')';
                case 'variable': return 'rules:decimal-value($' + name + ')';

                // atomics
                case 'numeric': return value;
                case 'boolean': return value;
                case 'string': return '\"' + value + '\"';

                // functions
                case 'function':
                    var innerparams = [];
                    for(var j in children) {
                        var param = children[j];
                        innerparams.push(toComputation(param));
                    }
                    switch(name){
                        case 'isblank':
                            var innerparams2 = [];
                            for(var h in children) {
                                if(children.hasOwnProperty(h)) {
                                    var p = children[j];
                                    if(p.Type === 'variable'){
                                        innerparams2.push('$' + p.Name);
                                    } else {
                                        innerparams2.push(toComputation(p));
                                    }
                                }
                            }
                            return 'not(exists(' + innerparams2.join(', ') + '))';
                        case 'not': return 'not((' + innerparams.join(', ') + '))';
                        case 'and': return '(' + innerparams.join(' and ') + ')';
                        case 'or': return '(' + innerparams.join(' or ') + ')';
                    }
            }
        }
    };

    // computation is the jsoniq code part that creates the audit trail of the new
    // fact
    var toAuditTrail = function(ast){
        if(ast !== undefined && ast !== null && typeof ast === 'object'){
            var type = ast.Type;
            var children = ast.Children;
            var value = ast.Value;
            var name = ast.Name;
            var result = [];
            switch(type){
                // comparisons
                case 'eq':
                case 'ne':
                case 'gt':
                case 'ge':
                case 'lt':
                case 'le': result.push(toAuditTrail(children[0]) + ' || " ' + type + ' " || ' + toAuditTrail(children[1])); break;

                // arithmetics
                case 'add': result.push(toAuditTrail(children[0]) + ' || " + " || ' + toAuditTrail(children[1])); break;
                case 'mul': result.push(toAuditTrail(children[0]) + ' || " * " || ' + toAuditTrail(children[1])); break;
                case 'div': result.push(toAuditTrail(children[0]) + ' || " div " || ' + toAuditTrail(children[1])); break;
                case 'sub': result.push(toAuditTrail(children[0]) + ' || " - " || ' + toAuditTrail(children[1])); break;

                // primaries
                case 'block':
                    var inner = [];
                    for(var i in children) {
                        var child = children[i];
                        inner.push(toAuditTrail(child));
                    }
                    result.push('" ( " || ' + inner.join(' || ", "') + ' || " )"');
                    break;
                case 'variable': result.push('rules:fact-trail($' + name + ', "' + name + '")'); break;

                // atomics
                case 'numeric':
                case 'boolean':
                case 'string': result.push('"' + value + '"');  break;

                // functions
                case 'function':
                    var innerparams = [];
                    for(var j in children) {
                        var param = children[j];
                        innerparams.push(toAuditTrail(param));
                    }
                    switch(name){
                        case 'isblank': result.push('"not(exists( " || ' + innerparams.join(' || ", "') + ' || "))"'); break;
                        case 'not': result.push('not((' + innerparams.join(' || ", "') + ' || "))"'); break;
                        case 'and': result.push('(' + innerparams.join(' || " and "') + ' || ")"'); break;
                        case 'or': result.push('(' + innerparams.join(' || " or "') + ' || ")"'); break;
                    }
                    break;
            }
            return result.join(' || ');
        }
    };

    var getUniqueFacts = function(report, prefix){
        var facts = [];
        facts = facts.concat(report.model.ComputableConcepts);
        facts = facts.concat(report.model.DependsOn);
        if((report.model.OriginalLanguage === 'SpreadsheetFormula') &&
            report.model.Formulae !== undefined && report.model.Formulae !== null) {
            for (var i in report.model.Formulae) {
                facts = facts.concat(report.model.Formulae[i].SourceFact);
            }
        }
        return makeUnique(alignConceptPrefixes(prefix, facts));
    };

    Formula.prototype.toJsoniq = function() {
        var result = [];
        var prefix = this.getPrefix();
        var computedConcept = alignConceptPrefix(prefix, this.model.ComputableConcepts[0]);
        if(this.model !== undefined && this.model !== null && typeof this.model ==='object') {
            if ((this.model.OriginalLanguage === 'SpreadsheetFormula') &&
                this.model.Formulae !== undefined && this.model.Formulae !== null) {

                var facts = getUniqueFacts(this, prefix);
                var computedFactVariable;
                if(computedConcept.indexOf( prefix + ':') === 0){
                    computedFactVariable = computedConcept.substring(prefix.length + 1);
                }else{
                    computedFactVariable = computedConcept.replace(/:/g, '_');
                }
                var allowCrossPeriod = this.model.AllowCrossPeriod;
                var allowCrossBalance = this.model.AllowCrossBalance;
                var factsFilter = '';
                for(var i in facts){
                    var fact = facts[i];
                    if(factsFilter === ''){
                        factsFilter = '"';
                    }else{
                        factsFilter += ', "';
                    }
                    factsFilter += fact + '"';
                }
                var variables = [];
                for(var j in facts){
                    var concept = facts[j];
                    var variable = {};
                    if(concept.indexOf( prefix + ':') === 0){
                        variable.Name = concept.substring(prefix.length + 1);
                    }else{
                        variable.Name = concept.replace(/:/g, '_');
                    }
                    variable.Concept = alignConceptPrefix(prefix, concept);
                    variables.push(variable);
                }
                var auditTrailSourceFacts = '';
                for(var y in variables){
                    if(variables.hasOwnProperty(y)) {
                        var va = variables[y];
                        if(auditTrailSourceFacts===''){
                            auditTrailSourceFacts += '$';
                        } else {
                            auditTrailSourceFacts += ', $';
                        }
                        auditTrailSourceFacts += va.Name;
                    }
                }

                result.push('');
                result.push('for $facts in facts:facts-for-internal((');
                result.push('      ' + factsFilter);
                result.push('    ), $hypercube, $aligned-filter, $concept-maps, $rules, $cache, $options)');
                if (allowCrossPeriod) {
                    result.push('let $aligned-period := ( facts:duration-for-fact($facts).End, facts:instant-for-fact($facts), "forever")[1]');
                }
                result.push('group by $canonical-filter-string := ');
                if (allowCrossBalance) {
                    result.push('  facts:canonically-serialize-object($facts, ($facts:CONCEPT, "_id", "IsInDefaultHypercube", "Type", "Value", "Decimals", "AuditTrails", "xbrl28:Type", "Balance"))');
                } else {
                    result.push('  facts:canonically-serialize-object($facts, ($facts:CONCEPT, "_id", "IsInDefaultHypercube", "Type", "Value", "Decimals", "AuditTrails", "xbrl28:Type"))');
                }
                if (allowCrossPeriod) {
                    result.push('  , $aligned-period');
                }
                for(var x in variables){
                    if(variables.hasOwnProperty(x)) {
                        var v = variables[x];
                        result.push('let $' + v.Name + ' as object? := $facts[$$.$facts:ASPECTS.$facts:CONCEPT eq "' + v.Concept + '"]');
                    }
                }
                result.push('let $_unit := ($facts.$facts:ASPECTS.$facts:UNIT)[1]');
                result.push('return');
                result.push('  switch (true)');
                result.push('  case exists($' + computedFactVariable + ') return $' + computedFactVariable);

                for (var k in this.model.Formulae) {
                    if(this.model.Formulae.hasOwnProperty(k)) {
                        var alternative = this.model.Formulae[k];
                        var body = alternative.Body;
                        var prereq = alternative.Prereq;
                        var sourceFacts = alignConceptPrefixes(prefix, alternative.SourceFact);
                        var sourceFactVariable;
                        if(sourceFacts[0] !== undefined && sourceFacts[0].indexOf( prefix + ':') === 0){
                            sourceFactVariable = sourceFacts[0].substring(prefix.length + 1);
                        } else if(sourceFacts[0] !== undefined) {
                            sourceFactVariable = sourceFacts[0].replace(/:/g, '_');
                        }
                        var sourceFactExistenceCheck = '';
                        for(var s in sourceFacts){
                            if(sourceFacts.hasOwnProperty(s)){
                                var sFact = sourceFacts[s];
                                if(sFact.indexOf( prefix + ':') === 0){
                                    sFact = sFact.substring(prefix.length + 1);
                                }else{
                                    sFact = sFact.replace(/:/g, '_');
                                }
                                if(sourceFactExistenceCheck !== ''){
                                    sourceFactExistenceCheck += ' and ';
                                }
                                sourceFactExistenceCheck += 'exists($' + sFact + ')';
                            }
                        }

                        result.push('  case (' + sourceFactExistenceCheck + ' and ' + toComputation(prereq) + ')');
                        result.push('  return');
                        result.push('    let $computed-value := ' + toComputation(body));
                        result.push('    let $audit-trail-message := ');
                        result.push('	     rules:fact-trail({"Aspects": { "xbrl:Unit" : $_unit, "xbrl:Concept" : "' + computedConcept + '" }, Value: $computed-value }) || " = "');
                        result.push('	        || ' + toAuditTrail(body));
                        result.push('	 let $source-facts := (' + auditTrailSourceFacts + ')');
                        result.push('    return');
                        result.push('      rules:create-computed-fact(');
                        result.push('          $' + sourceFactVariable + ',');
                        result.push('          "' + computedConcept + '",');
                        result.push('          $computed-value,');
                        result.push('          $rule,');
                        result.push('          $audit-trail-message,');
                        result.push('          $source-facts,');
                        result.push('          $options)');

                    }
                }
                result.push('  default return ()');

            }
        }
        return result.join('\n');
    };

    Formula.prototype.compile = function() {
        if((this.model.OriginalLanguage === 'SpreadsheetFormula') &&
            this.model.Formulae !== undefined && this.model.Formulae !== null) {
            $log.log('starting compilation');
            for (var i = 0; i < this.model.Formulae.length; ++i) {
                this.compilePrereq(i, false /* not deferred */);
                this.compileBody(i, false /* not deferred */);
            }
            inferDependencies(this, this.model, false /* not deferred */);
            this.model.Formula = this.toJsoniq();
            $log.log('compilation finished');
        }
    };

    var bodyEmptyErrorMessage = 'Rule code section cannot be empty. Example code: "((NetIncomeLoss/Revenues)*(1+(Assets-Equity)/Equity))/((1/(Revenues/Assets))-((NetIncomeLoss/Revenues)*(1+(Assets-Equity)/Equity)))"';

    Formula.prototype.compileBodyDeferred = function(index) {
        ensureParameter(index, 'index', 'number', 'compileBodyDeferred');
        var deferred = $q.defer();
        var parser = this.getParser();
        var altComp = this.model.Formulae[index];
        var body;
        if(altComp.BodySrc === undefined || altComp.BodySrc === '' || altComp.BodySrc === null){
            deferred.reject(bodyEmptyErrorMessage);
        }else {
            try {
                body = parser.parse(altComp.BodySrc);
                deferred.resolve(body);
            }
            catch (e) {
                var errMsg = this.parserType + ' ' + e.name + ' Error: (' + e.line + ',' + e.column + ') ' + e.message;
                deferred.reject(errMsg);
            }
        }
        return deferred.promise;
    };

    Formula.prototype.compileBody = function(index, async, action) {
        ensureParameter(index, 'index', 'number', 'compileBody');
        var that = this;
        var altComp = that.model.Formulae[index];
        var successFunc = function (body) {
            altComp.Body = body;
            if (altComp.BodyErr !== undefined) {
                delete altComp.BodyErr;
            }
            //$log.log(that.parserType + ' Body ok');
            that.model.Formulae[index] = altComp;
            if(async !== false){
                inferDependencies(that, that.model, async).then(
                    function() {
                        that.validate(action);
                    });
            } else {
                that.validate(action);
            }
        };
        var errorFunc = function (errMsg) {
            altComp.BodyErr = errMsg;
            altComp.Body = {};
            $log.log(errMsg);
            that.model.Formulae[index] = altComp;
            that.validate(action);
        };
        if(async === undefined || async === null || async === true) {
            this.compileBodyDeferred(index).then(successFunc, errorFunc);
        } else {
            var parser = this.getParser();
            var body;
            if(altComp.BodySrc === undefined || altComp.BodySrc === '' || altComp.BodySrc === null){
                errorFunc(bodyEmptyErrorMessage);
            }else {
                try {
                    body = parser.parse(altComp.BodySrc);
                    successFunc(body);
                }
                catch (e) {
                    var errMsg = this.parserType + ' ' + e.name + ' Error: (' + e.line + ',' + e.column + ') ' + e.message;
                    errorFunc(errMsg);
                }
            }
        }
    };

    var prereqEmptyErrorMessage = 'Rule precondition section cannot be empty. If you don\'t want to check a precondition just put "TRUE".';

    Formula.prototype.compilePrereqDeferred = function(index) {
        ensureParameter(index, 'index', 'number', 'compilePrereqDeferred');
        var deferred = $q.defer();
        var parser = this.getParser();
        var altComp = this.model.Formulae[index];
        var prereq;
        if(altComp.PrereqSrc === undefined || altComp.PrereqSrc === '' || altComp.PrereqSrc === null){
            deferred.reject(prereqEmptyErrorMessage);
        }else {
            try {
                prereq = parser.parse(altComp.PrereqSrc);
                deferred.resolve(prereq);
            }
            catch (e) {
                var errMsg = this.parserType + ' ' + e.name + ' Error: (' + e.line + ',' + e.column + ') ' + e.message;
                deferred.reject(errMsg);
            }
        }
        return deferred.promise;
    };

    Formula.prototype.compilePrereq = function(index, async, action) {
        ensureParameter(index, 'index', 'number', 'compilePrereq');
        var that = this;
        var altComp = that.model.Formulae[index];
        var successFunc = function(prereq){
            altComp.Prereq = prereq;
            if(altComp.PrereqErr !== undefined){
                delete altComp.PrereqErr;
            }
            //$log.log(that.parserType + ' Prereq ok');
            that.model.Formulae[index] = altComp;
            if(async !== false){
                inferDependencies(that, that.model, async).then(
                    function() {
                        that.validate(action);
                    });
            } else {
                that.validate(action);
            }
        };
        var errorFunc = function(errMsg){
            var altComp = that.model.Formulae[index];
            altComp.PrereqErr = errMsg;
            altComp.Prereq = {};
            $log.log(errMsg);
            that.model.Formulae[index] = altComp;
            that.validate(action);
        };
        if(async === undefined || async === null || async === true) {
            this.compilePrereqDeferred(index).then(successFunc, errorFunc);
        } else {
            var parser = this.getParser();
            var prereq;
            if(altComp.PrereqSrc === undefined || altComp.PrereqSrc === '' || altComp.PrereqSrc === null){
                errorFunc(prereqEmptyErrorMessage);
            }else {
                try {
                    prereq = parser.parse(altComp.PrereqSrc);
                    successFunc(prereq);
                }
                catch (e) {
                    var errMsg = this.parserType + ' ' + e.name + ' Error: (' + e.line + ',' + e.column + ') ' + e.message;
                    errorFunc(errMsg);
                }
            }
        }
    };

    var validateId = function(rule, report, action){
        var existingRule;
        var id = rule.Id;
        if(id === undefined || id === null || id === ''){
            rule.IdErr = 'Rule Id is mandatory.';
            rule.valid = false;
        } else if(action === 'Create' && (existingRule = report.getRule(id)) !== undefined && existingRule !== null) {
            rule.IdErr = 'A rule with id "' + id + '" does already exist.';
            rule.valid = false;
        } else {
            delete rule.IdErr;
        }
    };

    var validateLabel = function(rule){
        var label = rule.Label;
        if(label === undefined || label === null || label === ''){
            rule.LabelErr = 'Rule Label is mandatory.';
            rule.valid = false;
        } else {
            delete rule.LabelErr;
        }
    };

    var validateComputableConcepts = function(rule, report, prefix){
        var computableConcepts = rule.ComputableConcepts;
        if(computableConcepts[0] === '' || computableConcepts.length === 0){
            rule.ComputableConceptsErr = 'Computable Concept is mandatory.';
            rule.valid = false;
        } else {
            var notExistingConcepts = [];
            for (var i in computableConcepts){
                if(computableConcepts.hasOwnProperty(i)) {
                    var concept = report.getConcept(alignConceptPrefix(prefix, computableConcepts[i]));
                    if (concept === undefined || concept === null) {
                        notExistingConcepts.push(computableConcepts[i]);
                    }
                }
            }
            if(notExistingConcepts.length === 1) {
                rule.ComputableConceptsErr = 'The computed concept "' + notExistingConcepts[0] + '" does not exist.';
                rule.valid = false;
            } else if(notExistingConcepts.length > 1) {
                rule.ComputableConceptsErr = 'The following concepts do not exist: "' + notExistingConcepts.join('", "') + '".';
                rule.valid = false;
            }else {
                delete rule.ComputableConceptsErr;
            }
        }
    };

    var validateDependsOnConcepts = function(rule, report, prefix){
        var dependsOnConcepts = rule.DependsOn;
        var notExistingConcepts = [];
        for (var i in dependsOnConcepts){
            if(dependsOnConcepts.hasOwnProperty(i)) {
                var concept = report.getConcept(alignConceptPrefix(prefix, dependsOnConcepts[i]));
                if (concept === undefined || concept === null) {
                    notExistingConcepts.push(dependsOnConcepts[i]);
                }
            }
        }
        if(notExistingConcepts.length === 1) {
            rule.DependsOnErr = 'The depending concept "' + notExistingConcepts[0] + '" does not exist.';
            rule.valid = false;
        } else if(notExistingConcepts.length > 1) {
            rule.DependsOnErr = 'The following depending concepts do not exist: "' + notExistingConcepts.join('", "') + '".';
            rule.valid = false;
        }else {
            delete rule.DependsOnErr;
        }
    };

    var validateValidatedConcepts = function(rule, report, prefix){
        var validatedConcepts = rule.ValidatedConcepts;
        if(validatedConcepts[0] === '' || validatedConcepts.length === 0){
            rule.ValidatedConceptsErr = 'Validated Concept is mandatory.';
            rule.valid = false;
        } else {
            var notExistingConcepts = [];
            for (var i in validatedConcepts){
                if(validatedConcepts.hasOwnProperty(i)) {
                    var concept = report.getConcept(alignConceptPrefix(prefix, validatedConcepts[i]));
                    if (concept === undefined || concept === null) {
                        notExistingConcepts.push(validatedConcepts[i]);
                    }
                }
            }
            if(notExistingConcepts.length === 1) {
                rule.ValidatedConceptsErr = 'The validated concept "' + notExistingConcepts[0] + '" does not exist.';
                rule.valid = false;
            } else if(notExistingConcepts.length > 1) {
                rule.ValidatedConceptsErr = 'The following validated concepts do not exist: "' + notExistingConcepts.join('", "') + '".';
                rule.valid = false;
            }else {
                delete rule.ValidatedConceptsErr;
            }
        }
    };

    var validateFormula = function(rule){
        var formula = rule.Formula;
        if(formula === undefined || formula === null || formula === ''){
            rule.FormulaErr = 'Rule Code Section is mandatory.';
            rule.valid = false;
        } else {
            delete rule.FormulaErr;
        }
    };

    var validateAlternative = function(rule, alternative, report, prefix){
        var sourceFact = alternative.SourceFact;
        if(sourceFact === undefined || sourceFact === null || sourceFact[0] === '' || sourceFact.length === 0){
            alternative.SourceFactErr = 'Source Fact is mandatory (general characteristics - e.g. credit or debit - will be copied from this fact).';
            alternative.valid = false;
        } else {
            var notExistingConcepts = [];
            // multiple source facts are not supported, this is for future compatibility
            for (var i in sourceFact){
                if(sourceFact.hasOwnProperty(i)) {
                    var concept = report.getConcept(alignConceptPrefix(prefix, sourceFact[i]));
                    if (concept === undefined || concept === null) {
                        notExistingConcepts.push(sourceFact[i]);
                    }
                }
            }
            if(notExistingConcepts.length === 1) {
                alternative.SourceFactErr = 'The source concept "' + notExistingConcepts[0] + '" does not exist.';
                alternative.valid = false;
            } else if(notExistingConcepts.length > 1) {
                alternative.SourceFactErr = 'The following source concepts do not exist: "' + notExistingConcepts.join('", "') + '".';
                alternative.valid = false;
            }else {
                delete alternative.SourceFactErr;
            }
            if(alternative.SourceFactErr === undefined && alternative.BodyErr === undefined && alternative.PrereqErr === undefined){
                alternative.valid = true;
            } else {
                alternative.valid = false;
            }
        }
    };

    var validateAlternatives = function(rule, report, prefix){
        var formulae = rule.Formulae;
        if(formulae === undefined || formulae === null || formulae[0] === '' || formulae.length === 0){
            rule.FormulaeErr = 'At least one alternative code section is mandatory.';
            rule.valid = false;
        } else {
            for (var i in formulae){
                if(formulae.hasOwnProperty(i)) {
                    var alternative = formulae[i];
                    validateAlternative(rule, alternative, report, prefix);
                    if (!alternative.valid) {
                        rule.valid = false;
                    }
                }
            }
        }
    };

    Formula.prototype.validate = function (action) {
        var report = this.report;
        var rule = this.getModel();

        if(rule !== undefined && rule !== null && typeof rule === 'object') {
            var prefix = this.getPrefix();
            var type = rule.Type;
            rule.valid = true;
            validateId(rule, report, action);
            validateLabel(rule);
            validateComputableConcepts(rule, report, prefix);
            validateDependsOnConcepts(rule, report, prefix);
            if(type === 'xbrl28:validation' ){
                validateValidatedConcepts(rule, report, prefix);
            }
            validateFormula(rule);
            if(rule.OriginalLanguage === 'SpreadsheetFormula' ){
                validateAlternatives(rule, report, prefix);
            }
            return rule.valid;
        }
    };

    Formula.prototype.isValid = function(){
        if(this.model === undefined || this.model === null || typeof this.model !== 'object'){
            return false;
        }
        if(this.model.valid === undefined){
            return false;
        }else {
            return this.model.valid;
        }
    };

    Formula.prototype.getRule = function () {
        var model = this.getModel();
        if(model.OriginalLanguage === 'SpreadsheetFormula') {
            this.compile();
        }
        var computableConcepts = alignConceptPrefixes(this.getPrefix(), model.ComputableConcepts);
        var rule = {
            'Id': model.Id,
            'OriginalLanguage': model.OriginalLanguage,
            'Type': model.Type,
            'Label': model.Label,
            'Description': model.Description,
            'ComputableConcepts': computableConcepts,
            'DependsOn': model.DependsOn,
            'Formula': model.Formula
        };
        if(model.ValidatedConcepts !== undefined){
            rule.ValidatedConcepts = alignConceptPrefixes(this.getPrefix(), model.ValidatedConcepts);
        }
        if(model.Formulae !== undefined && model.Formulae !== null && typeof model.Formulae === 'object') {
            rule.Formulae = model.Formulae;
        }
        rule.AllowCrossPeriod = model.AllowCrossPeriod;
        rule.AllowCrossBalance = model.AllowCrossBalance;
        //$log.log('getRule done');
        return rule;
    };

    Formula.prototype.getModel = function () {
        return this.model;
    };

    Formula.prototype.setModel = function (model) {
        ensureParameter(model, 'model', 'object', 'setModel');
        var prefix = this.getPrefix();
        this.model = angular.copy(model);
        if(this.model.ComputableConcepts !== undefined && this.model.ComputableConcepts !== null && typeof this.model.ComputableConcepts === 'object'){
            for (var i in this.model.ComputableConcepts){
                var computableConcept = this.model.ComputableConcepts[i];
                if(computableConcept.indexOf(prefix + ':') === 0){
                    this.model.ComputableConcepts[i] = computableConcept.substring(computableConcept.indexOf(':')+1);
                }
            }
        }

        this.parser = null;
        this.compile();
    };

    Formula.prototype.Id = function() {
        return this.model.Id;
    };
    return Formula;
}]);


