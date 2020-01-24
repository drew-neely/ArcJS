
var slrTableOperationType = require("./slrTable.js").OperationType;

var getInputTerminalFunctionString = `
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
`;

var parseFunctionString = `
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
            if(lookahead["type"] == "EOF") {
                throw "Reached end of input stream while parsing";
            } else {
                throw "Unexpected symbol : " + JSON.stringify(lookahead);
            }
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
    throw "Reached end of input stream while parsing";
}
`;

var exportString = `
module.exports.parse = parse;
`;

var createParserBody = function() {
    return getInputTerminalFunctionString + parseFunctionString + exportString;
}

var createAssignment = function(name, valueString) {
    var str = "var " + name + " = " + valueString + ";\n";
    return str;
}

var createFunctionAssignment = function(name, body) {
    var str = "function() {\n";
    body = body.split('$').map((e,i) => { // !!! // bad and slow - will detect a $# in a string
        var s = e.match(/^\d+/g);
        if(s == null && i != 0) {
            return '$' + e;
        } else if(s != null) {
            s = s[0];
            var len = s.length;
            s = 'arguments['+(Number(s) - 1)+']';
            return s + e.substring(len);
        } else {
            return e;
        }
    }).join('');
    body = '\t' + body;
    body = body.split('\n').join('\n\t');
    str += body;
    str += (str[str.length - 1] == '\n')? '' : '\n';
    str += '}';
    return createAssignment(name, str) + '\n';
}

var createFunctionArrayAssignment = function(name, functionNames) {
    var str = "[";
    for(var i = 0; i < functionNames.length; i++) {
        str += functionNames[i];
        if(i != functionNames.length - 1) {
            str += ", ";
        }
    }
    str += "]";
    return createAssignment(name,str);
}

// Works only for arrays of any dimension that contain only strings and numbers
var createObjectAssignment = function(name, obj) {
    var str = JSON.stringify(obj);
    return createAssignment(name, str);
}

// creates an assignment for an array of objects with the values of treated as js expressions
var createCodeObjectAssignment = function(name, array) {
    var str = "[";
    for(var a = 0; a < array.length; a++) {
        var obj = array[a];
        str += '{';
        var keys = Object.keys(obj);
        for(var b = 0; b < keys.length; b++) {
            str += keys[b] + ":" + obj[keys[b]] + ((b < keys.length - 1)? "," : "");
        }
        str += '}' + ((a < array.length - 1)? "," : "");
    }
    str += "]";
    return createAssignment(name, str);
}

// Enum object that stores operation type values and also will be included in
// generated code
var ParserOperationType = {
    REDUCE: 0,
    SHIFT: 1,
    ACCEPT : 2
}

var getOperationObject = function(operation, slrTable) {
    switch(operation.opType) {
        case slrTableOperationType.SHIFT :
            return {
                type : ParserOperationType.SHIFT, 
                state : operation.state
            }
        case slrTableOperationType.REDUCE :
            return {
                type : ParserOperationType.REDUCE,
                production : slrTable.getProductionIndex(operation.production)
            }
        case slrTableOperationType.ACCEPT :
            return {
                type : ParserOperationType.ACCEPT,
                production : slrTable.getProductionIndex(operation.production)
            }
        case slrTableOperationType.GOTO :
            return operation.state;
        default :
            throw "Internal Error: Could not identify operation";
    }
}

var generateParser = function(slrTable, headerString) {
    // create terminals property list 
    //     terminalProperties
    var terminalProperties = slrTable.terminals.map(e => e.properties);
    terminalProperties = createCodeObjectAssignment("__terminals", terminalProperties);
    // console.log(terminalProperties);

    // create reduce function strings, list of the names of the reduce functions,
    // list of the number of arguments the reduce functions take, and a list of
    // the indexes of the LHS of each production in the slrTable
    //     reduceFunctions,
    //     reduceFunctionNames,
    //     reduceFunctionArgcs,
    //     productionLHSIndexes
    var reduceFunctions = [];
    var reduceFunctionNames = [];
    var reduceFunctionArgcs = [];
    var productionLHSIndexes = [];
    for(var i = 0; i < slrTable.productions.length; i++) {
        var production = slrTable.productions[i];
        var action = production.action;
        if(action == null) {
            action = "return $1;";
        }
        var name = "__reduce" + i;
        reduceFunctionNames.push(name);
        reduceFunctions.push(createFunctionAssignment(name, action));
        reduceFunctionArgcs.push(production.RHS.length);
        productionLHSIndexes.push(slrTable.getNonTerminalIndex(production.LHS));
    }
    reduceFunctions = reduceFunctions.join('');
    reduceFunctionNames = createFunctionArrayAssignment("__reduceFunctions", reduceFunctionNames);
    reduceFunctionArgcs = createObjectAssignment("__reduceFunctionArgcs", reduceFunctionArgcs);
    productionLHSIndexes = createObjectAssignment("__productionLHS", productionLHSIndexes);
    // console.log(reduceFunctions);
    // console.log(reduceFunctionNames);
    // console.log(reduceFunctionArgcs);
    // console.log(productionLHSIndexes)

    // create operation type definition
    //     operationTypeObject
    var operationTypeObject = createObjectAssignment("__OperationType", ParserOperationType);
    // console.log(operationTypeObject);

    // create slrActionTable
    //     slrActionTable
    var slrActionTable = slrTable.actionTable.map(row => row.map(operation => {
        if(operation == null) {
            return null;
        } else {
            return getOperationObject(operation, slrTable);
        }
    }));
    slrActionTable = JSON.stringify(slrActionTable);
    slrActionTable = createAssignment("__slrActionTable", slrActionTable);
    // console.log(slrActionTable);

    // create slrGotoTable
    //     slrGotoTable
    var slrGotoTable = slrTable.gotoTable.map(row => row.map(operation => {
        if(operation == null) {
            return null;
        } else {
            return getOperationObject(operation, slrTable);
        }
    }));
    slrGotoTable = JSON.stringify(slrGotoTable);
    slrGotoTable = createAssignment("__slrGotoTable", slrGotoTable);
    // console.log(slrGotoTable);

    // create body
    //     body
    var body = createParserBody();
    // console.log(body);

    ///////////////////////////////////////////////////////////////
    // create parser
    var parserCode = "";
    parserCode += headerString + '\n';
    parserCode += terminalProperties + '\n';
    parserCode += reduceFunctions + '\n';
    parserCode += reduceFunctionNames + '\n';
    parserCode += reduceFunctionArgcs + '\n';
    parserCode += productionLHSIndexes + '\n';
    parserCode += operationTypeObject + '\n';
    parserCode += slrActionTable + '\n';
    parserCode += slrGotoTable + '\n';
    parserCode += body + '\n';
    
    return parserCode;
}

module.exports.generateParser = generateParser;