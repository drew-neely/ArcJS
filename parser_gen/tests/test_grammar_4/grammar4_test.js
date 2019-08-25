var {parse} = require('./grammar4.js');

var testStrings = [
    "4 + 2 * 3 + ( 12 * 2 )",
    "( 17 - 7 * 4 / 2 ) + ( 3 / ( ( 1 ) ) )"
];

var lex = function(str) {
    var symbols = str.trim().split(/\s+/g);
    var tokens = symbols.map(e => {
        if(e == '+') {
            return {type: "plus"};
        } else if(e == '*') {
            return {type: "times"};
        } else if(e == '-') {
            return {type: "minus"};
        } else if(e == '/') {
            return {type: "divide"};
        } else if(e == '(') {
            return {type: "open_paren"};
        } else if(e == ')') {
            return {type: "close_paren"};
        } else {
            return {type: "number", value: Number(e)};
        }
    });
    return tokens;
};

var testTokens = testStrings.map(e => lex(e));

var results = testTokens.map(e => parse(e));
console.log(results);