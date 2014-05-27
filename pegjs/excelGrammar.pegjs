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
  = equation

equation
  = equation_single / equation_double1 / equation_double2 / subadd

equation_single
  = _ left:subadd _ sign:([<=>]) _ right:subadd _
    {
      switch(sign[0])
      {
        case '=': return create("eq", left, right);
        case '>': return create("gt", left, right);
        case '<': return create("lt", left, right);
        default : return undefined;
      }
    }

equation_double1
  = _ left:subadd _ sign:([<>] "=") _ right:subadd _
    {
      switch(sign[0])
      {
        case '>': return create("ge", left, right);
        case '<': return create("le", left, right);
        default : return undefined;
      }
    }

equation_double2
  = _ left:subadd _ sign:"<>" _ right:subadd _ { return create("ne", left, right); }

subadd
  = _ left:muldiv _ sign:[+-] _ right:subadd _
    {
      if (sign == "+")
      { return create("add", left, right); }
      else
      { return create("sub", left, right); }
    }
  / muldiv

muldiv
  = _ left:primary _ sign:[*/] _ right:muldiv _
    {
      if (sign == "*")
      { return create("mul", left, right); }
      else
      { return create("div", left, right); }
    }
  / primary

primary
  = integer / block / function / variable

block
  = "(" _ block:equation _ ")" { return createOne("block", block); }

variable
  = _ name:( [a-zA-Z0-9._]+ ) _ { return createVar(name.join("")); }

integer "integer"
  = digits:[0-9.]+ { return createAtomic(parseFloat(digits.join(""), 10)); }

function
  = fun_and / fun_or /fun_not
    / fun_isblank 

fun_and
  = _ name:([aA][nN][dD]) _ "(" _ params:parameter+ _ ")" 
    { return createFun(name.join("").toLowerCase(), params); }

fun_or
  = _ name:"or" _ "(" _ params:parameter+ _ ")" { return createFun(name, params); }

fun_not
  = _ name:"not" _ "(" _ param:parameter _ ")" { return createFun(name, param); }

fun_isblank
  = _ name:"isblank" _ "(" _ param:parameter _ ")" { return createFun(name, param); }

parameter 
  = comma? param:equation { return param; }

ws
  = [ \t\r\n]

_
  = (ws)*

comma 
  = _ "," _
  
