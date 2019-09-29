export NODE_OPTIONS ?= --max-old-space-size=5500

MOCHA_LONG_OPTS := $(MOCHA_OPTS) --timeout 5000

SHELL := bash

ci: build test-env

local: build test-env run-terminal

test-env:
	( export ISOLEX_HOME=$(ROOT_PATH)/docs; \
	source $${ISOLEX_HOME}/isolex.env; \
	$(NODE_BIN)/nyc $(COVER_OPTS) \
	  $(NODE_BIN)/mocha $(MOCHA_LONG_OPTS) $(TARGET_PATH)/test.js)

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


