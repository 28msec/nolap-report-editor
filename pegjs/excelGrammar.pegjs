{
  function create(type, left, right) {
    return {Type: type, Children: [left,right]};
  }

  function createOne(type, one) {
    return {Type: type, Children: [one]};
  }

  function createAtomic(val) {
    return {Type: "atomic", Value: val};
  }


  function createVar(name) {
    return {Type: "variable", ConceptName: name};
  }

  
  function createFun(name, params) {
    return {Type: "function", Name: name, Params: [params]};
  }

}

start
  = comparison


/*******************
    arithmetics 
*******************/
comparison
  = _ left:subadd _ operator:(op_comparator) _ right:comparison _
    { return create(operator, left, right); }
  / subadd

subadd
  = _ left:muldiv _ operator:(op_subadd) _ right:subadd _
    { return create(operator, left, right); }
  / muldiv

muldiv
  = _ left:primary _ operator:( op_muldiv ) _ right:muldiv _
    { return create(operator, left, right); }
  / primary


/*******************
    Operators
*******************/
op_subadd
  = sign:[+-] { if (sign === "+"){ return "add"; } else { return "sub"; } }

op_muldiv
  = sign:[*/] { if (sign === "*"){ return "mul"; } else { return "div"; } }

op_comparator
  = op_comparator_le_ge/ op_comparator_not_equal / op_comparator_single

op_comparator_le_ge
  = double:( [<>] "=" ){ switch(double.join("")){
                           case "<=": return "le";
                           case ">=": return "ge";
                         };
                       }

op_comparator_not_equal 
  = "<>" { return "ne"; }

op_comparator_single
  = single:[<=>] { return single; } 


/*******************
    Primaries
*******************/
primary
  = integer / block / variable / function

block
  = "(" _ block:comparison _ ")" { return createOne("block", block); }

variable
  = _ name:( [a-zA-Z0-9._]+ & ( _ [^(] ) ) _ { return createVar(name[0].join("")); }

integer "integer"
  = digits:[0-9.]+ { return createAtomic(parseFloat(digits.join(""), 10)); }

function
  = _ ( fun_and / fun_or /fun_not
    / fun_isblank ) _

fun_and
  = name:([aA][nN][dD]) _ "(" _ params:parameter+ _ ")" 
    { return createFun(name.join("").toLowerCase(), params); }

fun_or
  = name:([oO][rR]) _ "(" _ params:parameter+ _ ")" { return createFun(name.join("").toLowerCase(), params); }

fun_not
  = name:"not" _ "(" _ param:parameter _ ")" { return createFun(name, param); }

fun_isblank
  = name:"isblank" _ "(" _ param:parameter _ ")" { return createFun(name, param); }

parameter 
  = comma? param:comparison { return param; }

ws
  = [ \t\r\n]

_
  = (ws)*

comma 
  = _ "," _
  

