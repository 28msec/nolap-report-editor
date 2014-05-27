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
  = subadd


/*******************
    arithmetics 
*******************/
subadd
  = _ left:muldivcomplog _ sign:[+-] _ right:subadd _
    {
      if (sign === "+")
      { return create("add", left, right); }
      else
      { return create("sub", left, right); }
    }
  / muldivcomplog

muldivcomplog
  = _ left:primary _ operator:( op_muldiv / op_comparator / op_logical ) _ right:muldivcomplog _
    { return create(operator, left, right); }
  / primary


/*******************
    Operators
*******************/
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

op_logical 
  = op_log_and / op_log_or

op_log_and
  = "and" { return "and"; }

op_log_or
  = "or" { return "or"; }


/*******************
    Primaries
*******************/
primary
  = integer / block / variable / function

block
  = "(" _ block:subadd _ ")" { return createOne("block", block); }

variable
  = _ name:( "$" [a-zA-Z] [a-zA-Z0-9]* ":" [a-zA-Z0-9_]+) _ { return createVar(name[1] + name[2].join("") + name[3] + name[4].join("")); }

integer "integer"
  = digits:[0-9.]+ { return createAtomic(parseFloat(digits.join(""), 10)); }


function
  = fun_exists

fun_exists
  = _ "exists" _ "(" _ param:parameter _ ")" { return createFun("exists", param); }

parameter
  = comma? param:subadd { return param; }

ws
  = [ \t\r\n]

_
  = (ws)*

comma
  = _ "," _

