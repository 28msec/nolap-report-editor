{
  function create(type, left, right) {
    return {Type: type, Children: [left,right]};
  }

  function createOne(type, one) {
    return {Type: type, Children: [one]};
  }

  function createAtomic(type, val) {
    return {Type: type, Value: val};
  }


  function createVar(name) {
    return {Type: "variable", Name: name};
  }

  
  function createFun(name, params) {
    if(typeof params === 'object' && params.length !== undefined){
      return {Type: "function", Name: name.toLowerCase(), Children: params};
    } else {
      return {Type: "function", Name: name.toLowerCase(), Children: [params]};
    }
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
  = single:[<=>] { switch(single){
                     case "=": return "eq";
                     case "<": return "lt";
                     case ">": return "gt";
                   };
                 } 


/*******************
    Primaries
*******************/
primary
  = integer / block / boolean / variable / function / variable2

block
  = "(" _ block:comparison _ ")" { return createOne("block", block); }

boolean
  = true / false

true
  = _ ([Tt][Rr][Uu][Ee]) _ { return createAtomic('boolean', 'true'); }

false
  = _ ([Ff][Aa][Ll][Ss][Ee]) _ { return createAtomic('boolean', 'false'); }

variable
  = _ name:( [a-zA-Z0-9._]+ & ( _ [^(] ) ) _ { return createVar(name[0].join("")); }

variable2
  = _ name:( [a-zA-Z0-9._]+ ) _ { return createVar(name.join("")); }

integer "integer"
  = digits:[0-9.]+ { return createAtomic('numeric', parseFloat(digits.join(""), 10)); }

function
  = fun_and / fun_or /fun_not
    / fun_isblank

fun_and
  = _ name:([aA][nN][dD]) _ "(" _ params:parameter+ _ ")" _
    { return createFun(name.join("").toLowerCase(), params); }

fun_or
  = _ name:([oO][rR]) _ "(" _ params:parameter+ _ ")" _ { return createFun(name.join(""), params); }

fun_not
  = _ name:"not" _ "(" _ param:parameter _ ")" _ { return createFun(name, param); }

fun_isblank
  = _ name:"isblank" _ "(" _ param:parameter _ ")" _ { return createFun(name, param); }

parameter
  = _ comma? _ param:comparison _ { return param; }

ws
  = [ \t\r\n]

_
  = (ws)*

comma 
  = _ "," _

