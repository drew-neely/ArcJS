var terminals = [...];

var reduce1 = function() {
    //...
}

var reduce2 = function() {
    //...
}

var reduceFunctions     = [reduce1, reduce2];
var reduceFunctionArgcs = [3      , 1];

/*
    for production i = LHS -> a b ...    
    productionLHS[i] = the column in slrGotoTable
        that corresponds to LHS
*/
var productionLHS = [...];


var OperationType = {
    REDUCE: 0,
    SHIFT: 1,
    ACCEPT : 3
}
/* slrActionTableEntries
    Shift Action Entry :
    {
        type : OperationType.SHIFT
        state : ###
    }
    Reduce Action Entry :
    {
        type : OperationType.REDUCE
        production : ###
    }
    Accept Action Entry :
    {
        type : OperationType.ACCEPT
        production : ###
    }
*/
var slrActionTable = [...];
//slrGotoTable entries are state numbers
var slrGotoTable = [...];

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
    var stack = [];
    var state = [0];
    while(inputTokens.length > 0) {
        var lookahead = inputTokens[0];
        var lookaheadIndex = getInputTerminal(lookahead);
        if(terminalIndex < 0) {
            throw "Undefined Token : " + JSON.stringify(lookahead);
        }
        var action = slrActionTable[state[state.length - 1]][lookaheadIndex];
        if(action == null) {
            throw "Unexpected symbol : " + JSON.stringify(lookahead);
        } else if(action.type == OperationType.SHIFT) {
            stack.push(inputTokens.shift());
            state.push(action.state);
        } else if(action.type == OperationType.REDUCE || action.type == OperationType.ACCEPT) {
            var argc = reduceFunctionsArgc[action.production];
            var args = [];
            for(var i = 0; i < argc; i++) {
                args.unshift(stack.pop());
                state.pop();
            }
            var result = reduceFunctions[action.production].apply(null, args);
            stack.push(result);
            state.push(slrGotoTable[state[state.length - 1]][productionLHS[action.production]]);
            if(action.type == OperationType.ACCEPT) {
                return stack.pop()
            }
        }
    }
}