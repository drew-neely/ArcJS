var fs = require("fs");
var {lex} = require("./buffalo_lexer.js");
var {parse} = require("./buffalo_parser.js");
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

var tokens = lex(code);
var {header, terminals, nonTerminals, productions} = parse(tokens);

/*
console.log("HEADER :::\n");
console.log(header)
console.log("\n\nTERMINALS :::\n");
terminals.forEach(e => console.log(e.toString()));
console.log("\n\nNONTERMINALS :::\n");
nonTerminals.forEach(e => console.log(e.toString()));
console.log("\n\nPRODUCTIONS :::\n");
productions.forEach(e => console.log(e.toString()));
*/

var parseTable = buildParseTable(productions, terminals, nonTerminals);
var parser = generateParser(parseTable, header);

var outputFilename = process.argv[2].replace(/\.buf$/g, ".js");
fs.writeFileSync(outputFilename, parser);
process.exit();