var Token = require("./token.js");

var syntaxError = function(str) {
    throw "Syntax Error: " + str;
}

var lexer = function(code) {
    var pos = 0;

    var peek = function(i) {
        if(i == undefined) i = 0;
        return code.charAt(pos + i);
    }

    var pop = function() {
        var char = code.charAt(pos);
        pos++;
        return char; 
    }

    var unpop = function() {
        pos--;
    }

    var isWordChar = function(char) {
        var n = char.charCodeAt(0);
        // n == '_' || n=='$' || ('A' <= n <= 'Z) || ('a' <= n <= 'z')
        return (n==95 || n==36 || (65<=n && n<= 90) || (97<=n && n<=122));
    }

    var isNumberChar = function(char) {
        var n = char.charCodeAt(0);
        // '0' <= n <= '9'
        return (48 <= n && n <= 57)
    }
    
    var isDotChar = function(char) {
        return char.charAt(0) == '.';
    }

    var isSign = function(char) {
        var c = char.charAt(0);
        return c == '-' || c == '+';
    }

    var skipWhitespaceAndComments = function() {
        var start = pos;
        var again;
        do {
            again = false;
            while(Token.whitespaceChars.includes(peek())) {
                pop();
            }
            if(peek() == '/' && peek(1) == '/') {
                pop();
                pop();
                while(peek() != '\n') {
                    pop();
                }
                pop();
                again = true;
            }
            if(peek() == '/' && peek(1) == '*') {
                pop();
                pop();
                while(!(peek() == '*' && peek(1) == '/')) {
                    pop();
                }
                pop();
                pop();
                again = true;
            }
        } while(again);
        return pos - start;
    }

    var getWordToken = function() { // precondition: next char must pass isWordChar
        var word = "";
        do {
            word += pop();
        } while(isWordChar(peek()) || isNumberChar(peek()));
        for(var op = 0; op < Token.OperatorInfo.length; op++) {
            if(Token.OperatorInfo[op].symbol == word) {
                return new Token(Token.tokenType.OPERATOR, op);
            }
        }
        for(var kw = 0; kw < Token.KeyWordInfo.length; kw++) {
            if(Token.KeyWordInfo[kw].symbol == word) {
                return new Token(Token.tokenType.KEYWORD, kw);
            }
        }
        return new Token(Token.tokenType.ID, word);
    }

    var getNumberToken = function() {
        var number = "";
        var decimalFound = false;
        do {
            var c = pop();
            if(isDotChar(c)){
                if(decimalFound) {
                    syntaxError("Number cannot have multiple decimals");
                }
                decimalFound = true;
            }
            number += c;
        } while(isNumberChar(peek()) || isDotChar(peek()));
        if(isWordChar(peek())) {
            syntaxError("Invalid symbol \'" + peek() + "\' in number");
        }
        number = Number(number);
        return new Token(Token.tokenType.NUMBER, number);
    }

    var getStringToken = function() {
        var str = "";
        var startQuote = pop();
        while(peek() != startQuote) {
            var char = pop();
            if(char == '\\') {
                var char2 = pop();
                switch(char2) {
                    case '\'': str += "\'"; break;
                    case '\"': str += "\""; break;
                }
            } else {
                str += char;
            }
        }
        pop();
        return new Token(Token.tokenType.STRING, str);
    }

    var getSymbolToken = function() {
        var str = "";
        while(Token.specialChars.includes(peek())) {
            str += pop();
        }
        var chars = str;
        while(str != '') {
            for(var i = 0; i < Token.OperatorInfo.length; i++) {
                if(Token.OperatorInfo[i].symbol == str) {
                    return new Token(Token.tokenType.OPERATOR, i);
                }
            }
            for(var i = 0; i < Token.SpecialInfo.length; i++) {
                if(Token.SpecialInfo[i].symbol == str) {
                    return new Token(Token.tokenType.SPECIAL, i);
                }
            }
            unpop();
            str = str.substring(0, str.length - 1);
        }
        syntaxError("Unrecognized symbol \'" + chars + "\'");
    }
    
    this.lex = function() {
        var res = [];
        skipWhitespaceAndComments();
        while(peek() != '') {
            var c = peek();
            if(isWordChar(c)) {
                res.push(getWordToken());
            } else if(isNumberChar(c) || (isDotChar(c) && isNumberChar(peek(1)))) {
                res.push(getNumberToken());
            } else if(c == "\"" || c == "\'") {
                res.push(getStringToken());
            } else if(Token.specialChars.includes(c)) {
                res.push(getSymbolToken());
            } else {
                syntaxError("Invalid character \'" + c + "\'");
            }
            skipWhitespaceAndComments();
        }
        res.push(new Token(Token.tokenType.END));
        return res;
    }
}

module.exports = lexer;
