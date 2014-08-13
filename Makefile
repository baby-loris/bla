NODE_MODULES_BIN = node_modules/.bin

MOCHA_FLAGS ?= -R dot

all: npm validate

# Install npm modules
npm:
	@npm install

# Validation
validate: lint test

# Lint js files
lint:
	@$(NODE_MODULES_BIN)/jshint-groups
	@$(NODE_MODULES_BIN)/jscs .

# Run all tests
test: test-client test-server

# Run client tests
test-client:
	@echo Run client tests
	@$(NODE_MODULES_BIN)/mocha-phantomjs $(MOCHA_FLAGS) tests/client/run-tests.html

# Run server tests
test-server:
	@echo Run server tests
	@$(NODE_MODULES_BIN)/mocha $(MOCHA_FLAGS) --recursive tests/server tests/examples tests/api

# If the first argument is "example"...
ifeq (example,$(firstword $(MAKECMDGOALS)))
  # use the rest as arguments for "example"
  RUN_ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
  # ...and turn them into do-nothing targets
  $(eval $(RUN_ARGS):;@:)
endif

# Run an example
example: npm
	@$(NODE_MODULES_BIN)/supervisor -n exit -w examples -- $(RUN_ARGS)

# Build coverage
coverage:
	@$(NODE_MODULES_BIN)/ISTANBUL cover $(NODE_MODULES_BIN)/mocha tests/server tests/examples tests/api -- --recursive $(MOCHA_FLAGS)

.PHONY: all npm validate lint test test-client test-server example coverage
