# Git
export GIT_BRANCH	?= $(shell git rev-parse --abbrev-ref HEAD)
export GIT_COMMIT	?= $(shell git rev-parse HEAD)
export GIT_REMOTES	?= $(shell git remote -v | awk '{ print $1; }' | sort | uniq)
export GIT_OPTIONS	?=

# CI
export CI_COMMIT_REF_SLUG	?= $(GIT_BRANCH)
export CI_COMMIT_SHA	?= $(GIT_COMMIT)
export CI_ENVIRONMENT_SLUG	?= local
export CI_JOB_ID	?= 0
export CI_RUNNER_DESCRIPTION	?= $(shell hostname)
export CI_RUNNER_ID	?= $(shell hostname)
export CI_RUNNER_VERSION	?= 0.0.0

# Debug
export DEBUG_BIND  ?= 127.0.0.1
export DEBUG_PORT  ?= 9229

# Paths
# resolve the makefile's path and directory, from https://stackoverflow.com/a/18137056
export MAKE_PATH	?= $(abspath $(lastword $(MAKEFILE_LIST)))
export ROOT_PATH	?= $(dir $(MAKE_PATH))
export CONFIG_PATH 	?= $(ROOT_PATH)/config
export DOCS_PATH	?= $(ROOT_PATH)/docs
export SCRIPT_PATH 	?= $(ROOT_PATH)/scripts
export SOURCE_PATH 	?= $(ROOT_PATH)/src
export TARGET_PATH	?= $(ROOT_PATH)/out
export TARGET_LOG	?= $(TARGET_PATH)/apex-reference.log
export TARGET_MAIN 	?= $(TARGET_PATH)/index.js
export TEST_PATH	?= $(ROOT_PATH)/test
export VENDOR_PATH	?= $(ROOT_PATH)/vendor

# Node options
NODE_BIN	:= $(ROOT_PATH)/node_modules/.bin
NODE_CMD	?= $(shell env node)
NODE_DEBUG	?= --inspect-brk=$(DEBUG_BIND):$(DEBUG_PORT) --nolazy
export NODE_OPTIONS ?= --max-old-space-size=5500

# Tool options
COVER_CHECK ?= --check-coverage --branches 70 --functions 85 --lines 85 --statements 85 	# increase this every so often
COVER_OPTS	?= --reporter=lcov --reporter=text-summary --reporter=html --report-dir="$(TARGET_PATH)/coverage" --exclude-after-remap
DOCKER_IMAGE ?= ssube/isolex:master
DOCS_OPTS		?= --exclude "test.+" --tsconfig "$(CONFIG_PATH)/tsconfig.json" --out "$(TARGET_PATH)/docs"
MOCHA_MULTI ?= --reporter mocha-multi --reporter-options json="$(TARGET_PATH)/mocha.json",spec
MOCHA_OPTS  ?= --check-leaks --colors $(NODE_MEMORY) --sort --timeout 30000 --ui bdd
RELEASE_OPTS ?= --commit-all

SHELL := bash

# Versions
export NODE_VERSION		:= $(shell node -v)
export RUNNER_VERSION  := $(CI_RUNNER_VERSION)

all: build test run-terminal
	@echo Success!

ci: clean-target build test
	@echo Success!

clean: ## clean up everything added by the default target
clean: clean-deps clean-target

clean-deps: ## clean up the node_modules directory
	rm -rf node_modules

clean-target: ## clean up the target directory
	rm -rf $(TARGET_PATH)

configure: ## create the target directory and other files not in git
	mkdir -p $(TARGET_PATH)

node_modules: yarn-install

# from https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
help: ## print this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort \
		| sed 's/^.*\/\(.*\)/\1/' \
		| awk 'BEGIN {FS = ":[^:]*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

todo:
	@echo "Remaining tasks:"
	@echo ""
	@grep -i "todo" -r docs/ src/ test/ || true
	@echo ""
	@echo "Pending tests:"
	@echo ""
	@grep "[[:space:]]xit" -r test/ || true
	@echo "Casts to any:"
	@echo ""
	@grep "as any" -r src/ test/ || true
	@echo ""

# Build targets
build: ## builds, bundles, and tests the application
build: build-bundle build-docs

build-bundle: node_modules
	$(NODE_BIN)/rollup --config $(CONFIG_PATH)/rollup.js
	ls -lha $(TARGET_PATH)

