MAKEFLAGS += --silent

FORCE: ;

%.js : %.buf FORCE
ifeq ($(bootstrapped), 0)
	node ./handwritten_buffalo/buffalo.js $<
else
	node buffalo.js $<
endif
	
