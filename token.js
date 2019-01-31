
function Token(type, value) {
    this.type = type;
    this.value = value;
    this.link;
    this.operands;
    
    this.print = function() {
        var str = "TOKEN ::";
        var type = "<type : " + Token.tokenTypeInfo[this.type].symbol + ">";
        while(type.length < 17) type += " ";
        var value;
        switch(this.type) {
            case Token.tokenType.NUMBER:
                value = this.value.toString();
                break;
            case Token.tokenType.STRING:
                value = this.value;
                value = value.replace("\\", "\\\\"); // !!! // Probably fix at some point
                value = value.replace("\"", "\\\"");
                value = value.replace("\'", "\\\'");
                value = value.replace("\t", "\\t");
                value = value.replace("\n", "\\n");
                value = value.replace("\r", "\\r");
                value = value.replace("\b", "\\b");
                value = value.replace("\f", "\\f");
                value = "\"" + value + "\"";
                break;
            case Token.tokenType.OPERATOR:
                value = Token.OperatorInfo[this.value].symbol;
                break;
            case Token.tokenType.SPECIAL:
                value = Token.SpecialInfo[this.value].symbol;
                break;
            case Token.tokenType.KEYWORD:
                value = Token.KeyWordInfo[this.value].symbol;
                break;
            case Token.tokenType.ID:
                value = this.value;
                break;
        }
        value = "<value : " + value + " >"
        console.log(str + " " + type + " " + value);
    }
}

Token.whitespaceChars = [' ', '\t', '\n', '\r', '\v', '\f'];
Token.specialChars = [';', ':', ',', '(', ')', '{', '}', '[', ']', '.',
                      '+', '-', '*', '/', '%', '=', '!', '>', '<', '?',
                      '&', '|', '~', '^'];

Token.tokenType = {
    NUMBER:0,
    STRING:1,
    OPERATOR:2,
    SPECIAL: 3,
    KEYWORD:4,
    ID:5
};

Token.tokenTypeInfo = [
    {symbol:"number"   },
    {symbol:"string"   },
    {symbol:"operator" },
    {symbol:"special"  },
    {symbol:"keyword"  },
    {symbol:"id"       }
];

Token.SpecialType = {
    SEMICOLON:0,
    COLON:1,
    COMMA:2,
    L_PAREN:3,
    R_PAREN:4,
    L_CURLY_BRACKET:5,
    R_CURLY_BRACKET:6,
    L_SQUARE_BRACKET:7,
    R_SQUARE_BRACKET:8,
    ARROW:11,
    DOT:12
}

Token.SpecialInfo = [
    {symbol:";"  }, // # 0
    {symbol:":"  }, // # 1
    {symbol:","  }, // # 2
    {symbol:"("  }, // # 3
    {symbol:")"  }, // # 4
    {symbol:"{"  }, // # 5
    {symbol:"}"  }, // # 6
    {symbol:"["  }, // # 7
    {symbol:"]"  }, // # 8
    {symbol:"=>" }, // # 9
    {symbol:"."  }  // # 10
]

Token.KeyWordType = {
    VAR:0,
    IF:1,
    ELSE:2,
    WHILE:3,
    DO:4,
    FOR:5,
    SWITCH:6,
    CASE:7,
    BREAK:8,
    WITH:9,
    DEFAULT:10,
    TRY:11,
    CATCH:12,
    FINALLY:13,
    THROW:14,
    NEW:15,
    RETURN:16,
    THIS:17,
    CONTINUE:18,
    FUNCTION:19
}

Token.KeyWordInfo = [
    {symbol:"var"      }, // VAR       # 0
    {symbol:"if"       }, // IF        # 1
    {symbol:"else"     }, // ELSE      # 2
    {symbol:"while"    }, // WHILE     # 3
    {symbol:"do"       }, // DO        # 4
    {symbol:"for"      }, // FOR       # 5
    {symbol:"switch"   }, // SWITCH    # 6
    {symbol:"case"     }, // CASE      # 7
    {symbol:"break"    }, // BREAK     # 8
    {symbol:"with"     }, // WITH      # 9
    {symbol:"default"  }, // DEFAULT:  # 10
    {symbol:"try"      }, // TRY:      # 11
    {symbol:"catch"    }, // CATCH:    # 12
    {symbol:"finally"  }, // FINALLY:  # 13
    {symbol:"throw"    }, // THROW:    # 14
    {symbol:"new"      }, // NEW:      # 15
    {symbol:"return"   }, // RETURN:   # 16
    {symbol:"this"     }, // THIS:     # 17
    {symbol:"continue" }, // CONTINUE: # 18
    {symbol:"function" } // FUNCTION: # 19
]

