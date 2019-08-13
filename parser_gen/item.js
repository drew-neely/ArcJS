var NonTerminal = require("./NonTerminal").NonTerminal;

var Item = function(production, pos) {
    this.production = production;
    this.pos = pos == undefined ? 0 : pos; // index of the element to the right of dot
    this.gotoItemSet = null;
    this.nextSymbol = function() {
        if(this.pos < this.production.RHS.length) {
            return this.production.RHS[this.pos];
        } else {
            return null;
        }
    }
    this.nextItem = function() {
        if(this.pos == this.production.RHS.length) {
            return null;
        } else {
            return new Item(this.production, this.pos + 1);
        }
    }
    this.toString = function() {
        var string = '[';
        string += this.production.LHS.name;
        string += ' ->';
        for(var i = 0; i < this.production.RHS.length; i++) {
            if(this.pos == i) {
                string += ' .'
            }
            string += " " + this.production.RHS[i].name;
        }
        if(this.pos == this.production.RHS.length) {
            string += ' .'
        }
        string += ']';
        return string;
    }
} 

var nextItemSetNumber = 0;
var ItemSet = function(items) {
    this.items = items;
    this.itemSetNumber = nextItemSetNumber++;
    /*
        Uses list of items 'this.items' to create next item set
        associated with all items with 'symbol' as the next symbol
    */
    this.readOn = function(symbol) {
        // console.log("\tRead on " + symbol.name);
        var matches = []
        for(var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            var nextSymbol = item.nextSymbol()
            if(symbol.equals(nextSymbol)) {
                matches.push(item);
            }
        }
        var nextItems = matches.map(e => e.nextItem());
        var nextItemSet = new ItemSet(nextItems);
        // console.log("\t\tcreated IS" + nextItemSet.itemSetNumber);
        matches.forEach(e => e.gotoItemSet = nextItemSet);
        return nextItemSet;
    }
    this.expandedOn = [];
    this.completed = false;
    /*
        Don't call complete on Start Item Set :
            Results in duplicate items
    */
    this.complete = function() {
        if(this.completed) {
            throw "ItemSet.complete() should only be called once";
            return;
        }
        for(var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            var nextSymbol = item.nextSymbol();
            if(nextSymbol != null) {
                var alreadyExpanded = false;
                for(var s = 0; s < this.expandedOn.length; s++) {
                    if(nextSymbol.equals(this.expandedOn[s])) {
                        alreadyExpanded = true;
                        break;
                    }
                }
                if(!alreadyExpanded && nextSymbol.isNonTerminal()) { // Expand on nextSymbol
                    var productions = nextSymbol.productions
                    for(var p = 0; p < productions.length; p++) {
                        this.items.push(productions[p].startItem)
                    }
                    this.expandedOn.push(nextSymbol);
                }
            }
        }
        this.completed = true;
    }
    this.build = function() {
        // console.log("Building IS" + this.itemSetNumber);
        var nextSets = [];
        var nextSymbols = this.items.filter(e => e.gotoItemSet == null).map(e => e.nextSymbol());
        nextSymbols = nextSymbols.filter((e,i,arr) => {
            if(e == null) {
                return false;
            }
            for(var q = 0; q < i; q++) {
                if(arr[q] != null && arr[q].equals(e)) {
                    return false;
                }
            }
            return true;
        });
        for(var i = 0; i < nextSymbols.length; i++) {
            var nextSet = this.readOn(nextSymbols[i]);
            nextSet.complete();
            nextSets.push(nextSet);
        }
        var nextNextSets = []
        for(var i = 0; i < nextSets.length; i++) {
            nextNextSets = nextNextSets.concat(nextSets[i].build());
        }
        nextSets = nextSets.concat(nextNextSets);
        return nextSets;
    }
    this.toString = function() {
        var string = "IS" + this.itemSetNumber;
        for(var i = 0; i < this.items.length; i++) {
            string += "\t" + this.items[i].toString();
            if(this.items[i].gotoItemSet != null) {
                var gotoSetNum = this.items[i].gotoItemSet.itemSetNumber;
                string += " -> IS" + gotoSetNum;
            }
            string += "\n"
        }
        return string;
    }
}

module.exports.Item = Item;
module.exports.ItemSet = ItemSet;