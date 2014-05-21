{
  function create(type, left, right) {
    return {Type: type, Children: [left,right]};
  }

  function createOne(type, one) {
    return {Type: type, Children: [one]};
  }

  function createVar(name) {
    return {Type: "variable", ConceptName: name};
  }

}

start
  = subadd

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
  = integer / block / variable

block
  = "(" _ block:subadd _ ")" { return createOne("block", block); }

variable
  = _ name:( "$" [a-zA-Z] [a-zA-Z0-9]* ":" [a-zA-Z0-9_-]+) _ { return createVar(name[1] + name[2].join("") + name[3] + name[4].join("")); }

integer "integer"
  = digits:[0-9.]+ { return parseFloat(digits.join(""), 10); }

ws
 = [ \t\r\n]

_
 = (ws)*

