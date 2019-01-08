# Git
export GIT_BRANCH 	= $(shell git rev-parse --abbrev-ref HEAD)
export GIT_COMMIT		= $(shell git rev-parse HEAD)
export GIT_REMOTES	= $(shell git remote -v | awk '{ print $1; }' | sort | uniq)
export GIT_OPTIONS  ?=

# CI
export CI_COMMIT_REF_SLUG		?= $(GIT_BRANCH)
export CI_COMMIT_SHA ?= $(GIT_COMMIT)
export CI_ENVIRONMENT_SLUG 	?= local
export CI_JOB_ID ?= 0
export CI_RUNNER_DESCRIPTION ?= $(shell hostname)
export CI_RUNNER_ID ?= $(shell hostname)
export CI_RUNNER_VERSION ?= 0.0.0

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
export VENDOR_PATH	?= $(ROOT_PATH)/vendor

# Node options
NODE_BIN		:= $(ROOT_PATH)/node_modules/.bin
NODE_CMD		?= $(shell env node)
NODE_DEBUG	?= --inspect-brk=$(DEBUG_BIND):$(DEBUG_PORT) --nolazy

# Tool options
BUNDLE_OPTS	?= --config "$(CONFIG_PATH)/webpack.js" --display-optimization-bailout --display-error-details
COVER_CHECK ?= --check-coverage --branches 70 --functions 85 --lines 85 --statements 85 	# increase this every so often
COVER_OPTS	?= --reporter=text-summary --reporter=html --report-dir="$(TARGET_PATH)/coverage"
DOCS_OPTS		?= --exclude "test.+" --tsconfig "$(CONFIG_PATH)/tsconfig.json" --out "$(TARGET_PATH)/docs"
MOCHA_MULTI ?= --reporter mocha-multi --reporter-options json="$(TARGET_PATH)/mocha.json",spec
MOCHA_OPTS  ?= --check-leaks --colors --max-old-space-size=4096 --sort --ui bdd
RELEASE_OPTS ?= --commit-all

# Versions
export NODE_VERSION		:= $(shell node -v)
export RUNNER_VERSION  := $(CI_RUNNER_VERSION)
export WEBPACK_VERSION := $(shell $(NODE_BIN)/webpack -v)

all: build run-terminal

clean: ## clean up the target directory
	rm -rf node_modules
	rm -rf $(TARGET_PATH)

configure: ## create the target directory and other files not in git
	mkdir -p $(TARGET_PATH)

# from https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
help: ## print this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort \
		| sed 's/^.*\/\(.*\)/\1/' \
		| awk 'BEGIN {FS = ":[^:]*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

git-push: ## push to both gitlab and github (this assumes you have both remotes set up)
	git push $(GIT_OPTIONS) github $(GIT_BRANCH)
	git push $(GIT_OPTIONS) gitlab $(GIT_BRANCH)

# from https://gist.github.com/amitchhajer/4461043#gistcomment-2349917
git-stats: ## print git contributor line counts (approx, for fun)
	git ls-files | while read f; do git blame -w -M -C -C --line-porcelain "$$f" |\
		grep -I '^author '; done | sort -f | uniq -ic | sort -n

todo:
	@echo "Remaining tasks:"
	@echo ""
	@grep "TODO" -r docs/ src/ test/ || true
	@echo ""
	@echo "Pending tests:"
	@echo ""
	@grep "[[:space:]]xit" -r test/ || true
	@echo "Casts to any:"
	@echo ""
	@grep "as any" -r src/ test/ || true
	@echo ""

node_modules: yarn-install

yarn-install: ## install dependencies from package and lock file
	yarn

yarn-update: ## check yarn for outdated packages
	yarn -L -C -P '.*'

# build targets
build: ## builds, bundles, and tests the application
build: node_modules configure bundle test

build-strict: ## builds, bundles, and tests the application with type checks and extra warnings (slow)
build-strict: node_modules configure bundle-check test-check

bundle: bundle-cover ## build the distributable version of the application

bundle-check: ## bundle the application with full type checking (stricter)
	TEST_CHECK=true $(NODE_BIN)/webpack $(BUNDLE_OPTS)

bundle-cover: ## bundle the application without type checking (faster)
	TEST_CHECK=false $(NODE_BIN)/webpack $(BUNDLE_OPTS)

bundle-stats: ## bundle the application and print statistics
	TEST_CHECK=false $(NODE_BIN)/webpack $(BUNDLE_OPTS) --json --profile |\
		tee "$(TARGET_PATH)/webpack.json"

bundle-watch: ## bundle the application and watch for changes
	TEST_CHECK=false $(NODE_BIN)/webpack $(BUNDLE_OPTS) --watch

bundle-docs: ## generate html docs
	$(NODE_BIN)/typedoc $(DOCS_OPTS)

release: ## create a release
	$(NODE_BIN)/standard-version --sign $(RELEASE_OPTS)
	GIT_OPTIONS=--tags $(MAKE) git-push

release-dry: ## test creating a release
	$(NODE_BIN)/standard-version --sign $(RELEASE_OPTS) --dry-run

run-config: ## run the bot to test the config
	ISOLEX_HOME=$(ROOT_PATH)/docs node $(TARGET_PATH)/main-bundle.js --test

run-docker: ## run the bot inside a docker container
	docker run --env-file ${HOME}/.isolex.env -v $(ROOT_PATH)/docs:/app/docs:ro \
		ssube/isolex:master --config-name 'isolex.yml' --config-path '/app/docs'

run-terminal: ## run the bot in a terminal
	ISOLEX_HOME=$(ROOT_PATH)/docs node $(TARGET_PATH)/main-bundle.js --config-name 'isolex.yml'

run-bunyan: ## run the bot with bunyan logs
	$(MAKE) run-terminal | $(NODE_BIN)/bunyan --strict

test: test-check ## run mocha unit tests

test-check: ## run mocha unit tests with coverage reports
	$(NODE_BIN)/mocha $(MOCHA_OPTS) $(TARGET_PATH)/test-bundle.js

test-cover: ## run mocha unit tests with coverage reports
	$(NODE_BIN)/nyc $(COVER_OPTS) $(NODE_BIN)/mocha $(MOCHA_OPTS) $(TARGET_PATH)/test-bundle.js

test-leaks: ## run mocha unit tests with coverage reports
	$(NODE_BIN)/nyc $(COVER_OPTS) $(NODE_BIN)/mocha $(MOCHA_OPTS) $(TARGET_PATH)/test-bundle.js

test-watch:
	$(NODE_BIN)/mocha $(MOCHA_OPTS) --watch $(TARGET_PATH)/test-bundle.js