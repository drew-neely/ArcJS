MAKEFLAGS += --silent
.PRECIOUS: %.js
FORCE: ;

FILES = buffalo_lexer.js buffalo_parser.js buffalo_parser.buf buffalo.js \
	code_generation.js item.js nonterminal.js production.js slrTable.js terminal.js

ok ?= 0
stable ?= 0

TESTS := $(wildcard tests/*)

stable : check_stable parser
	rm -rf ./stable_buffalo/; mkdir ./stable_buffalo
	for file in $(FILES) ; do \
		cp $${file} ./stable_buffalo/ ; \
	done
	echo "Built stable verion"

check_stable :
	@echo "Are you sure you want to overwrite the stable version?\n[y/n]: \c" \
		&& read ans && [ $${ans:-N} == y ]

%.js : %.buf FORCE
ifeq ($(stable), 0)
	-node buffalo.js $<
else
	# echo "Building $< with stable_buffalo"
	-node ./stable_buffalo/buffalo.js $<
endif

parser : FORCE
	($(MAKE) buffalo_parser.js)

%.test : tests/%/test.js tests/%/grammar.buf tests/%/grammar.js FORCE
	node $< > tests/$*/test.out
ifeq ($(ok), 0)
	(test -e tests/$*/test.ok && \
		(test -z "`diff tests/$*/test.out tests/$*/test.ok`" && \
			echo "$*: \033[38;5;10mPASS\033[0m") || \
			(echo "$*: \033[38;5;9mFAIL\033[0m" ; node $<)) || \
		echo "$*: \033[38;5;9mFAIL\033[0m - no .ok file"
else
	cp tests/$*/test.out tests/$*/test.ok 
endif

test : TESTS FORCE
	for test in ./tests/*/ ; do \
		($(MAKE) `basename $$test`.test || \
			echo "`basename $$test`: \033[38;5;9mFAIL\033[0m"); \
	done 

clean : FORCE
	for test in ./tests/*/ ; do \
		rm -f tests/`basename $$test`/test.out ; \
		rm -f tests/`basename $$test`/grammar.js ; \
	done 
