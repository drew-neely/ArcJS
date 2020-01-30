MAKEFLAGS += --silent
.PRECIOUS: %.js
FORCE: ;

boot ?= 1
ok ?= 0

TESTS := $(wildcard tests/*)

%.js : %.buf FORCE
ifeq ($(boot), 0)
	echo "Building $< with handwritten_buffalo"
	node ./handwritten_buffalo/buffalo.js $<
else
	-node buffalo.js $<
endif

parser :
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
