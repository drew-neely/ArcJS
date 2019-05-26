
var nextNonTerminalId = 0;
var NonTerminal = function(name) {
    this.name = name;
    this.productions = [];
    this.addProduction = function(prod) {
        if(!(prod instanceof Production)) {
            throw "Internal Error : trying to add a non-production to production list";
        }
        this.productions.push(prod);
    };
    this.id = nextNonTerminalId++;
    this.toString = function() {
        var str = "---> NT " + this.name + " (" + this.id + "),";
        for(var i = 0; i < this.productions.length; i++) {
            str += "\n\t" + this.productions[i].toString();
        }
        str += "\n<---------";
        return str;
    }
}

var Production = function(terms) {
    this.terms = terms;
    this.toString = function() {
        return terms.map(function(e) {
            return "<" + ((e instanceof NonTerminal)? "NT" : "T") + " " + e.name + ">";
        }).join(' ');
    }
}


function validate(id) {
    if(/[^A-Za-z0-9_\"\']/g.test(id) || id.length == 0) {
        SyntaxError("Invalid identifier name : \'" + id + "\'");
    } else {
        return true;
    }
}

function indexOfNoQuotes(code, symbol) {
    var index;
    var start = 0;
    var again;
    do {
        index = code.indexOf(symbol, start);
        if(index === -1) {
            return -1;
        }
        var q1 = code.substring(start).search(/[\'\"]/g);
        if(q1 !== -1) {
            q1 += start;
            var c1 = code.charAt(q1);
            var q2 = code.indexOf(c1, q1 + 1);
            if(q2 !== -1 && (q1 < index && index < q2)) {
                start = q2 + 1;
                again = true;
            } else if(q2 === -1) {
                syntaxError("Unmatched symbol \'" + c1 + "\'");
                again = false;
            } else {
                again = false;
            }
        } else { // q1 == -1
            again = false;
        }
    } while(again);
    return index;
}

var splitNoQuotes = function(code, symbol) {
    var res = [];
    var index;
    do {
        index = indexOfNoQuotes(code, symbol);
        if(index !== -1) {
            res.push(code.substring(0, index));
            code = code.substring(index + 1);
        }
    } while(index !== -1);
    res.push(code);
    return res;
}

var syntaxError = function(str) {
    throw "Syntax Error: " + str;
}

function lex(code) {
    code = code.split("//").map(e => {
        var endLine = e.indexOf('\n');
        if(endLine >= 0) {
            return e.substring(endLine);
        } else { // last line comment edge case
            return "";
        }
    }).join("");
    var names = [];
    var cases = [];
    while(code.trim() != '') {
        var index = code.indexOf(':');
        if(index === -1) {
            SyntaxError("Production does not contain \':\'");
        }
        var name = code.substring(0, index).trim();
        validate(name);
        code = code.substring(index + 1);

        index = indexOfNoQuotes(code, ';');
        // var prodCases = code.substring(0, index).split('|').map(e => { // !!!
        var prodCases = splitNoQuotes(code.substring(0, index), '|').map(e => { // !!!
            var terms = e.trim().split(/\s+/g);
            terms.forEach(e => validate(e));
            return terms;
        });
        code = code.substring(index + 1);

        names.push(name);
        cases.push(prodCases);
    }
    return {ntNames: names, ntCases: cases};
}

/* *Notes*
    BuffaloTokenType = {
        name : "...",
        properties : {... : "...", ...},
        id : ###
    }
*/

function validateNamespace(names, tNames) {
    for(var i = 0; i < tNames.length; i++) {
        if(names.indexOf(tNames[i]) !== -1) {
            syntaxError("The name \'" + tNames[i] +"\' is used as a definition and production name");
        }
    }
    for(var i = 0; i < names.length; i++) {
        if(names.indexOf(names[i], i+1) !== -1) {
            syntaxError("The name \'" + tNames[i] + "\' is as multiple production names");
        }
    }
}



function extract(code, terminals) {
    var {ntNames, ntCases} = lex(code);
    var tNames = terminals.map(e => e.name);
    validateNamespace(ntNames, tNames);

    var nonTerminals = [];
    for(var i = 0; i < ntNames.length; i++) {
        nonTerminals.push(new NonTerminal(ntNames[i]));
    }

    for(var nt = 0; nt < ntCases.length; nt++) {
        for(var i = 0; i < ntCases[nt].length; i++) {
            nonTerminals[nt].addProduction(
                new Production(ntCases[nt][i].map(termName => {
                    var ntIndex = ntNames.indexOf(termName);
                    if(ntIndex != -1) {
                        return nonTerminals[ntIndex];
                    }
                    var tIndex = tNames.indexOf(termName);
                    if(tIndex != -1) {
                        return terminals[tIndex]
                    }
                    syntaxError("Undefined symbol \'" + termName + "\'");
                })
            ));
        }
    }
    return nonTerminals;
}

module.exports = {extract: extract}