build-docs: ## generate html docs
	$(NODE_BIN)/api-extractor run --config $(CONFIG_PATH)/api-extractor.json --local -v
	$(NODE_BIN)/api-documenter markdown -i $(TARGET_PATH)/api -o $(DOCS_PATH)/api

test: ## run mocha unit tests
test: test-cover

test-check: ## run mocha unit tests with coverage reports
	( export ISOLEX_HOME=$(ROOT_PATH)/docs; \
	  source $${ISOLEX_HOME}/isolex.env; \
	  $(NODE_BIN)/nyc $(COVER_OPTS) \
	    $(NODE_BIN)/mocha $(MOCHA_OPTS) $(TARGET_PATH)/test.js)

test-cover: ## run mocha unit tests with coverage reports
test-cover: test-check
	sed -i $(TARGET_PATH)/coverage/lcov.info \
		-e '/external ".*"$$/,/end_of_record/d' \
		-e '/ sync$$/,/end_of_record/d' \
		-e '/test sync/,/end_of_record/d' \
		-e '/node_modules/,/end_of_record/d' \
		-e '/bootstrap$$/,/end_of_record/d' \
		-e '/universalModuleDefinition/,/end_of_record/d'
	sed -n '/^SF/,$$p' -i $(TARGET_PATH)/coverage/lcov.info
	sed '1s;^;TN:\n;' -i $(TARGET_PATH)/coverage/lcov.info

test-watch:
	$(NODE_BIN)/nyc $(COVER_OPTS) $(NODE_BIN)/mocha $(MOCHA_OPTS) --watch $(TARGET_PATH)/test-bundle.js

yarn-install: ## install dependencies from package and lock file
	yarn

yarn-update: ## check yarn for outdated packages
	yarn upgrade-interactive --latest

# release targets
git-push: ## push to both gitlab and github (this assumes you have both remotes set up)
	git push $(GIT_OPTIONS) github $(GIT_BRANCH)
	git push $(GIT_OPTIONS) gitlab $(GIT_BRANCH)

# from https://gist.github.com/amitchhajer/4461043#gistcomment-2349917
git-stats: ## print git contributor line counts (approx, for fun)
	git ls-files | while read f; do git blame -w -M -C -C --line-porcelain "$$f" |\
		grep -I '^author '; done | sort -f | uniq -ic | sort -n

license-check: ## check license status
	licensed cache
	licensed status

release: ## create a release
	$(NODE_BIN)/standard-version --sign $(RELEASE_OPTS)
	GIT_OPTIONS=--tags $(MAKE) git-push

release-dry: ## test creating a release
	$(NODE_BIN)/standard-version --sign $(RELEASE_OPTS) --dry-run

upload-climate:
	cc-test-reporter format-coverage -t lcov -o $(TARGET_PATH)/coverage/codeclimate.json -p $(ROOT_PATH) $(TARGET_PATH)/coverage/lcov.info
	cc-test-reporter upload-coverage --debug -i $(TARGET_PATH)/coverage/codeclimate.json -r "$(shell echo "${CODECLIMATE_SECRET}" | base64 -d)"

upload-codecov:
	codecov --disable=gcov --file=$(TARGET_PATH)/coverage/lcov.info --token=$(shell echo "${CODECOV_SECRET}" | base64 -d)

# run targets
run-config-test: ## run the bot to test the config
	ISOLEX_HOME=$(ROOT_PATH)/docs node $(TARGET_MAIN) --test

run-docker: ## run the bot inside a docker container
	docker run --rm --env-file ${HOME}/.isolex.env -v $(ROOT_PATH)/docs:/app/docs:ro \
		$(DOCKER_IMAGE) --config-name 'isolex.yml' --config-path '/app/docs'

run-terminal: ## run the bot in a terminal
	ISOLEX_HOME=$(ROOT_PATH)/docs node $(TARGET_MAIN) --config-name 'isolex.yml'

run-bunyan: ## run the bot with bunyan logs
	$(MAKE) run-terminal | $(NODE_BIN)/bunyan --strict

pid-stop:
	kill --signal TERM $(shell cat "$(TARGET_PATH)/isolex.pid")

pid-reload:
	kill --signal HUP $(shell cat "$(TARGET_PATH)/isolex.pid")

pid-reset:
	kill --signal INT $(shell cat "$(TARGET_PATH)/isolex.pid")
