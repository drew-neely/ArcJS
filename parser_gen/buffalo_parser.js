var {SyntaxError, TokenTypes, lex} = require("./buffalo_lexer");
var {Terminal, subAliases, extract, objectify} = require("./terminal.js");
var {NonTerminal} = require("./nonterminal.js");
var {Production} = require("./production.js");


var header;
var aliases = [];
var terminals = [];
var nonTerminals = [];
var productions = [];

var lookupSymbol = function(name) {
    for(var i = 0; i < terminals.length; i++) {
        if(terminals[i].name == name) {
            return terminals[i];
        }
    }
    for(var i = 0; i < nonTerminals.length; i++) {
        if(nonTerminals[i].name == name) {
            return nonTerminals[i];
        }
    }
    return null;
}

var addDefinition = function(name, code) {
    code = subAliases(code, aliases);
    var terminal = new Terminal(name, objectify(code));
    terminals.push(terminal);
}

var registeredProductions = [];

var registerProduction = function(lhsName, symbolActionPairs) {
    var lhs = new NonTerminal(lhsName);
    nonTerminals.push(lhs);
    for(var i = 0; i < symbolActionPairs.length; i++) {
        symbolActionPairs[i].lhs = lhs;
        registeredProductions.push(symbolActionPairs[i]);
    }
}

var createProductions = function() {
    for(var i = 0; i < registeredProductions.length; i++) {
        var lhs = registeredProductions[i].lhs;
        var rhs = registeredProductions[i].symbols.map(lookupSymbol);
        var action = registeredProductions[i].action;
        var isStart = (i == 0);
        var production = new Production(lhs, rhs, action, isStart);
        lhs.addProduction(production);
        productions.push(production);
    }
}

var getAll = function() {
    return {
        header: header,
        terminals: terminals,
        nonTerminals: nonTerminals,
        productions: productions
    }
}
var __terminals = [{type:TokenTypes.HEADER},{type:TokenTypes.BREAK},{type:TokenTypes.DEFINE},{type:TokenTypes.ALIAS},{type:TokenTypes.VALUE},{type:TokenTypes.ID},{type:TokenTypes.COLON},{type:TokenTypes.OR},{type:TokenTypes.SEMICOLON},{type:TokenTypes.ACTION},{type:TokenTypes.EOF},{type:"EOF"}];

var __reduce0 = function() {
	return getAll();
};

var __reduce1 = function() {
	header = arguments[0].code;
};

var __reduce2 = function() {
	return arguments[0];
};

var __reduce3 = function() {
	terminals.push(new Terminal("EOF", {type : "\"EOF\""}, true));
};

var __reduce4 = function() {
	addDefinition(arguments[1].value, arguments[2].value);
};

var __reduce5 = function() {
	aliases.push([arguments[1].value, arguments[2].value]);
};

var __reduce6 = function() {
	return arguments[0];
};

var __reduce7 = function() {
	createProductions();
};

var __reduce8 = function() {
	registerProduction(arguments[0].id, arguments[2]);
};

var __reduce9 = function() {
	arguments[2].unshift(arguments[0]); return arguments[2];
};

var __reduce10 = function() {
	return [arguments[0]];
};

var __reduce11 = function() {
	return {symbols: arguments[0], action: arguments[1].action };
};

var __reduce12 = function() {
	return {symbols: arguments[0], action: null      };
};

var __reduce13 = function() {
	arguments[1].unshift(arguments[0].id); return arguments[1];
};

var __reduce14 = function() {
	return [arguments[0].id];
};


var __reduceFunctions = [__reduce0, __reduce1, __reduce2, __reduce3, __reduce4, __reduce5, __reduce6, __reduce7, __reduce8, __reduce9, __reduce10, __reduce11, __reduce12, __reduce13, __reduce14];

var __reduceFunctionArgcs = [6,1,2,1,3,3,2,1,4,3,1,2,1,2,1];

var __productionLHS = [0,1,2,2,3,3,4,4,5,6,6,7,7,8,8];

var __OperationType = {"REDUCE":0,"SHIFT":1,"ACCEPT":2};

