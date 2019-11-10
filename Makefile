# Git
export GIT_BRANCH ?= $(shell git rev-parse --abbrev-ref HEAD)
export GIT_COMMIT ?= $(shell git rev-parse HEAD)
export GIT_OPTIONS ?=
export GIT_REMOTES ?= $(shell git remote -v | awk '{ print $1; }' | sort | uniq)
export GIT_TAG ?= $(shell git tag -l --points-at HEAD | head -1)

# Paths
# resolve the makefile's path and directory, from https://stackoverflow.com/a/18137056
export MAKE_PATH		?= $(abspath $(lastword $(MAKEFILE_LIST)))
export ROOT_PATH		?= $(dir $(MAKE_PATH))
export CONFIG_PATH 	?= $(ROOT_PATH)/config
export DOCS_PATH	  ?= $(ROOT_PATH)/docs
export SCRIPT_PATH 	?= $(ROOT_PATH)/scripts
export SOURCE_PATH 	?= $(ROOT_PATH)/src
export TARGET_PATH	?= $(ROOT_PATH)/out
export TARGET_LOG		?= $(TARGET_PATH)/make.log
export TARGET_MAIN 	?= $(TARGET_PATH)/index.js
export TEST_PATH		?= $(ROOT_PATH)/test
export VENDOR_PATH	?= $(ROOT_PATH)/vendor

# CI
export CI_COMMIT_REF_SLUG ?= $(GIT_BRANCH)
export CI_COMMIT_SHA ?= $(GIT_COMMIT)
export CI_COMMIT_TAG ?= $(GIT_TAG)
export CI_ENVIRONMENT_SLUG ?= local
export CI_JOB_ID ?= 0
export CI_PROJECT_PATH ?= $(shell ROOT_PATH=$(ROOT_PATH) ${SCRIPT_PATH}/ci-project-path.sh)
export CI_RUNNER_DESCRIPTION ?= $(shell hostname)
export CI_RUNNER_ID ?= $(shell hostname)
export CI_RUNNER_VERSION ?= 0.0.0

# Debug
export DEBUG_BIND ?= 127.0.0.1
export DEBUG_PORT ?= 9229

# Versions
export NODE_VERSION		:= $(shell node -v || echo "none")
export RUNNER_VERSION  := $(CI_RUNNER_VERSION)


# Node options
NODE_BIN := $(ROOT_PATH)/node_modules/.bin
NODE_CMD ?= $(shell env node)
NODE_DEBUG ?= --inspect-brk=$(DEBUG_BIND):$(DEBUG_PORT) --nolazy
NODE_INFO := $(shell node -v)

# Tool options
COVER_OPTS	?= --reporter=lcov --reporter=text-summary --reporter=html --report-dir="$(TARGET_PATH)/coverage" --exclude-after-remap
MOCHA_OPTS  ?= --check-leaks --colors --sort --ui bdd
RELEASE_OPTS ?= --commit-all

.PHONY: all clean clean-deps clean-target configure help todo
.PHONY: build build-bundle build-docs build-image test test-check test-cover test-watch
.PHONY: yarn-install yarn-upgrade git-push git-stats license-check release release-dry upload-climate upload-codecov

all: build test ## builds, bundles, and tests the application
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
	sed -i '1s;^;#! /usr/bin/env node\n\n;' $(TARGET_PATH)/index.js

build-docs: ## generate html docs
	$(NODE_BIN)/api-extractor run --config $(CONFIG_PATH)/api-extractor.json --local -v
	$(NODE_BIN)/api-documenter markdown -i $(TARGET_PATH)/api -o $(DOCS_PATH)/api

build-image: ## build a docker image
	$(SCRIPT_PATH)/docker-build.sh --push

test: ## run mocha unit tests
test: test-cover

test-check: ## run mocha unit tests with coverage reports
	$(NODE_BIN)/nyc $(COVER_OPTS) $(NODE_BIN)/mocha $(MOCHA_OPTS) $(TARGET_PATH)/test.js

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

yarn-global: ## install bundle as a global tool
	yarn global add file:$(ROOT_PATH)

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

include $(shell find $(ROOT_PATH) -name '*.mk' | grep -v node_modules)
