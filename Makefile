v ?= @

NODE_MODULES_BIN = node_modules/.bin

MOCHA_FLAGS ?= -R dot

all: npm validate

# Install npm modules
npm:
	$(v)npm install

# Validation
validate: lint test

# Lint js files
lint:
	$(v)$(NODE_MODULES_BIN)/jshint-groups
	$(v)$(NODE_MODULES_BIN)/jscs .

# Run all tests
test: test-client test-server test-examples

# Run client tests
test-client:
	$(v)echo Run client tests
	$(v)$(NODE_MODULES_BIN)/mocha-phantomjs $(MOCHA_FLAGS) tests/blocks/run-tests.html

# Run tests via zuul locally
zuul-local:
	$(v)$(NODE_MODULES_BIN)/zuul --local 7777 -- tools/zuul.js

# Run tests via zuul in the sause cloud
zuul:
	$(v)$(NODE_MODULES_BIN)/zuul -- tools/zuul.js

# Run server tests
test-server:
	$(v)echo Run server tests
	$(v)$(NODE_MODULES_BIN)/mocha $(MOCHA_FLAGS) --recursive tests/lib tests/api

# Run examples tests
test-examples:
	$(v)echo Run examples tests
	$(v)$(NODE_MODULES_BIN)/mocha $(MOCHA_FLAGS) --recursive tests/examples

# If the first argument is "run"...
ifeq (run,$(firstword $(MAKECMDGOALS)))
  # use the rest as arguments for "run"
  RUN_ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
  # ...and turn them into do-nothing targets
  $(eval $(RUN_ARGS):;@:)
endif

# Run an example
run: npm
	$(v)$(NODE_MODULES_BIN)/supervisor -n exit -w examples -- $(RUN_ARGS)

# Build coverage
coverage:
	$(v)$(NODE_MODULES_BIN)/istanbul cover $(NODE_MODULES_BIN)/_mocha tests/lib tests/examples tests/api -- --recursive $(MOCHA_FLAGS)

# Build a new version of the library
build:
	$(v)mkdir -p build
	$(v)cat node_modules/vow/lib/vow.js \
		blocks/bla-error/bla-error.js \
		blocks/bla/bla.js > build/bla.js
	$(v)$(NODE_MODULES_BIN)/uglifyjs build/bla.js > build/bla.min.js

# Mark a new release
minor patch:
	$(v)node tools/release.js $(RELEASE_TOOL_FLAGS) $@

.PHONY: all npm validate lint test test-client test-server test-examples run coverage build minor patch
