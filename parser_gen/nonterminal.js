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

module.exports.NonTerminal = NonTerminal;