
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
    this.equals = function(other) {
        return this.pos == other.pos && this.production.equals(other.production);
    }
    this.uniqueID = function() {
        return this.production.ruleNumber + 1 / (pos + 1);
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
var ItemSet = function(kernelItems) {
    this.kernel = kernelItems;
    this.closure = [];
    this.itemSetNumber = nextItemSetNumber++;
    /*
        Uses list of items 'this.kernel' to create next item set
        associated with all items with 'symbol' as the next symbol
    */
    this.readOn = function(symbol, allSets) {
        // console.log("\tRead on " + symbol.name);
        var matches = []
        var allItems = this.kernel.concat(this.closure);
        for(var i = 0; i < allItems.length; i++) {
            var item = allItems[i];
            var nextSymbol = item.nextSymbol()
            if(symbol.equals(nextSymbol)) {
                matches.push(item);
            }
        }
        if(matches.length == 0) {
            throw "Internal Error : ItemSet.readOn called with non-member symbol";
        }
        var nextKernel = matches.map(e => e.nextItem());
        var foundSet = null;
        var found = false;
        for(var i = 0; i < allSets.length; i++) {
            if(allSets[i].kernelEquals(nextKernel)) {
                foundSet = allSets[i];
                found = true;
                break;
            }
        }
        if(found) { // Set allready exists
            matches.forEach(e => e.gotoItemSet = foundSet);
            // console.log("\t\tmatched IS" + foundSet.itemSetNumber);
            return null;
        } else { // Set must be created
            var nextItemSet = new ItemSet(nextKernel);
            // console.log("\t\tcreated IS" + nextItemSet.itemSetNumber);
            matches.forEach(e => e.gotoItemSet = nextItemSet);
            return nextItemSet;
        }
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
        var allItems = this.kernel.map(e => e);
        for(var i = 0; i < allItems.length; i++) {
            var item = allItems[i];
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
                        var closureItem = new Item(productions[p]);
                        this.closure.push(closureItem);
                        allItems.push(closureItem);
                    }
                    this.expandedOn.push(nextSymbol);
                }
            }
        }
        this.completed = true;
    }

    this.build = function(allSets) {
        // console.log("Building IS" + this.itemSetNumber);
        var nextSets = [];
        var allItems = this.kernel.concat(this.closure);
        var nextSymbols = allItems.map(e => e.nextSymbol()); // !!!
        nextSymbols = nextSymbols.filter((e,i,arr) => { // remove duplicates
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
            var nextSet = this.readOn(nextSymbols[i], allSets);
            if(nextSet != null) {
                nextSet.complete();
                nextSets.push(nextSet);
                allSets.push(nextSet); // Adds to allSets in every call
            }
        }
        // for(var i = 0; i < nextSets.length; i++) {
        //     nextSets[i].build(allSets);
        // }
        return nextSets;
    }

    this.buildAll = function() {
        this.complete();
        var allSets = [this];
        var unbuiltSets = [this];
        while(unbuiltSets.length > 0) {
            var next = unbuiltSets.shift().build(allSets);
            unbuiltSets = unbuiltSets.concat(next);
        }
        return allSets;
    }

    this.kernelEquals = function(otherKernel) {
        // var c = 0;
        // while (c < 100000) c++;
        if(this.kernel.length == otherKernel.length) {
            var superset = {};
            for(var i = 0; i < this.kernel.length; i++) {
                var id = this.kernel[i].uniqueID();
                superset[id] = 1;
            }
            for(var i = 0; i < otherKernel.length; i++) {
                var id = otherKernel[i].uniqueID()
                if(!superset[id]) {
                    return false;
                }
                superset[id] = 2;
            }
            for(var i = 0; i < superset.length; i++) {
                if(superset[i] == 1) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    this.toString = function() {
        var string = "IS" + this.itemSetNumber;
        for(var i = 0; i < this.kernel.length; i++) {
            string += "\t" + this.kernel[i].toString();
            if(this.kernel[i].gotoItemSet != null) {
                var gotoSetNum = this.kernel[i].gotoItemSet.itemSetNumber;
                string += " -> IS" + gotoSetNum;
            }
            string += "\n"
        }
        for(var i = 0; i < this.closure.length; i++) {
            string += "\t+" + this.closure[i].toString();
            if(this.closure[i].gotoItemSet != null) {
                var gotoSetNum = this.closure[i].gotoItemSet.itemSetNumber;
                string += " -> IS" + gotoSetNum;
            }
            string += "\n"
        }
        return string;
    }
}

module.exports.Item = Item;
module.exports.ItemSet = ItemSet;