export NODE_OPTIONS ?= --max-old-space-size=8000

MOCHA_LONG_OPTS := $(MOCHA_OPTS) --timeout 60000 --retries 3 --forbid-only

SHELL := bash

ci: build test-env

local: build test-env

test-env:
	( export ISOLEX_HOME=$(ROOT_PATH)/docs; \
	source $${ISOLEX_HOME}/isolex.env; \
	rm $(ROOT_PATH)/{isolex,test}.pid; \
	rm $(TARGET_PATH)/test.pid; \
	rm $(TARGET_PATH)/test.db; \
	$(NODE_BIN)/nyc $(COVER_OPTS) \
	  $(NODE_BIN)/mocha $(MOCHA_LONG_OPTS) $(TARGET_PATH)/test.js)

# run targets
run: run-terminal

run-config-test: ## run the bot to test the config
	ISOLEX_HOME=$(ROOT_PATH)/docs node $(TARGET_MAIN) --test

run-docker: ## run the bot inside a docker container
	docker run --rm --env-file ${HOME}/.isolex.env -v $(ROOT_PATH)/docs:/app/docs:ro \
	  $(DOCKER_IMAGE) --config-name 'isolex.yml' --config-path '/app/docs'

run-terminal: ## run the bot in a terminal
	ISOLEX_HOME=$(ROOT_PATH)/docs node $(TARGET_MAIN) --config-name 'isolex.yml'

run-bunyan: ## run the bot with bunyan logs
	$(MAKE) run-terminal | $(NODE_BIN)/bunyan --strict

# debug targets
debug-terminal:  ## run the bot in a terminal and wait for a debugger
	ISOLEX_HOME=$(ROOT_PATH)/docs node $(NODE_DEBUG) $(TARGET_MAIN) --config-name 'isolex.yml'

debug-bunyan: ## run the bot with bunyan logs and wait for a debugger
	$(MAKE) debug-terminal | $(NODE_BIN)/bunyan --strict

debug-test:
	( export ISOLEX_HOME=$(ROOT_PATH)/docs; \
	source $${ISOLEX_HOME}/isolex.env; \
	rm $(ROOT_PATH)/{isolex,test}.pid; \
	rm $(TARGET_PATH)/test.pid; \
	rm $(TARGET_PATH)/test.db; \
	node $(NODE_DEBUG) \
		$(NODE_BIN)/nyc $(COVER_OPTS) \
		$(NODE_BIN)/mocha $(MOCHA_LONG_OPTS) $(TARGET_PATH)/test.js)

# pid targets
pid-stop: ## stop the bot at the target pid
	kill -15 $(shell cat "$(TARGET_PATH)/isolex.pid")

pid-reload: ## reload the bot at the target pid
	kill -1  $(shell cat "$(TARGET_PATH)/isolex.pid")

pid-reset: ## reset the bot at the target pid
	kill -2 $(shell cat "$(TARGET_PATH)/isolex.pid")


