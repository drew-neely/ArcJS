MAKEFLAGS += --silent
.PRECIOUS: %.js
FORCE: ;

bootstrapped ?= 1
ok ?= 0

TESTS := $(wildcard tests/*)

%.js : %.buf FORCE
ifeq ($(bootstrapped), 0)
	node ./handwritten_buffalo/buffalo.js $<
else
	node buffalo.js $<
endif

%.test : tests/%/test.js tests/%/grammar.buf tests/%/grammar.js FORCE
	node $< > tests/$*/test.out 
ifeq ($(ok), 0)
	(test -z "`diff tests/$*/test.out tests/$*/test.ok`" && \
		echo "$*: \033[38;5;10mPASS\033[0m") || \
		(echo "$*: \033[38;5;9mFAIL\033[0m" ; node $<)
else
	cp tests/$*/test.out tests/$*/test.ok 
endif

test : TESTS FORCE
	for test in ./tests/*/ ; do \
		$(MAKE) `basename $$test`.test ; \
		echo "" ; \
	done 

clean : FORCE
	for test in ./tests/*/ ; do \
		rm -f tests/`basename $$test`/test.out ; \
		rm -f tests/`basename $$test`/grammar.js ; \
	done 
