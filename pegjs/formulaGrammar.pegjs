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
  / logical

logical
  = log_and / log_or / primary

log_and
  = _ left:primary _ "and" _ right:equation _
    {
      return create("and", left, right);
    }

log_or
  = _ left:primary _ "or" _ right:equation _
    {
      return create("or", left, right);
    }

primary
  = integer / block / variable / function

block
  = "(" _ block:equation _ ")" { return createOne("block", block); }

variable
  = _ name:( "$" [a-zA-Z] [a-zA-Z0-9]* ":" [a-zA-Z0-9_-]+) _ { return createVar(name[1] + name[2].join("") + name[3] + name[4].join("")); }

integer "integer"
  = digits:[0-9.]+ { return createAtomic(parseFloat(digits.join(""), 10)); }


function
  = fun_exists

fun_exists
  = _ "exists" _ "(" _ param:parameter _ ")" { return createFun("exists", param); }

parameter
  = comma? param:equation { return param; }

ws
  = [ \t\r\n]

_
  = (ws)*

comma
  = _ "," _

