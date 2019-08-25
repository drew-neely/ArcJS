var terminals = [{"type":"plus"},{"type":"times"},{"type":"open_paren"},{"type":"close_paren"},{"type":"id"},{"type":"EOF"}];
var reduce0 = function() {
	return arguments[0];
};

var reduce1 = function() {
	return arguments[0] + arguments[2];
};

var reduce2 = function() {
	return arguments[0];
};

var reduce3 = function() {
	return arguments[0] * arguments[2];
};

var reduce4 = function() {
	return arguments[0];
};

var reduce5 = function() {
	return arguments[1];
};

var reduce6 = function() {
	return arguments[0].value;
};

var reduceFunctions = [reduce0, reduce1, reduce2, reduce3, reduce4, reduce5, reduce6];
var reduceFunctionArgcs = [1,3,1,3,1,3,1];
var productionLHS = [0,1,1,2,2,3,3];
var OperationType = {"REDUCE":0,"SHIFT":1,"ACCEPT":2};
var slrActionTable = [[null,null,{"type":1,"state":4},null,{"type":1,"state":5},null],[{"type":1,"state":6},null,null,null,null,{"type":2,"production":0}],[{"type":0,"production":2},{"type":1,"state":7},null,{"type":0,"production":2},null,{"type":0,"production":2}],[{"type":0,"production":4},{"type":0,"production":4},null,{"type":0,"production":4},null,{"type":0,"production":4}],[null,null,{"type":1,"state":4},null,{"type":1,"state":5},null],[{"type":0,"production":6},{"type":0,"production":6},null,{"type":0,"production":6},null,{"type":0,"production":6}],[null,null,{"type":1,"state":4},null,{"type":1,"state":5},null],[null,null,{"type":1,"state":4},null,{"type":1,"state":5},null],[{"type":1,"state":6},null,null,{"type":1,"state":11},null,null],[{"type":0,"production":1},{"type":1,"state":7},null,{"type":0,"production":1},null,{"type":0,"production":1}],[{"type":0,"production":3},{"type":0,"production":3},null,{"type":0,"production":3},null,{"type":0,"production":3}],[{"type":0,"production":5},{"type":0,"production":5},null,{"type":0,"production":5},null,{"type":0,"production":5}]];
var slrGotoTable = [[null,1,2,3],[null,null,null,null],[null,null,null,null],[null,null,null,null],[null,8,2,3],[null,null,null,null],[null,null,9,3],[null,null,null,10],[null,null,null,null],[null,null,null,null],[null,null,null,null],[null,null,null,null]];

var getInputTerminal = function(inputToken) {
    for(var t = 0; t < terminals.length; t++) {
        var isMatch = true;
        for(var key in terminals[t]) {
            if(!(key in inputToken && inputToken[key] == terminals[t][key])) {
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
        var lookaheadIndex = getInputTerminal(lookahead);
        if(lookaheadIndex < 0) {
            throw "Undefined Token : " + JSON.stringify(lookahead);
        }
        var action = slrActionTable[state[state.length - 1]][lookaheadIndex];
        if(action == null) {
            throw "Unexpected symbol : " + JSON.stringify(lookahead);
        } else if(action.type == OperationType.SHIFT) {
            stack.push(inputTokens.shift());
            state.push(action.state);
        } else if(action.type == OperationType.REDUCE || action.type == OperationType.ACCEPT) {
            var argc = reduceFunctionArgcs[action.production];
            var args = [];
            for(var i = 0; i < argc; i++) {
                args.unshift(stack.pop());
                state.pop();
            }
            var result = reduceFunctions[action.production].apply(null, args);
            stack.push(result);
            state.push(slrGotoTable[state[state.length - 1]][productionLHS[action.production]]);
            if(action.type == OperationType.ACCEPT) {
                return stack.pop();
            }
        }
    }
}

module.exports.parse = parse;