Token.OperatorType = {
    PLUS:0,
    MINUS:1,
    TIMES:2,
    DIVIDE:3,
    MODULUS:4,
    INCREMENT:5, // !!! // need pre and post increment for ++i and i++
    DECREMENT:6,
    ASSIGN:7,
    ASSIGN_PLUS:8,
    ASSIGN_MINUS:9,
    ASSIGN_TIMES:10,
    ASSIGN_DIVIDE:11,
    ASSIGN_MODULUS:12,
    EQUAL:13,
    EQUAL_TYPE:14,
    NOT_EQUAL:15,
    NOT_EQUAL_TYPE:16,
    GREATER_THAN:17,
    LESS_THAN:18,
    GREATER_THAN_EQUAL:19,
    LESS_THAN_EQUAL:20,
    TERNARY:21,
    LOGICAL_AND:22,
    LOGICAL_OR:23,
    LOGICAL_NOT:24,
    BITWISE_AND:25,
    BITWISE_OR:26,
    BITWISE_NOT:27,
    BITWISE_XOR:28,
    BITWISE_LSHIFT:29,
    BITWISE_RSHIFT:30,
    TYPEOF:31,
    DELETE:32,
    IN:33,
    INSTANCEOF:34,
    VOID:35
}

Token.Notation = {
    PREFIX:0,
    INFIX:1,
    POSTFIX:2,
    TERNARY:3
}

Token.OperatorInfo =
[
    {symbol:"+"         , numOperands:2, notation:Token.Notation.INFIX   }, // PLUS               # 0
    {symbol:"-"         , numOperands:2, notation:Token.Notation.INFIX   }, // MINUS              # 1
    {symbol:"*"         , numOperands:2, notation:Token.Notation.INFIX   }, // TIMES              # 2
    {symbol:"/"         , numOperands:2, notation:Token.Notation.INFIX   }, // DIVIDE             # 3
    {symbol:"%"         , numOperands:2, notation:Token.Notation.INFIX   }, // MODULUS            # 4
    {symbol:"++"        , numOperands:1, notation:Token.Notation.POSTFIX }, // INCREMENT          # 5
    {symbol:"--"        , numOperands:1, notation:Token.Notation.POSTFIX }, // DECREMENT          # 6
    {symbol:"="         , numOperands:2, notation:Token.Notation.INFIX   }, // ASSIGN             # 7
    {symbol:"+="        , numOperands:2, notation:Token.Notation.INFIX   }, // ASSIGN_PLUS        # 8
    {symbol:"-="        , numOperands:2, notation:Token.Notation.INFIX   }, // ASSIGN_MINUS       # 9
    {symbol:"*="        , numOperands:2, notation:Token.Notation.INFIX   }, // ASSIGN_TIMES       # 10
    {symbol:"/="        , numOperands:2, notation:Token.Notation.INFIX   }, // ASSIGN_DIVIDE      # 11
    {symbol:"%="        , numOperands:2, notation:Token.Notation.INFIX   }, // ASSIGN_MODULUS     # 12
    {symbol:"=="        , numOperands:2, notation:Token.Notation.INFIX   }, // EQUAL              # 13
    {symbol:"==="       , numOperands:2, notation:Token.Notation.INFIX   }, // EQUAL_TYPE         # 14
    {symbol:"!="        , numOperands:2, notation:Token.Notation.INFIX   }, // NOT_EQUAL          # 15
    {symbol:"!=="       , numOperands:2, notation:Token.Notation.INFIX   }, // NOT_EQUAL_TYPE     # 16
    {symbol:">"         , numOperands:2, notation:Token.Notation.INFIX   }, // GREATER_THAN       # 17
    {symbol:"<"         , numOperands:2, notation:Token.Notation.INFIX   }, // LESS_THAN          # 18
    {symbol:">="        , numOperands:2, notation:Token.Notation.INFIX   }, // GREATER_THAN_EQUAL # 19
    {symbol:"<="        , numOperands:2, notation:Token.Notation.INFIX   }, // LESS_THAN_EQUAL    # 20
    {symbol:"?"         , numOperands:3, notation:Token.Notation.TERNARY }, // TERNARY            # 21
    {symbol:"&&"        , numOperands:2, notation:Token.Notation.INFIX   }, // LOGICAL_AND        # 22
    {symbol:"||"        , numOperands:2, notation:Token.Notation.INFIX   }, // LOGICAL_OR         # 23
    {symbol:"!"         , numOperands:1, notation:Token.Notation.PREFIX  }, // LOGICAL_NOT        # 24
    {symbol:"&"         , numOperands:2, notation:Token.Notation.INFIX   }, // BITWISE_AND        # 25
    {symbol:"|"         , numOperands:2, notation:Token.Notation.INFIX   }, // BITWISE_OR         # 26
    {symbol:"~"         , numOperands:2, notation:Token.Notation.PREFIX  }, // BITWISE_NOT        # 27
    {symbol:"^"         , numOperands:2, notation:Token.Notation.INFIX   }, // BITWISE_XOR        # 28
    {symbol:"<<"        , numOperands:2, notation:Token.Notation.INFIX   }, // BITWISE_LSHIFT     # 29
    {symbol:">>"        , numOperands:2, notation:Token.Notation.INFIX   }, // BITWISE_RSHIFT     # 30
    {symbol:"typeof"    , numOperands:1, notation:Token.Notation.PREFIX  }, // TYPEOF             # 31
    {symbol:"delete"    , numOperands:1, notation:Token.Notation.PREFIX  }, // DELETE             # 32
    {symbol:"in"        , numOperands:2, notation:Token.Notation.INFIX   }, // IN                 # 33
    {symbol:"instanceof", numOperands:2, notation:Token.Notation.INFIX   }, // INSTANCEOF         # 34
    {symbol:"void"      , numOperands:1, notation:Token.Notation.PREFIX  }  // VOID               # 35
]

module.exports = Token;