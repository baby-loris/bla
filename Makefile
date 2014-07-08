NODE_MODULES_BIN = node_modules/.bin
SUPERVISOR := $(NODE_MODULES_BIN)/supervisor

all: npm example

# Install npm modules
npm:
	@npm install --registry http://npm.yandex-team.ru/

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

.PHONY: all npm example
