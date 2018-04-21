# Git
export GIT_BRANCH 	= $(shell git rev-parse --abbrev-ref HEAD)
export GIT_COMMIT		= $(shell git rev-parse HEAD)
export GIT_REMOTES	= $(shell git remote -v | awk '{ print $1; }' | sort | uniq)

# CI
export CI_COMMIT_REF_SLUG		?= $(GIT_BRANCH)
export CI_ENVIRONMENT_SLUG 	?= local
export CI_RUNNER_DESCRIPTION ?= $(shell hostname)

# Debug
export DEBUG_BIND  ?= 127.0.0.1
export DEBUG_PORT  ?= 9229

# Paths
# resolve the makefile's path and directory, from https://stackoverflow.com/a/18137056
export MAKE_PATH		?= $(abspath $(lastword $(MAKEFILE_LIST)))
export ROOT_PATH		?= $(dir $(MAKE_PATH))
export CONFIG_PATH 	?= $(ROOT_PATH)/config
export SCRIPT_PATH 	?= $(ROOT_PATH)/scripts
export SOURCE_PATH 	?= $(ROOT_PATH)/src
export TARGET_PATH	?= $(ROOT_PATH)/out
export TARGET_LOG		?= $(TARGET_PATH)/apex-reference.log
export TARGET_MAIN 	?= $(TARGET_PATH)/main-bundle.js
export TEST_PATH		?= $(ROOT_PATH)/test

# Node options
NODE_BIN		:= $(ROOT_PATH)/node_modules/.bin
NODE_CMD		?= $(shell env node)
NODE_DEBUG	?= --inspect-brk=$(DEBUG_BIND):$(DEBUG_PORT) --nolazy
NODE_INFO		:= $(shell node -v)

# Tool options
BUNDLE_OPTS	?= --config "$(CONFIG_PATH)/webpack.js" --display-optimization-bailout --display-error-details
COVER_CHECK ?= --check-coverage --branches 70 --functions 85 --lines 85 --statements 85 	# increase this every so often
COVER_OPTS	?= --reporter=text-summary --reporter=html --report-dir="$(TARGET_PATH)/coverage"
DOCS_OPTS		?= --exclude "test.+" --tsconfig "$(CONFIG_PATH)/tsconfig.json" --out "$(TARGET_PATH)/docs"
MOCHA_MULTI ?= --reporter mocha-multi --reporter-options json="$(TARGET_PATH)/mocha.json",spec
MOCHA_OPTS  ?= --check-leaks --colors --sort --ui bdd

all: configure bundle test docs ## builds, bundles, and tests the application
	@echo Success! make run-terminal to launch

strict: configure bundle-check test-check docs ## builds, bundles, and tests the application with type checks and extra warnings (slow)
	@echo Success! make run-terminal to launch

# from https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
help: ## print this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort \
		| sed 's/^.*\/\(.*\)/\1/' \
		| awk 'BEGIN {FS = ":[^:]*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

bundle: bundle-cover ## build the distributable version of the application

bundle-check: ## bundle the application with full type checking (stricter)
	TEST_CHECK=true $(NODE_BIN)/webpack $(BUNDLE_OPTS)

bundle-cover: ## bundle the application without type checking (faster)
	TEST_CHECK=false $(NODE_BIN)/webpack $(BUNDLE_OPTS)

bundle-stats: ## bundle the application and emit statistics
	TEST_CHECK=false $(NODE_BIN)/webpack $(BUNDLE_OPTS) --json --profile > "$(TARGET_PATH)/webpack.json"

bundle-watch: ## bundle the application and watch for changes
	TEST_CHECK=false $(NODE_BIN)/webpack $(BUNDLE_OPTS) --watch

clean: ## clean up the target directory
	rm -rf $(TARGET_PATH)

configure: ## create the target directory and other files not in git
	mkdir -p $(TARGET_PATH)

docs: ## generate html docs
	$(NODE_BIN)/typedoc $(DOCS_OPTS)

push: ## push to both gitlab and github (this assumes you have both remotes set up)
	git push gitlab
	git push github

test: test-check ## run mocha unit tests

test-check: ## run mocha unit tests with coverage reports
	$(NODE_BIN)/nyc $(COVER_OPTS) $(NODE_BIN)/mocha $(MOCHA_OPTS) $(TARGET_PATH)/test-bundle.js

test-leaks: ## run mocha unit tests with coverage reports
	$(NODE_BIN)/nyc $(COVER_OPTS) $(NODE_BIN)/mocha $(MOCHA_OPTS) $(TARGET_PATH)/test-bundle.js

test-watch:
	$(NODE_BIN)/nyc $(COVER_OPTS) $(NODE_BIN)/mocha $(MOCHA_OPTS) --watch $(TARGET_PATH)/test-bundle.js

todo:
	@echo "Remaining tasks:"
	@echo ""
	@grep "todo" -r src/
	@echo ""
	@echo "Pending tests:"
	@echo ""
	@grep "[[:space:]]xit" -r $(TEST_PATH)

update: ## check yarn for outdated packages
	yarn -L -C -P '.*'
