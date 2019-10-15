var Production = require("./production.js").Production;

var nextNonTerminalId = 0;
var NonTerminal = function(name) {
    this.name = name;
    this.id = nextNonTerminalId++;
    this.equals = function(other) {
        return (other instanceof NonTerminal) && (this.id == other.id);
    }
    // Production list kept inside NonTerminal class is ciruclar (semi-duplicate) data
    this.productions = [];
    this.addProduction = function(prod) {
        if(!(prod instanceof Production)) {
            throw "Internal Error : trying to add a non-production to production list";
        }
        this.productions.push(prod);
    };
    this.toString = function() {
        var str = "---> NT " + this.name + " (" + this.id + "),";
        for(var i = 0; i < this.productions.length; i++) {
            str += "\n\t" + this.productions[i].toString();
        }
        str += "\n<---------";
        return str;
    }
    this.isNonTerminal = () => true;
    this.isTerminal = () => false;
    
}

function validate(id) {
    if(/[^A-Za-z0-9_\"\']/g.test(id) || id.length == 0) {
        SyntaxError("Invalid identifier name : \'" + id + "\'");
    } else {
        return true;
    }
}

function indexOfInCode(code, symbol) {
    var stack = [];
    for(var i = 0; i < code.length; i++) {
        var prev = code.charAt(i-1);
        var char = code.charAt(i);
        var top = (stack.length > 0)? stack[stack.length - 1] : null;
        if(char == symbol && stack.length == 0) {
            return i;
        } if(char == '{' && top != '\'' && top != '\"') {
            stack.push(char);
        } else if(char == '}' && top != '\'' && top != '\"') {
            if(top == '{') {
                stack.pop();
            } else {
                syntaxError("Unmatched symbol : }")
            }
        } else if(char == '\'' && (prev != '\\' || (top != '\'' && top != '\"'))) {
            if(top == '\'') {
              stack.pop();
            } else if(top != '\"') {
              stack.push(char);
            }
        } else if(char == '\"' && (prev != '\\' || (top != '\'' && top != '\"'))) {
          if(top == '\"') {
            stack.pop();
          } else if(top != '\'') {
            stack.push(char)
          } 
        }
    }
    if(stack.length != 0) {
        syntaxError("Unmatched symbol : " + stack[stack.length - 1]);
    }
    return -1;
}

/*
function indexOfInCode(code, symbol) {
    var index;
    var start = 0;
    var again;
    do {
        index = code.indexOf(symbol, start);
        if(index === -1) {
            return -1;
        }
        var q1 = code.substring(start).search(/[\'\"{]/g);
        if(q1 !== -1) {
            q1 += start;
            var c1 = code.charAt(q1);
            var q2 = (c1 == '{')? code.indexOf('}', q1 + 1) : code.indexOf(c1, q1 + 1);
            if(q2 !== -1 && (q1 < index && index < q2)) {
                start = q2 + 1;
                again = true;
            } else if(q2 === -1) {
                syntaxError("Unmatched symbol \'" + c1 + "\'");
                again = false;
            } else if(index > q2) {
                again = true;
                start = q2 + 1;
            } else {
                again = false;
            }
        } else { // q1 == -1
            again = false;
        }
    } while(again);
    return index;
}
*/

var splitInCode = function(code, symbol) {
    var res = [];
    var index;
    do {
        index = indexOfInCode(code, symbol);
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
        if(index == -1) {
            syntaxError("Production does not contain \':\'");
        }
        var name = code.substring(0, index).trim();
        validate(name);
        code = code.substring(index + 1);
        index = indexOfInCode(code, ';');
        if(index == -1) {
            syntaxError("Expected \';\'");
        }
        var prodCases = splitInCode(code.substring(0, index), '|').map(rhs => { // !!!
            rhs = rhs.trim();
            var bracketIndex = indexOfInCode(rhs, '{');
            var action = null;
            if(bracketIndex != -1) {
                if(rhs.charAt(rhs.length - 1) != '}') {
                    syntaxError("Expected \'}\' at end of action definition");
                }
                action = rhs.substring(bracketIndex+1,rhs.length-1).trim();
                rhs = rhs.substring(0,bracketIndex);
            }
            var terms = rhs.trim().split(/\s+/g);
            terms.forEach(e => validate(e));
            return {terms: terms, action: action};
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
    var productions = [];
    var isFirst = true;

    for(var nt = 0; nt < ntCases.length; nt++) {
        for(var i = 0; i < ntCases[nt].length; i++) {
            var productionElements = ntCases[nt][i].terms.map(termName => {
                var ntIndex = ntNames.indexOf(termName);
                if(ntIndex != -1) {
                    return nonTerminals[ntIndex];
                }
                var tIndex = tNames.indexOf(termName);
                if(tIndex != -1) {
                    return terminals[tIndex]
                }
                syntaxError("Undefined symbol \'" + termName + "\'");
            });
            var action = ntCases[nt][i].action;
            production = new Production(nonTerminals[nt], productionElements, action, isFirst);
            isFirst = false;
            productions.push(production);
            nonTerminals[nt].addProduction(production);
        }
    }
    return {nonTerminals : nonTerminals, productions : productions};
}

module.exports.NonTerminal = NonTerminal;
module.exports.extract = extract;