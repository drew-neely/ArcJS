
var fs = require("fs");
var Terminal = require("./terminal.js");
var NonTerminal = require("./nonterminal.js");
var { Production } = require("./production.js");
var { buildParseTable } = require("./slrTable.js");
var { generateParser } = require("./code_generation.js");


if(!/\.buf$/g.test(process.argv[2])) {
    console.error("Invalid file type : " + process.argv[2]);
    process.exit(1);
}

var code;
try {
    code = fs.readFileSync(process.argv[2], {encoding:"utf8"});
} catch(error) {
    console.error("Cannot read from file : " + process.argv[2]);
    process.exit(1);
}

/*
    First section is the header and contains any code that will be directly
    placed at the top of the parser
    %%
    Second section is the definitions of the aliases and the terminals
    alias for aliases and define terminals
        alias NameString ValueString
        define NameString JsonObject
*/
var sections = code.split("%%");
var header = sections[0];
var defString = sections[1];
var prodString = sections[2];

var terminals = Terminal.extract(defString);
var {nonTerminals, productions} = NonTerminal.extract(prodString, terminals);
var parseTable = buildParseTable(productions, terminals, nonTerminals);
var parser = generateParser(parseTable, header);

var outputFilename = process.argv[2].replace(/\.buf$/g, ".js");
fs.writeFileSync(outputFilename, parser);