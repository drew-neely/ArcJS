var {parse} = require('./grammar3.js');

var input = "4 + 2 * 3 + ( 12 * 2 )";

var lex = function(str) {
    var symbols = str.split(/\s+/g);
    var tokens = symbols.map(e => {
        if(e == '+') {
            return {type: "plus"};
        } else if(e == '*') {
            return {type: "times"};
        } else if(e == '(') {
            return {type: "open_paren"};
        } else if(e == ')') {
            return {type: "close_paren"};
        } else {
            return {type: "id", value: Number(e)};
        }
    });
    return tokens;
};

var tokens = lex(input);
tokens.forEach(e => console.log(e));

var value = parse(tokens);
console.log(value);