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
	@$(NODE_MODULES_BIN)/mocha-phantomjs $(MOCHA_FLAGS) tests/blocks/run-tests.html

# Run server tests
test-server:
	@echo Run server tests
	@$(NODE_MODULES_BIN)/mocha $(MOCHA_FLAGS) --recursive tests/lib tests/examples tests/api

# If the first argument is "run"...
ifeq (run,$(firstword $(MAKECMDGOALS)))
  # use the rest as arguments for "run"
  RUN_ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
  # ...and turn them into do-nothing targets
  $(eval $(RUN_ARGS):;@:)
endif

# Run an example
run: npm
	@$(NODE_MODULES_BIN)/supervisor -n exit -w examples -- $(RUN_ARGS)

# Build coverage
coverage:
	@$(NODE_MODULES_BIN)/istanbul cover $(NODE_MODULES_BIN)/_mocha tests/lib tests/examples tests/api -- --recursive $(MOCHA_FLAGS)
	@cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js && rm -rf ./coverage

# Build a new version of the library
build_lib:
	@cat node_modules/vow/lib/vow.js \
		blocks/baby-loris-api-error/baby-loris-api-error.js \
		blocks/baby-loris-api-error/baby-loris-api-error.js > build/baby-loris-api.js
	@$(NODE_MODULES_BIN)/uglifyjs build/baby-loris-api.js > build/baby-loris-api.min.js

# Set up travis environment
travis:
	@git config --global user.email "travis@travis-ci.org"
	@git config --global user.name "Travis"
	@git add build
	@git commit -m "Rebuild"
	@git push

.PHONY: all npm validate lint test test-client test-server run coverage build_lib travis