var __slrActionTable = [[{"type":1,"state":2},null,null,null,null,null,null,null,null,null,null,null],[null,{"type":1,"state":3},null,null,null,null,null,null,null,null,null,null],[null,{"type":0,"production":1},null,null,null,null,null,null,null,null,null,null],[null,null,{"type":1,"state":6},{"type":1,"state":7},null,null,null,null,null,null,null,null],[null,{"type":1,"state":8},null,null,null,null,null,null,null,null,null,null],[null,{"type":0,"production":3},{"type":1,"state":6},{"type":1,"state":7},null,null,null,null,null,null,null,null],[null,null,null,null,{"type":1,"state":10},null,null,null,null,null,null,null],[null,null,null,null,{"type":1,"state":11},null,null,null,null,null,null,null],[null,null,null,null,null,{"type":1,"state":14},null,null,null,null,null,null],[null,{"type":0,"production":2},null,null,null,null,null,null,null,null,null,null],[null,null,null,null,{"type":1,"state":15},null,null,null,null,null,null,null],[null,null,null,null,{"type":1,"state":16},null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,{"type":1,"state":17},null],[null,null,null,null,null,{"type":1,"state":14},null,null,null,null,{"type":0,"production":7},null],[null,null,null,null,null,null,{"type":1,"state":19},null,null,null,null,null],[null,{"type":0,"production":4},{"type":0,"production":4},{"type":0,"production":4},null,null,null,null,null,null,null,null],[null,{"type":0,"production":5},{"type":0,"production":5},{"type":0,"production":5},null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,{"type":2,"production":0}],[null,null,null,null,null,null,null,null,null,null,{"type":0,"production":6},null],[null,null,null,null,null,{"type":1,"state":23},null,null,null,null,null,null],[null,null,null,null,null,null,null,null,{"type":1,"state":24},null,null,null],[null,null,null,null,null,null,null,{"type":1,"state":25},{"type":0,"production":10},null,null,null],[null,null,null,null,null,null,null,{"type":0,"production":12},{"type":0,"production":12},{"type":1,"state":26},null,null],[null,null,null,null,null,{"type":1,"state":23},null,{"type":0,"production":14},{"type":0,"production":14},{"type":0,"production":14},null,null],[null,null,null,null,null,{"type":0,"production":8},null,null,null,null,{"type":0,"production":8},null],[null,null,null,null,null,{"type":1,"state":23},null,null,null,null,null,null],[null,null,null,null,null,null,null,{"type":0,"production":11},{"type":0,"production":11},null,null,null],[null,null,null,null,null,null,null,{"type":0,"production":13},{"type":0,"production":13},{"type":0,"production":13},null,null],[null,null,null,null,null,null,null,null,{"type":0,"production":9},null,null,null]];

var __slrGotoTable = [[null,1,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,4,5,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,9,5,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,12,13,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,18,13,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,20,21,22],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,27],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,28,21,22],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null]];


var __getInputTerminal = function(inputToken) {
    for(var t = 0; t < __terminals.length; t++) {
        var isMatch = true;
        for(var key in __terminals[t]) {
            if(!(key in inputToken && inputToken[key] == __terminals[t][key])) {
                isMatch = false;
                break;
            }
        }
        if(isMatch) return t;
    }
    return -1;
}

var parse = function(inputTokens) {
    inputTokens.push({type:"EOF"});
    var stack = [];
    var state = [0];
    while(inputTokens.length > 0) {
        var lookahead = inputTokens[0];
        var lookaheadIndex = __getInputTerminal(lookahead);
        if(lookaheadIndex < 0) {
            throw "Undefined Token : " + JSON.stringify(lookahead);
        }
        var action = __slrActionTable[state[state.length - 1]][lookaheadIndex];
        if(action == null) {
            throw "Unexpected symbol : " + JSON.stringify(lookahead);
        } else if(action.type == __OperationType.SHIFT) {
            stack.push(inputTokens.shift());
            state.push(action.state);
        } else if(action.type == __OperationType.REDUCE || action.type == __OperationType.ACCEPT) {
            var argc = __reduceFunctionArgcs[action.production];
            var args = [];
            for(var i = 0; i < argc; i++) {
                args.unshift(stack.pop());
                state.pop();
            }
            var result = __reduceFunctions[action.production].apply(null, args);
            stack.push(result);
            state.push(__slrGotoTable[state[state.length - 1]][__productionLHS[action.production]]);
            if(action.type == __OperationType.ACCEPT) {
                return stack.pop();
            }
        }
    }
    throw "Reached end of file while parsing";
}

module.exports.parse = parse;

