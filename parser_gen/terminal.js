
var nextTerminalId = 0;
var Terminal = function(name, properties, isEOF) {
    this.name = name;
    this.properties = properties;
    this.isEOF = function() {
        return (isEOF == undefined)? false : true;
    }
    this.id = nextTerminalId++;
    this.toString = () => "(" + (this.id < 10 ? ' ' : '') + this.id + "T) " + this.name + " " + JSON.stringify(this.properties)
    // this.toString = () => "--->  T " + this.name + " (" + this.id + "),\n\t" + JSON.stringify(this.properties) + "\n<---------"
    this.equals = function(other) {
        return (other instanceof Terminal) && (this.id == other.id);
    }
    this.isNonTerminal = () => false;
    this.isTerminal = () => true;
}

var ALIAS = "alias"
// alias str1 str2 -> every future instance of str1 in right side of alias 
//      and define operations will be replaced by str2

var DEFINE = "define"
// define terminal obj -> defines a terminal token 'term' that matches any
//      token with the properties in obj : obj is in the form { str : str2 }
//      where str2 is a javascript expression

function getPair(op) {
    var space = 0;
    while(op.charAt(space) != ' ') {
        space++;
        if(space >= op.length - 1) {
            syntaxError("Invalid argument pair :\n\t" + op);
        }
    }
    var alias = op.substring(0, space);
    var substitution = op.substring(space+1);
    return [alias, substitution];
}

function isAlphaNumeric(char) {
    var code = char.charCodeAt(0);
    var num     = code > 47 && code < 58;
    var upalph  = code > 64 && code < 91;
    var lowalph = code > 96 && code < 123;
    if (num || upalph || lowalph) {
        return true;
    } else {
        return false;
    }
}

 // !!! // if alias is substring of another word, value will still be subbed in
function subAliases(code, aliases) {
    for(var i = 0; i < aliases.length; i++) {
        var id = aliases[i][0];
        var sub = aliases[i][1];
        var again = false;
        var index = 0;
        do {
            index = code.indexOf(id, index);
            if(index !== -1) {
                var aChar = code.charAt(index - 1);
                var bChar = code.charAt(index + id.length);
                if(!isAlphaNumeric(aChar) && !isAlphaNumeric(bChar)) {
                    code = code.substring(0, index) + sub + code.substring(index + id.length);
                }
                again = true;
                index++;
            } else {
                again = false;
            }
        } while(again);
    }
    return code;
}

function objectify(objString) {
    objString = objString.trim();
    var firstChar = objString.charAt(0);
    var lastChar = objString.charAt(objString.length - 1);
    if(firstChar != '{' || lastChar != '}') {
        syntaxError("Unpaired \'{\' or '\}\' in \'" + objString + "\'");
    }

    var middle = objString.substring(1,objString.length-1);

    var obj = {};
    if(middle.length > 0) {
        middle.split(',').map(pairStr => {
            var pair = pairStr.split(':');
            if(pair.length != 2) {
                syntaxError("Invalid object entry : \'" + pairStr + "\'");
            }
            pair = pair.map(e => e.trim());
            return pair;
        }).forEach(pair => {
            obj[pair[0]] = pair[1];
        });
    }

    return obj;
}

var syntaxError = function(str) {
    throw "Syntax Error: " + str;
}

function extract(defs) {
    var ops = defs.split("\n").map(e => {
        return e.replace(/\s+/g, ' ').trim(); // All white space -> ' '
    }).filter(e => {
        return e.length != 0; // Remove empty lines (probably won't be any ?)
    });
    var aliases = [];
    var definitions = [];
    for(var i = 0; i < ops.length; i++) {
        var op = ops[i];
        if(op.substring(0, ALIAS.length) == ALIAS) {
            op = op.substring(ALIAS.length + 1);
            var alias = getPair(op);
            aliases.push(alias);
        } else if(op.substring(0, DEFINE.length) == DEFINE) {
            op = op.substring(DEFINE.length + 1);
            var def = getPair(op);
            var name = def[0];
            var code = def[1];
            code = subAliases(code, aliases);
            definitions.push(new Terminal(name, objectify(code)));
        } else {
            syntaxError("Invalid line :\n\t" + op);
        }
    }
    definitions.push(new Terminal("EOF", {type : "EOF"}, true)) // !!! // define EOF symbol better
    return definitions;
}

module.exports = {extract: extract, Terminal: Terminal};