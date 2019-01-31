var fs = require("fs");
var definitions = require("./definitions.js");

var code;
try {
    code = fs.readFileSync(process.argv[2], {encoding:"utf8"});
} catch(error) {
    console.error("Cannot read from file : " + process.argv[2]);
    process.exit(1);
}

var sections = code.split("%%");

var header = sections[0];
var defs = sections[1];
var grammar = sections[2];

console.log(definitions.extract(defs));