var { Item, ItemSet } = require("./item");

var getItemSets = function(productions) {
    var is0 = new ItemSet([productions[0].startItem]);
    var built = is0.buildAll();
    return built;
}

var OperationType = {
    REDUCE: 0,
    SHIFT: 1,
    GOTO : 2,
    ACCEPT : 3
}

var ReduceOperation = function(production) {
    this.opType = OperationType.REDUCE;
    this.production = production;
    this.toString = function() {
        return "r" + this.production.ruleNumber;
    }
}

var ShiftOperation = function(state) {
    this.opType = OperationType.SHIFT;
    this.state = state;
    this.toString = function() {
        return "s" + this.state;
    }
}

var GotoOperation = function(state) {
    this.opType = OperationType.SHIFT;
    this.state = state;
    this.toString = function() {
        return "" + this.state;
    }
}

var AcceptOperation = function() {
    this.opType = OperationType.ACCEPT;
    this.toString = function() {
        return "ACC";
    }
}

var ParseTable = function(itemSet, productions, terminals, nonTerminals) {
    this.itemSet = itemSet;
    this.terminals = terminals;
    this.nonTerminals = nonTerminals;
    this.productions = productions;

    this.getTerminalIndex = function(symbol) {
        if(!symbol.isTerminal()) {
            throw "Internal Error : symbol is not terminal";
        }
        for(var i = 0; i < this.terminals.length; i++) {
            if(this.terminals[i].equals(symbol)) {
                return i;
            }
        }
        throw "Internal Error : terminal symbol not found";
    }

    this.getNonTerminalIndex = function(symbol) {
        if(!symbol.isNonTerminal()) {
            throw "Internal Error : symbol is not nonTerminal";
        }
        for(var i = 0; i < this.nonTerminals.length; i++) {
            if(this.nonTerminals[i].equals(symbol)) {
                return i;
            }
        }
        throw "Internal Error : nonTerminal symbol not found";
    }

    this.EOFIndex = null;
    this.getEOFIndex = function() {
        if(this.EOFIndex != null) {
            return this.EOFIndex;
        }
        for(var i = 0; i < this.terminals.length; i++) {
            if(this.terminals[i].isEOF()) {
                this.EOFIndex = i;
                return i;
            }
        }
        throw "Internal Error : EOF symbol not found";
    }

    this.actionTable = [];
    this.gotoTable = [];

    this.setReduceAction = function(state, symbolIndex, production) {
        var entry = this.actionTable[state][symbolIndex];
        if(entry != null) {
            switch(entry.opType) {
                case OperationType.REDUCE : 
                    if(entry.production.id != production.id) {
                        throw "REDUCE/REDUCE conflict";
                    } else {
                        return;
                    }
                    break;
                case OperationType.SHIFT :
                    throw "SHIFT/REDUCE confilct ???"
                    break;
                case OperationType.GOTO :
                    throw "Internal Error : SHIFT/GOTO conflict"
                    break;
                case OperationType.ACCEPT :
                    throw "Internal Error : SHIFT/ACCEPT conflict"
                    break;
                default :
                    throw "Internal Error : Invalid opType";
            }
        } else {
            this.actionTable[state][symbolIndex] = new ReduceOperation(production);
        }
    }

    this.setShiftAction = function(state, symbol, nextState) {
        var index = this.getTerminalIndex(symbol);
        var entry = this.actionTable[state][index];
        if(entry != null) {
            switch(entry.opType) {
                case OperationType.REDUCE : 
                    throw "SHIFT/REDUCE conflict";
                    break;
                case OperationType.SHIFT :
                    if(entry.state != nextState) {
                        throw "Internal Error : SHIFT/SHIFT confilct ???"
                    } else {
                        return;
                    }
                    break;
                case OperationType.GOTO :
                    throw "Internal Error : SHIFT/GOTO conflict"
                    break;
                case OperationType.ACCEPT :
                    throw "Internal Error : SHIFT/ACCEPT conflict"
                    break;
                default :
                    throw "Internal Error : Invalid opType";
            }
        } else {
            this.actionTable[state][index] = new ShiftOperation(nextState);
        }
    }

    this.setGotoAction = function(state, symbol, nextState) {
        var index = this.getNonTerminalIndex(symbol);
        var entry = this.gotoTable[state][index];
        if(entry != null) {
            switch(entry.opType) {
                case OperationType.REDUCE : 
                    throw "Internal Error : REDUCE/GOTO conflict";
                    break;
                case OperationType.SHIFT :
                    throw "Internal Error : SHIFT/GOTO conflict";
                    break;
                case OperationType.GOTO :
                    if(entry.state != nextState) {
                        throw "Internal Error : GOTO/GOTO conflict"    
                    } else {
                        return;
                    }
                    break;
                case OperationType.ACCEPT :
                    throw "Internal Error : GOTO/ACCEPT conflict"
                    break;
                default :
                    throw "Internal Error : Invalid opType";
            }
        } else {
            this.gotoTable[state][index] = new GotoOperation(nextState);
        }
    }

    this.setAcceptAction = function(state) {
        var index = this.getEOFIndex();
        var entry = this.gotoTable[state][index];
        if(entry != null) {
            switch(entry.opType) {
                case OperationType.REDUCE : 
                    throw "Internal Error : REDUCE/ACCEPT conflict";
                    break;
                case OperationType.SHIFT :
                    throw "Internal Error : SHIFT/ACCEPT conflict";
                    break;
                case OperationType.GOTO :
                    throw "Internal Error : GOTO/ACCEPT conflict"    
                    break;
                case OperationType.ACCEPT :
                    return;
                default :
                    throw "Internal Error : Invalid opType";
            }
        } else {
            this.actionTable[state][index] = new AcceptOperation();
        }
    }
    
    this.firstSets = (new Array(this.nonTerminals.length)).fill(null);
    this.getFirstSet = function(ntIndex) {
        if(this.firstSets[ntIndex] == -1) {
            return null;
        } else if(this.firstSets[ntIndex] != null) {
            return this.firstSets[ntIndex];
        } else {
            this.firstSets[ntIndex] = -1;
            var usable = true;
            var firstSet = new Set();
            var symbol = this.nonTerminals[ntIndex];
            for(var i = 0; i < symbol.productions.length; i++) {
                var firstRhs = symbol.productions[i].RHS[0];
                if(firstRhs.isTerminal()) {
                    firstSet.add(this.getTerminalIndex(firstRhs));
                } else if(firstRhs.isNonTerminal() && !firstRhs.equals(symbol)) {
                    var set = this.getFirstSet(this.getNonTerminalIndex(firstRhs));
                    if(set == null) {
                        usable = false;
                    } else {
                        set.forEach(e => firstSet.add(e));
                    }
                }
            }
            if(usable) {
                this.firstSets[ntIndex] = firstSet;
            } else {
                this.firstSets[ntIndex] = null;
            }
            return firstSet;
        }
    }

    this.followSets = (new Array(this.nonTerminals.length)).fill(null);
    this.getFollowSet = function(ntIndex) {
        if(this.followSets[ntIndex] == -1) {
            return null;
        } else if(this.followSets[ntIndex] != null) {
            return this.followSets[ntIndex];
        } else {
            this.followSets[ntIndex] = -1;
            var usable = true;
            var followSet = new Set();
            for(var p = 0; p < productions.length; p++) {
                var lhs = this.productions[p].LHS;
                if(this.nonTerminals[ntIndex].equals(lhs) && this.productions[p].isStart) {
                    followSet.add(this.getEOFIndex());
                }
                var rhs = this.productions[p].RHS;
                for(var s = 0; s < rhs.length; s++) {
                    if(this.nonTerminals[ntIndex].equals(rhs[s])) {
                        if(s != rhs.length - 1) { // symbol is not last
                            if(rhs[s+1].isTerminal()) {
                                var nextSymbolIndex = this.getTerminalIndex(rhs[s+1]);
                                followSet.add(nextSymbolIndex);
                            } else { // Non-terminal
                                var nextSymbolIndex = this.getNonTerminalIndex(rhs[s+1]);
                                var nextFirstSet = this.getFirstSet(nextSymbolIndex);
                                nextFirstSet.forEach(e => followSet.add(e));
                            }
                        } else { // symbol is last
                            var lhsIndex = this.getNonTerminalIndex(lhs);
                            if(lhsIndex != ntIndex) { // If production ends with lhs, followset is unchanged
                                var lhsFollowSet = this.getFollowSet(lhsIndex);
                                if(lhsFollowSet == null) {
                                    usable = false;
                                } else {
                                    lhsFollowSet.forEach(e => followSet.add(e));
                                }
                            }
                        }
                    }
                }
            }
            if(usable) {
                this.followSets[ntIndex] = followSet;
            } else {
                this.followSets[ntIndex] = null;
            }
            return followSet;
        }
    }

    for(var i = 0; i < this.itemSet.length; i++) {
        this.actionTable.push((new Array(this.terminals.length)).fill(null));
        this.gotoTable.push((new Array(this.nonTerminals.length)).fill(null));
    }

    for(var s = 0; s < itemSet.length; s++) {
        var items = itemSet[s].kernel.concat(itemSet[s].closure);
        for(var i = 0; i < items.length; i++) {
            var item = items[i];
            var nextSymbol = item.nextSymbol();
            if(nextSymbol != null) {
                if(nextSymbol.isNonTerminal()) {
                    var index = this.getNonTerminalIndex(nextSymbol);
                    this.gotoTable[s][index] = new GotoOperation(item.gotoItemSet.itemSetNumber);
                } else if(nextSymbol.isTerminal()) {
                    this.setShiftAction(s, nextSymbol, item.gotoItemSet.itemSetNumber);
                    
                } else {
                    throw "Internal Error : Invalid symbol";
                }
            } else { // dot at end of item
                if(item.production.isStart) { // production is start productino
                    this.setAcceptAction(s);
                } else {
                    var lhsIndex = this.getNonTerminalIndex(item.production.LHS);
                    var followSet = this.getFollowSet(lhsIndex);
                    followSet.forEach(e => this.setReduceAction(s, e, item.production));
                }
            }
        }
    }
    // console.log(this.terminals.map((e,i) => i + ":" + e.name).join(', '));
    // console.log("FIRSTS:");
    // nonTerminals.forEach(e => console.log(this.getFirstSet(this.getNonTerminalIndex(e))));
    // console.log("FOLLOWS:");
    // nonTerminals.forEach(e => console.log(this.getFollowSet(this.getNonTerminalIndex(e))));

    this.toString = function() {
        var allSymbols = this.terminals.concat(this.nonTerminals);
        var widths = allSymbols.map(e => e.name.length + 4);
        var string = "    ";
        for(var i = 0; i < allSymbols.length; i++) {
            if(i != 0) {
                string += "  ";
            }
            if(i == this.terminals.length) {
                string += "|=|  ";
            } else {
                string += "|  ";
            }
            string += allSymbols[i].name;
        }
        string += "\n";
        string += (new Array(string.length)).fill("-").join('') + "\n";
        for(var s = 0; s < this.itemSet.length; s++) {
            var row = s + "";
            while(row.length < 4) row += " ";
            for(var i = 0; i < allSymbols.length; i++) {
                if(i == this.terminals.length) {
                    row += "|=|"
                } else {
                    row += "|"
                }
                var entry = (i < this.terminals.length)? 
                        this.actionTable[s][i] : 
                        this.gotoTable[s][i - this.terminals.length];
                var width = widths[i];
                var entryString = (entry == null)? "" : entry.toString();
                width -= entryString.length;
                var left = (new Array(Math.floor(width / 2))).fill(" ").join('');
                var right = (new Array(Math.ceil(width / 2))).fill(" ").join('');
                entryString = left + entryString + right;
                row += entryString;
            }
            string += row + "\n";
        }

        return string;
    }
}

var buildParseTable = function(productions, terminals, nonTerminals) {
    var itemSets = getItemSets(productions);
    var parseTable = new ParseTable(itemSets, productions, terminals, nonTerminals);
    return parseTable;
}

module.exports = buildParseTable;