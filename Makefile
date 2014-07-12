NODE_MODULES_BIN = node_modules/.bin
SUPERVISOR := $(NODE_MODULES_BIN)/supervisor

MOCHA_FLAGS ?= -R dot

all: npm validate

# Install npm modules
npm:
	@npm install --registry http://npm.yandex-team.ru/

# Validation
validate: lint test

# Lint js files
lint:
	@$(NODE_MODULES_BIN)/jshint-groups
	@$(NODE_MODULES_BIN)/jscs .

test: test-client test-server

test-client:
	@echo Run client tests
	@$(NODE_MODULES_BIN)/mocha-phantomjs $(MOCHA_FLAGS) tests/client/run-tests.html

test-server:
	@echo Run server tests
	@$(NODE_MODULES_BIN)/mocha $(MOCHA_FLAGS) --recursive tests/server tests/api

# If the first argument is "example"...
ifeq (example,$(firstword $(MAKECMDGOALS)))
  # use the rest as arguments for "example"
  RUN_ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
  # ...and turn them into do-nothing targets
  $(eval $(RUN_ARGS):;@:)
endif

# Run an example
example: npm
	@$(SUPERVISOR) -n exit -w examples -- $(RUN_ARGS)

.PHONY: all npm validate lint test test-client test-server example
