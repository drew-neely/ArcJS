var fs = require("fs");
var Terminal = require("./terminal.js");
var Production = require("./nonterminal.js");
var slrTable = require("./slrTable.js");

var code;
try {
    code = fs.readFileSync(process.argv[2], {encoding:"utf8"});
} catch(error) {
    console.error("Cannot read from file : " + process.argv[2]);
    process.exit(1);
}

var sections = code.split("%%");

/*
    First section is the header and contains any code that will be directly
    placed at the top of the parser
    %%
    Second section is the definitions of the aliases and the terminals
    alias for aliases and define terminals
        alias NameString ValueString
        define NameString JsonObject
*/

var header = sections[0];
var defString = sections[1];
var prodString = sections[2];

var terminals = Terminal.extract(defString);
// terminals.forEach(e => console.log(e.toString()));
var {nonTerminals, productions} = Production.extract(prodString, terminals);
// nonTerminals.forEach(e => console.log(e.toString()));
productions.forEach(e => console.log(e.toString()));

var parseTable = slrTable(productions, terminals, nonTerminals);
console.log(parseTable.toString());