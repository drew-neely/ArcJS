var Item = require("./item.js").Item;

var nextProductionRuleNumber = 0;
var Production = function(LHS, RHS, action, isStart) {
    if(!LHS.isNonTerminal()) {
        throw "Internal Error : LHS of production must be a NonTerminal";
    }
    this.ruleNumber = nextProductionRuleNumber++; // Increment after assignment
    this.LHS = LHS
    this.RHS = RHS;
    this.isStart = isStart;
    this.action = action;
    this.startItem = new Item(this);
    this.toString = function() {
        var lString = this.LHS.name
        var rString = this.RHS.map(e => e.name).join(' ');
        var aString = "{" + this.action + "}";
        return lString + " -> " + rString + "\n\t" + aString;
    }
    this.equals = function(other) {
        if ((other instanceof Production) && this.LHS.equals(other.LHS) && this.RHS.length == other.RHS.length) {
            for(var i = 0; i < this.RHS.length; i++) {
                if(this.RHS[i] != other.RHS[i]) {
                    return false;
                }
            }
            return true;
        } else {
            return false;
        }
    }
}

module.exports.Production = Production;