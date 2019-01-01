var lexer = require("./lexer.js");
var fs = require("fs");

try {
    var code = fs.readFileSync(process.argv[2], {encoding:"utf8"});
} catch(error) {
    console.error("Cannot read from file : " + process.argv[2]);
    process.exit(1);
}

var res = (new lexer(code)).lex();
for(var i = 0; i < res.length; i++) {
    res[i].print();
}