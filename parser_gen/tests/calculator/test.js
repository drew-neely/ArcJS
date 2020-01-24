var {parse} = require('./grammar.js');

var testStrings = [
    "1 + 2 * 3 + 4 - 10 / 5",
    "4 + 2 * 3 + ( 12 * 2 )",
    "( 2 + 3 ) * 4",
    "( 17 - 7 * 4 / 2 ) + ( 3 / ( ( 1 ) ) )",
    "( 3 + 2",
    "( 2 * 2 + 7) 4",
    "( 1 + )",
    "3 + 7 * 2 +",
    ""
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
        } else if(e != '') {
            return {type: "number", value: Number(e)};
        } else {
            return undefined;
        }
    });
    tokens = tokens.filter(e => e != undefined)
    return tokens;
};

var testTokens = testStrings.map(e => lex(e));
// console.log(testTokens)

var results = testTokens.map(e => {
    try {
        return parse(e);
    } catch(error) {
        return {"Error": error};
    }
});
console.log(results);