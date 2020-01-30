
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

function objectify(objString) { // !!! // This method is really bad, should fix
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
            // valueStart = pair[1].charAt(0);
            // valueEnd = pair[1].charAt(pair[1].length - 1);
            // if((valueStart == '\"' && valueEnd == '\"')|| (valueStart == '\'' && valueEnd == '\'')) {
            //     pair[1] = pair[1].substring(1, pair[1].length - 1);
            // }
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

module.exports.Terminal = Terminal;
module.exports.subAliases = subAliases;
module.exports.objectify = objectify;