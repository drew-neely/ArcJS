var SyntaxError = function(msg, code, lineNum, linePos, exit) {
    if(exit == undefined) {
        exit = false;
    }
    var line = code.split('\n')[lineNum];
    var str = "SyntaxError : " + msg + '\n'
    str += "\t<line " + lineNum + ", char " + linePos + ">\n";
    var line = code.split('\n')[lineNum];
    str += '\t' + line + "\n";
    str += '\t' + (new Array(linePos + 1)).join('-') + '^' + (new Array(line.length - linePos)).join('-');
    if(exit) {
        process.exit(1);
    }
}

var TokenTypes = {
    HEADER : 0,
    BREAK : 1,
    DEFINE : 2,
    ALIAS : 3,
    VALUE : 5,
    ID : 4,
    COLON : 6,
    OR : 7,
    SEMICOLON : 8,
    ACTION : 9,
    EOF : 10
}

Array.prototype.peek = function() {return this[this.length - 1];}

var LexerState = function(string) {
    this.pos = 0;
    this.line = 0;
    this.linePos = 0;
    this.prevChar = '';
    this.specialStack = [];
    this._pop = function() {
        var char = string.charAt(this.pos);
        if(char == '/' && string.charAt(this.pos + 1) == '/') {
            while(char != '\n' && char != '') {
                char = string.charAt(this.pos++);
            }
            this.prevChar = char;
            char = string.charAt(this.pos);
            this.line++;
            this.linePos = 0;
        }
        var prevSpecial = this.specialStack.peek()
        switch(char) {
            case '\'' :
                if(this.prevChar != '\\' && prevSpecial == '\'') {
                    this.specialStack.pop();
                } else if(this.prevChar != '\\' && prevSpecial != '\"') {
                    this.specialStack.push('\'');
                } else if(this.prevChar == '\\' && (prevSpecial != '\'' && prevSpecial != '\"')) {
                    SyntaxError("unexpected escape character", string, this.line, this.linePos - 1);
                }
                break;
            case '\"' :
                if(this.prevChar != '\\' && prevSpecial == '\"') {
                    this.specialStack.pop();
                } else if(this.prevChar != '\\' && prevSpecial != '\'') {
                    this.specialStack.push('\"');
                } else if(this.prevChar == '\\' && (prevSpecial != '\'' && prevSpecial != '\"')) {
                    SyntaxError("unexpected escape character", string, this.line, this.linePos - 1);
                }
                break;
            case '{' :
                if(prevSpecial != '\'' && prevSpecial != '\"') {
                    this.specialStack.push('{');
                }
                break;
            case '}' :
                if(prevSpecial != '\'' && prevSpecial != '\"') {
                    if(prevSpecial == '{') {
                        this.specialStack.pop();
                    } else {
                        SyntaxError("unexpected symbol \'}\'", string, this.line, this.linePos);
                    }
                }
                break;
            case '' :
                if(this.specialStack.length != 0) {
                    switch(this.specialStack.peek()) {
                        case '{' :
                            SyntaxError("reached end of file while parsing, expected symbol \'}\'", code, state.line, state.linePos, true);
                            break;
                        case '\'' :
                            SyntaxError("reached end of file while parsing, expected symbol \'\'\'", code, state.line, state.linePos, true);
                            break;
                        case '\"' :
                            SyntaxError("reached end of file while parsing, expected symbol \'\"\'", code, state.line, state.linePos, true);
                            break;
                    }
                }
            default :

        }

        this.pos++;
        this.prevChar = char;
        if(char == '\n') {
            this.line ++;
            this.linePos = 0;
        } else {
            this.linePos++;
        }
        return char;
    }
    this.pop = function(chars) {
        if(chars == undefined) {
            chars = 1;
        }
        var str = "";
        for(var i = 0; i < chars; i++) {
            str += this._pop();
        }
        return str;
    }
    this.peek = function(chars) {
        if(chars == undefined) {
            chars = 1;
        }
        return string.substring(this.pos, this.pos + chars);
    }
    this.isEmpty = function() {
        return string.charAt(this.pos) == '';
    }
}

var lex = function(code) {
    var tokens = [];
    var state = new LexerState(code);

    // Extract header
    var headerCode = "";
    var foundHeader = false;
    while(!state.isEmpty()) {
        var nextChars = state.peek(2);
        if(nextChars == '%%') {
            if(state.specialStack.peek() == '{') { // check for unclosed {
                SyntaxError("expected symbol \'}\' before \'%%\'", code, state.line, state.linePos);
                do { // remove all '{' from top of stack
                    state.specialStack.pop();
                } while(state.specialStack.peek() == '{'); 
            }
            if(state.specialStack.peek() != '\'' && state.specialStack.peek() != '\"') { // %% not in string
                //found end of header
                tokens.push({type: TokenTypes.HEADER, code:headerCode.trim()});
                tokens.push({type: TokenTypes.BREAK});
                state.pop(2);
                foundHeader = true;
                break;
            }
        } 
        headerCode += state.pop();
    }
    if(!foundHeader) {
        SyntaxError("reached end of file while parsing, expected symbol \'%%\' at end of header",code,state.line, state.linePos, true);
    }

    var word = "";
    // lex definitions
    while(!(state.peek(2) == "%%" && state.specialStack.length == 0)) {
        if(state.isEmpty()) {
            SyntaxError("reached end of file while parsing, expected symbol \'%%\' at end of definition section", code, state.line, state.linePos, true);
        }
        var char = state.pop();
        if(/\s/.test(char) && state.specialStack.length == 0) {
            if(word == "alias") {
                tokens.push({type: TokenTypes.ALIAS});
                word = "";
            } else if(word == "define") {
                tokens.push({type: TokenTypes.DEFINE});
                word = "";
            } else if(word.length != 0) {
                tokens.push({type: TokenTypes.VALUE, value: word});
                word = "";
            }
        } else {
            word += char;
        }
    }
    tokens.push({type: TokenTypes.BREAK});
    state.pop(2); // remove '%%'
    word = "";

    // lex grammar
    while(true) {
        var char = state.pop();
        if(state.specialStack.length == 0 && ([':', '|', ';','{',''].indexOf(char) != -1 || /\s/.test(char))) {
            if(word.length != 0) {
                if(word.charAt(0) == '{' && word.charAt(word.length - 1) == '}') {
                    tokens.push({type: TokenTypes.ACTION, action: word.substring(1,word.length - 1).trim()});
                } else {
                    tokens.push({type: TokenTypes.ID, id: word});
                }
                word = "";
            }
        }
        if(char == '') {
            break;
        }
        if(state.specialStack.length == 0 && (char == ':' || char == '|' || char == ';')) {
            switch(char) {
                case ':' :
                    tokens.push({type: TokenTypes.COLON});
                    break;
                case '|' :
                    tokens.push({type: TokenTypes.OR});
                    break;
                case ';' :
                    tokens.push({type: TokenTypes.SEMICOLON});
                    break;
            }
        } else if(/\s/.test(char) && state.specialStack.length != 0)  {
            word += char;
        } else if(!/\s/.test(char)) {
            word += char;
        }
    }
    tokens.push({type : TokenTypes.EOF});
    return tokens;
}

module.exports.SyntaxError = SyntaxError;
module.exports.lex = lex;
module.exports.TokenTypes = TokenTypes;