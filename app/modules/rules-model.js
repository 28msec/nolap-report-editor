'use strict';

angular.module('rules-model',['excel-parser', 'formula-parser'])
.factory('Rule', ['$q', '$log', '$sce', 'ExcelParser', 'FormulaParser', function($q, $log, $sce, ExcelParser, FormulaParser){

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
    var Rule = function(modelOrRuleType, report, computableConcept, language){
        ensureParameter(report, 'report', 'object', 'Rule (Const.)');
        if(typeof modelOrRuleType === 'object' && modelOrRuleType !== null){
            this.report = report;
            this.setModel(modelOrRuleType);
        } else {
            ensureParameter(modelOrRuleType, 'modelOrRuleType', 'string', 'Rule (Const.)',/^(xbrl28:formula)|(xbrl28:validation)$/g,'unknown rule type: ' + modelOrRuleType);
            ensureParameter(computableConcept, 'computableConcept', 'string', 'Rule (Const.)');
            if(language !== undefined && language !== null && language !== 'SpreadsheetFormula'){
                throw new Error('Rule (Const.): unknown original language "' + language + '"');
            }
            this.report = report;
            this.parser = null;
            var concept = report.getConcept(computableConcept);
            if (concept === undefined || concept === null){
                throw new Error('Concept with name ' + computableConcept + ' does not exist.');
            }
            if (modelOrRuleType === 'xbrl28:validation'){

                // find a suitable concept name for the validation result
                var alignedComputableConcept = computableConcept + 'Validation';
                //does a concept with this name already exist?
                var existingConcept = this.report.existsConcept(alignedComputableConcept);
                var count = 2;
                do {
                    if(!existingConcept){
                        break; // found one that we can use
                    }
                    //does it have a rule attached?
                    if(this.report.computableByRules(alignedComputableConcept).length === 0){
                        break; // found one that we can use
                    }
                    alignedComputableConcept = computableConcept + 'Validation' + count;
                    count++;
                    existingConcept = this.report.existsConcept(alignedComputableConcept);
                } while(existingConcept);

                if(language === 'SpreadsheetFormula') {
                    this.setModel({
                        'Id': report.uuid(),
                        'Type': modelOrRuleType,
                        'OriginalLanguage': language,
                        'Label': concept.Label,
                        'Description': 'Rule to validate ' + concept.Label + ' (' + computableConcept +
                            '). It also creates a new fact (' + alignedComputableConcept + ') that contains the validation result.',
                        'ComputableConcepts': [ alignedComputableConcept ],
                        'ValidatedConcepts': [ this.report.hideDefaultConceptPrefix(computableConcept) ],
                        'DependsOn': [],
                        'HideRulesForConcepts': [],
                        'AllowCrossPeriod': true,
                        'AllowCrossBalance': true,
                        'Formulae': [
                            {
                                'PrereqSrc': 'TRUE',
                                'Prereq': {},
                                'SourceFact': [ this.report.hideDefaultConceptPrefix(computableConcept) ],
                                'BodySrc': this.report.hideDefaultConceptPrefix(computableConcept) + ' = ',
                                'Body': {},
                                'active': true
                            }
                        ]
                    });
                } else {
                    this.setModel({
                        'Id': report.uuid(),
                        'Type': modelOrRuleType,
                        'Label': concept.Label + ' Validation',
                        'Description': 'Rule to validate ' + concept.Label + ' (' + computableConcept +
                            '). It also creates a new fact (' + alignedComputableConcept + ') that contains the validation result.',
                        'ComputableConcepts': [ computableConcept + 'Validation' ],
                        'ValidatedConcepts': [ computableConcept ],
                        'DependsOn': [],
                        'HideRulesForConcepts': [],
                        'Formula': ''
                    });
                }
            } else if (modelOrRuleType === 'xbrl28:formula') {
                if(language === 'SpreadsheetFormula') {
                    this.setModel({
                        'Id': report.uuid(),
                        'Type': modelOrRuleType,
                        'OriginalLanguage': language,
                        'Label': concept.Label,
                        'Description': 'Rule to compute ' + concept.Label + ' (' + computableConcept + ').',
                        'ComputableConcepts': [ computableConcept ],
                        'DependsOn': [],
                        'HideRulesForConcepts': [],
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
                        'Label': concept.Label,
                        'Description': 'Rule to compute ' + concept.Label + ' (' + computableConcept + ').',
                        'ComputableConcepts': [ computableConcept ],
                        'DependsOn': [],
                        'HideRulesForConcepts': [],
                        'Formula': ''
                    });
                }
            }
        }
    };

    Rule.prototype.addAlternative = function(){
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

    Rule.prototype.copyAlternative = function(index){
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

    Rule.prototype.removeAlternative = function(index){
        var formulae = this.model.Formulae;
        if(formulae === undefined || formulae === null || index >= formulae.length){
            throw new Error('Index out of bounds: ' + index + '. Array: ' + JSON.stringify(formulae));
        }
        formulae.splice(index, 1);
    };

    Rule.prototype.getPrefix = function(){
        var prefix;
        if(this.report !== undefined && this.report !== null && typeof this.report === 'object'){
            prefix = this.report.getPrefix();
        }
        if(this.report === undefined || prefix === undefined || prefix === null || prefix === ''){
            return 'ext';
        }
        return prefix;
    };

    Rule.prototype.listAvailableConceptNames = function(){
        var result = [];
        if(this.report !== undefined && this.report !== null && typeof this.report === 'object'){
            var concepts = this.report.listConcepts();
            for (var i in concepts){
                var concept = concepts[i];
                if(concepts.hasOwnProperty(i) && (concept.IsAbstract === undefined || concept.IsAbstract === false)){
                    result.push(this.report.hideDefaultConceptPrefix(concept.Name));
                }
            }
        }
        return result;
    };

    Rule.prototype.listConcepts = function(){
        if(this.report !== undefined &&
            this.report.model !== undefined && this.report.model.Hypercubes !== undefined &&
            this.report.model.Hypercubes['xbrl:DefaultHypercube'] !== undefined &&
            this.report.model.Hypercubes['xbrl:DefaultHypercube'].Aspects !== undefined &&
            this.report.model.Hypercubes['xbrl:DefaultHypercube'].Aspects['xbrl:Concept'] !== undefined &&
            this.report.model.Hypercubes['xbrl:DefaultHypercube'].Aspects['xbrl:Concept'].Domains !== undefined &&
            this.report.model.Hypercubes['xbrl:DefaultHypercube'].Aspects['xbrl:Concept'].Domains['xbrl:ConceptDomain'] !== undefined &&
            this.report.model.Hypercubes['xbrl:DefaultHypercube'].Aspects['xbrl:Concept'].Domains['xbrl:ConceptDomain'].Members !== undefined) {
            return this.report.model.Hypercubes['xbrl:DefaultHypercube']
                .Aspects['xbrl:Concept']
                .Domains['xbrl:ConceptDomain']
                .Members;
        } else {
            return undefined;
        }
    };

    Rule.prototype.getParser = function() {
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

    /*Rule.prototype.updateView = function() {
        this.view = JSON.stringify(this.model, null, ' ');
    };*/

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
        var result = [];
        var formulae = obj.Formulae;
        if(formulae !== undefined && formulae !== null && typeof formulae === 'object'){
            for(var i in formulae){
                var alternative = formulae[i];
                result = result.concat(inferDependenciesImpl(formula, alternative));
            }
            result = formula.report.alignConceptPrefixes(result);
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
            case 'eq': result.push(toAuditTrail(children[0]) + ' || " = " || ' + toAuditTrail(children[1])); break;
            case 'ne': result.push(toAuditTrail(children[0]) + ' || " <> " || ' + toAuditTrail(children[1])); break;
            case 'gt': result.push(toAuditTrail(children[0]) + ' || " > " || ' + toAuditTrail(children[1])); break;
            case 'ge': result.push(toAuditTrail(children[0]) + ' || " >= " || ' + toAuditTrail(children[1])); break;
            case 'lt': result.push(toAuditTrail(children[0]) + ' || " < " || ' + toAuditTrail(children[1])); break;
            case 'le': result.push(toAuditTrail(children[0]) + ' || " <= " || ' + toAuditTrail(children[1])); break;

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

    var getUniqueFacts = function(report, rule){
        var facts = [];
        facts = facts.concat(rule.ComputableConcepts);
        facts = facts.concat(rule.DependsOn);
        if((rule.OriginalLanguage === 'SpreadsheetFormula') &&
            rule.Formulae !== undefined && rule.Formulae !== null) {
            for (var i in rule.Formulae) {
                facts = facts.concat(rule.Formulae[i].SourceFact);
            }
        }
        return makeUnique(report.alignConceptPrefixes(facts));
    };

    Rule.prototype.toJsoniq = function() {
        var result = [];
        var prefix = this.getPrefix();
        var report = this.report;
        var computedConcept = report.alignConceptPrefix(this.model.ComputableConcepts[0]);
        if(this.model !== undefined && this.model !== null && typeof this.model ==='object') {
            if ((this.model.OriginalLanguage === 'SpreadsheetFormula') &&
                this.model.Formulae !== undefined && this.model.Formulae !== null) {

                var facts = getUniqueFacts(report, this.model);
                var computedFactVariable;
                if(computedConcept.indexOf( prefix + ':') === 0){
                    computedFactVariable = report.hideDefaultConceptPrefix(computedConcept);
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
                    variable.Concept = report.alignConceptPrefix(concept);
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
                var canonicalSerialization = '  facts:canonically-serialize-object($facts, ($facts:CONCEPT, "_id", "IsInDefaultHypercube", "Type", "Value", "Decimals", "AuditTrails", "xbrl28:Type"';
                if (allowCrossBalance) {
                    canonicalSerialization += ', "Balance"';
                }
                if (allowCrossPeriod) {
                    canonicalSerialization += ', $facts:PERIOD';
                }
                canonicalSerialization += '))';
                result.push(canonicalSerialization);
                if (allowCrossPeriod) {
                    result.push('  , $aligned-period');
                }
                result.push('let $warnings as string* := ()')
                for(var x in variables){
                    if(variables.hasOwnProperty(x)) {
                        var v = variables[x];
                        result.push('let $' + v.Name + ' as object* := $facts[$$.$facts:ASPECTS.$facts:CONCEPT eq "' + v.Concept + '"]');
                        result.push('let $warnings := ($warnings, if(count($' + v.Name + ') gt 1)');
                        result.push('                             then if(count(distinct-values($'+v.Name+'.Value)) gt 1))');
                        result.push('                                  then "Cell collision with multiple values for concept ' + v.Name + '"');
                        result.push('                                  else "Cell collision with consistent values for concept ' + v.Name + '"');
                        result.push('                             else ())');
                        result.push('let $' + v.Name + ' as object? := $' + v.Name + '[1]');
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
                        var sourceFacts = report.alignConceptPrefixes(alternative.SourceFact);
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
                        
                        var validatedFactVariable;
                        if(this.model.Type === 'xbrl28:validation'){
                            var validatedConcept = report.alignConceptPrefix(this.model.ValidatedConcepts[0]);
                            if(validatedConcept.indexOf( prefix + ':') === 0){
                                validatedFactVariable = report.hideDefaultConceptPrefix(validatedConcept);
                            }else{
                                validatedFactVariable = validatedConcept.replace(/:/g, '_');
                            }
                        }                        

                        result.push('  case (' + sourceFactExistenceCheck + ' and ' + toComputation(prereq) + ')');
                        result.push('  return');
                        result.push('    let $computed-value := ' + toComputation(body));
                        result.push('    let $audit-trail-message as string* := ');
                        if(this.model.Type === 'xbrl28:formula'){
                            result.push('      rules:fact-trail({"Aspects": { "xbrl:Unit" : $_unit, "xbrl:Concept" : "' + computedConcept + '" }, Value: $computed-value }) || " = " || ');
                        }
                        result.push('         ' + toAuditTrail(body));
                        result.push('    let $audit-trail-message as string* := ($audit-trail-message, $warnings)');
                        result.push('    let $source-facts as object* := (' + auditTrailSourceFacts + ')');
                        result.push('    return');
                        result.push('      if(string(number($computed-value)) != "NaN" and not($computed-value instance of xs:boolean) and $computed-value ne xs:integer($computed-value))');
                        result.push('      then');
                        result.push('        copy $newfact :=');
                        result.push('          rules:create-computed-fact(');
                        result.push('            $' + sourceFactVariable + ',');
                        result.push('            "' + computedConcept + '",');
                        result.push('            $computed-value,');
                        result.push('            $rule,');
                        result.push('            $audit-trail-message,');
                        result.push('            $source-facts,');
                        result.push('            $options)');
                        result.push('        modify (');
                        result.push('            replace value of json $newfact("Decimals") with 2');
                        result.push('          )');
                        result.push('        return $newfact');
                        result.push('      else');
                        result.push('        rules:create-computed-fact(');
                        result.push('          $' + sourceFactVariable + ',');
                        result.push('          "' + computedConcept + '",');
                        result.push('          $computed-value,');
                        result.push('          $rule,');
                        result.push('          $audit-trail-message,');
                        result.push('          $source-facts,');
                        if (this.model.Type === 'xbrl28:validation') {
                            result.push('            $options,');
                            result.push('            $' + validatedFactVariable + ',');
                            result.push('            $computed-value)');
                        }
                        else {
                            result.push('            $options)');
                        }

                    }
                }
                result.push('  default return ()');

            }
        }
        return result.join('\n');
    };

    Rule.prototype.compile = function() {
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

    var bodyEmptyErrorMessage = 'Example: "NetIncomeLoss / Assets"';

    Rule.prototype.compileBodyDeferred = function(index) {
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

    Rule.prototype.compileBody = function(index, async, action) {
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

    Rule.prototype.compilePrereqDeferred = function(index) {
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

    Rule.prototype.compilePrereq = function(index, async, action) {
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

    var validateComputableConcepts = function(rule, report){
        var computableConcepts = rule.ComputableConcepts;
        if(computableConcepts[0] === '' || computableConcepts.length === 0){
            rule.ComputableConceptsErr = 'Computable Concept is mandatory.';
            rule.valid = false;
        } else if(rule.Type === 'xbrl28:validation' && rule.OriginalLanguage === 'SpreadsheetFormula'){
            delete rule.ComputableConceptsErr;
        } else {
            var notExistingConcepts = [];
            for (var i in computableConcepts){
                if(computableConcepts.hasOwnProperty(i)) {
                    var concept = report.getConcept(report.alignConceptPrefix(computableConcepts[i]));
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

    var validateDependsOnConcepts = function(rule, report){
        var dependsOnConcepts = rule.DependsOn;
        var notExistingConcepts = [];
        for (var i in dependsOnConcepts){
            if(dependsOnConcepts.hasOwnProperty(i)) {
                var concept = report.getConcept(report.alignConceptPrefix(dependsOnConcepts[i]));
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

    var validateHideRulesForConcepts = function(rule, report){
        var hideRulesForConcepts = rule.HideRulesForConcepts;
        var notExistingConcepts = [];
        for (var i in hideRulesForConcepts){
            if(hideRulesForConcepts.hasOwnProperty(i)) {
                var concept = report.getConcept(report.alignConceptPrefix(hideRulesForConcepts[i]));
                if (concept === undefined || concept === null) {
                    notExistingConcepts.push(hideRulesForConcepts[i]);
                }
            }
        }
        if(notExistingConcepts.length === 1) {
            rule.HideRulesForConceptsErr = 'The concept "' + notExistingConcepts[0] + '" does not exist.';
            rule.valid = false;
        } else if(notExistingConcepts.length > 1) {
            rule.HideRulesForConceptsErr = 'The following concepts do not exist: "' + notExistingConcepts.join('", "') + '".';
            rule.valid = false;
        }else {
            delete rule.HideRulesForConceptsErr;
        }
    };

    var validateValidatedConcepts = function(rule, report){
        var validatedConcepts = rule.ValidatedConcepts;
        if(validatedConcepts[0] === '' || validatedConcepts.length === 0){
            rule.ValidatedConceptsErr = 'Validated Concept is mandatory.';
            rule.valid = false;
        } else {
            var notExistingConcepts = [];
            for (var i in validatedConcepts){
                if(validatedConcepts.hasOwnProperty(i)) {
                    var concept = report.getConcept(report.alignConceptPrefix(validatedConcepts[i]));
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

    var validateRule = function(rule){
        var formula = rule.Formula;
        if((formula === undefined || formula === null || formula === '') && rule.OriginalLanguage !== 'SpreadsheetFormula'){
            rule.FormulaErr = 'Rule Code Section is mandatory.';
            rule.valid = false;
        } else {
            delete rule.FormulaErr;
        }
    };

    var validateAlternative = function(rule, alternative, report){
        var sourceFact = alternative.SourceFact;
        if(sourceFact === undefined || sourceFact === null || sourceFact[0] === '' || sourceFact.length === 0){
            alternative.SourceFactErr = $sce.trustAsHtml('Source Fact is mandatory (general characteristics - e.g. credit or debit - will be copied from this fact).');
            alternative.valid = false;
        } else {
            var notExistingConcepts = [];
            // multiple source facts are not supported, this is for future compatibility
            for (var i in sourceFact){
                if(sourceFact.hasOwnProperty(i)) {
                    var concept = report.getConcept(report.alignConceptPrefix(sourceFact[i]));
                    if (concept === undefined || concept === null) {
                        notExistingConcepts.push(sourceFact[i]);
                    }
                }
            }
            if(notExistingConcepts.length === 1) {
                alternative.SourceFactErr =
                    $sce.trustAsHtml(
                            'The source concept "' + notExistingConcepts[0] + '" does not exist.');
                alternative.valid = false;
            } else if(notExistingConcepts.length > 1) {
                alternative.SourceFactErr = $sce.trustAsHtml('The following source concepts do not exist: "' + notExistingConcepts.join('", "') + '".');
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

    var validateAlternatives = function(rule, report){
        var formulae = rule.Formulae;
        var hasActive = false;
        if(formulae === undefined || formulae === null || formulae[0] === '' || formulae.length === 0){
            rule.FormulaeErr = 'At least one alternative code section is mandatory.';
            rule.valid = false;
        } else {
            for (var i in formulae){
                if(formulae.hasOwnProperty(i)) {
                    var alternative = formulae[i];
                    validateAlternative(rule, alternative, report);
                    if(alternative.active){
                        hasActive = true;
                    }
                    if (!alternative.valid) {
                        rule.valid = false;
                    }
                }
            }
            if(!hasActive){
                formulae[0].active = true;
            }
        }
    };

    Rule.prototype.validate = function (action, updateDependencies) {
        var report = this.report;
        var rule = this.getModel();

        if(rule !== undefined && rule !== null && typeof rule === 'object') {
            var type = rule.Type;
            rule.valid = true;
            validateId(rule, report, action);
            validateLabel(rule);
            validateComputableConcepts(rule, report);
            if(updateDependencies !== undefined && updateDependencies){
                inferDependencies(this, this.model, true);
            }
            validateDependsOnConcepts(rule, report);
            validateHideRulesForConcepts(rule, report);
            if(type === 'xbrl28:validation' ){
                validateValidatedConcepts(rule, report);
            }
            validateRule(rule);
            if(rule.OriginalLanguage === 'SpreadsheetFormula' ){
                validateAlternatives(rule, report);
            }
            return rule.valid;
        }
    };

    var validateASTItem = function(item){
        var type = item.Type;
        var name = item.Name; //variable
        var value = item.Value; //atomic
        var children = item.Children;
        if(type === undefined || type === null || typeof type !== 'string'){
            throw new Error('Not a valid object in AST (expected object to have field "Type"): ' + JSON.stringify(item) + '.');
        }
        if(name !== undefined && typeof name === 'string'){
            if(value !== undefined && typeof value === 'string'){
                throw new Error('Not a valid object in AST (object contains fields "Name" and "Value"): ' + JSON.stringify(item) + '.');
            }
        }
        if(value !== undefined && typeof value === 'string'){
            if(children !== undefined && typeof children === 'object'){
                throw new Error('Not a valid object in AST (object contains fields "Value" and "Children"): ' + JSON.stringify(item) + '.');
            }
        }
        if(children !== undefined && children !== null && children.length === undefined) {
            throw new Error('Not a valid object in AST (children not array): ' + JSON.stringify(item) + '.');
        }
        if(children !== undefined && children !== null && children.length !== undefined && children.length > 0) {
            for (var i in children){
                if(children.hasOwnProperty(i)) {
                    validateASTItem(children[i]);
                }
            }
        }
    };

    // test whether auto generated AST is valid
    Rule.prototype.validateASTs = function(){
        var formulae = this.getModel().Formulae;
        if(formulae === undefined || formulae === null || formulae[0] === '' || formulae.length === 0){
            return true;
        } else {
            for (var i in formulae){
                if(formulae.hasOwnProperty(i)) {
                    var alternative = formulae[i];
                    validateASTItem(alternative.Prereq);
                    validateASTItem(alternative.Body);
                }
            }
        }
        return true;
    };

    Rule.prototype.isValid = function(){
        if(this.model === undefined || this.model === null || typeof this.model !== 'object'){
            return false;
        }
        if(this.model.valid === undefined){
            return false;
        }else {
            return this.model.valid;
        }
    };

    Rule.prototype.getRule = function () {
        var model = this.getModel();
        if(model.OriginalLanguage === 'SpreadsheetFormula') {
            this.compile();
        }
        var report = this.report;
        var computableConcepts = report.alignConceptPrefixes(model.ComputableConcepts);
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
            rule.ValidatedConcepts = report.alignConceptPrefixes(model.ValidatedConcepts);
        }
        if(model.Formulae !== undefined && model.Formulae !== null && typeof model.Formulae === 'object') {
            var formulae = [];
            angular.forEach(model.Formulae,
                function (formula) {
                    formulae.push(
                        {
                            'PrereqSrc': formula.PrereqSrc,
                            'SourceFact': formula.SourceFact,
                            'BodySrc': formula.BodySrc
                        }
                    );
                }
            );
            rule.Formulae = formulae;
        }
        rule.AllowCrossPeriod = model.AllowCrossPeriod;
        rule.AllowCrossBalance = model.AllowCrossBalance;
        rule.HideRulesForConcepts = report.alignConceptPrefixes(model.HideRulesForConcepts);

        return rule;
    };

    Rule.prototype.getModel = function () {
        return this.model;
    };

    Rule.prototype.setModel = function (model) {
        ensureParameter(model, 'model', 'object', 'setModel');
        this.model = angular.copy(model);
        this.model.ComputableConcepts = this.report.hideDefaultConceptPrefixes(this.model.ComputableConcepts);
        if(this.model.HideRulesForConcepts !== undefined){
            this.model.HideRulesForConcepts = this.report.hideDefaultConceptPrefixes(this.model.HideRulesForConcepts);
        } else {
            this.model.HideRulesForConcepts = [];
        }
        this.parser = null;
        //this.compile();
    };

    Rule.prototype.Id = function() {
        return this.model.Id;
    };
    return Rule;
}]);
