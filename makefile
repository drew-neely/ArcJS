MAKEFLAGS += --silent

parser: arc_parser.js

arc_parser.js : arc_parser.buf
	$(MAKE) -C parser_gen ../arc_parser.js stable=1

test :
	node arc.js tests/test1.js

clean : 
	rm arc_parser.js

.PHONY : parser test clean