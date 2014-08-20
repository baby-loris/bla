NODE_MODULES_BIN := node_modules/.bin
ENB := $(NODE_MODULES_BIN)/enb

all: npm build dev

# Install npm modules
npm:
	@npm install

# Build project
build:
	@$(ENB)  make

# Run an application
dev:
	@node index.js

# Clean build results
clean:
	@$(ENB) $(ENB_FLAGS) make clean

.PHONY: all npm build dev clean
