# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.6.0"></a>
# [0.6.0](https://github.com/ssube/isolex/compare/v0.5.0...v0.6.0) (2018-12-25)


### Bug Fixes

* add toJSON to role entity, init role repo in user ctrl ([a1894ae](https://github.com/ssube/isolex/commit/a1894ae))
* append config name when loading from env root ([b9999e1](https://github.com/ssube/isolex/commit/b9999e1))
* await response when notifying bot of lifecycle events ([f1bd70c](https://github.com/ssube/isolex/commit/f1bd70c))
* be consistent about grants naming ([eece9d0](https://github.com/ssube/isolex/commit/eece9d0))
* clock should return whole seconds ([b4c9f10](https://github.com/ssube/isolex/commit/b4c9f10))
* completion for lex parser ([#54](https://github.com/ssube/isolex/issues/54)) ([d199ece](https://github.com/ssube/isolex/commit/d199ece))
* convert camel case lex intents to kebab case nouns ([#75](https://github.com/ssube/isolex/issues/75)) ([ca2e198](https://github.com/ssube/isolex/commit/ca2e198))
* ensure all express listener endpoints are registered ([902c6d1](https://github.com/ssube/isolex/commit/902c6d1))
* inject clock into listeners, remove undefined log msg ([e27c237](https://github.com/ssube/isolex/commit/e27c237))
* learn ctrl, split parser, add to ref config ([98e86b9](https://github.com/ssube/isolex/commit/98e86b9))
* lex parser splits intent ([#54](https://github.com/ssube/isolex/issues/54)) ([3244bd0](https://github.com/ssube/isolex/commit/3244bd0))
* load ajv schema as json, wrap and validate defs ([3cb24f4](https://github.com/ssube/isolex/commit/3cb24f4))
* nest checklist within user filter ([17767ed](https://github.com/ssube/isolex/commit/17767ed))
* reset prometheus metrics on signal ([bd50d76](https://github.com/ssube/isolex/commit/bd50d76))
* support hyphenated nouns in lex parser ([40acedc](https://github.com/ssube/isolex/commit/40acedc))
* use arg mapper logic in echo parser ([f4d8b44](https://github.com/ssube/isolex/commit/f4d8b44))


### Features

* add clock to service options ([#45](https://github.com/ssube/isolex/issues/45)) ([30c0047](https://github.com/ssube/isolex/commit/30c0047))
* add join to session ctrl ([#50](https://github.com/ssube/isolex/issues/50)) ([d61cda3](https://github.com/ssube/isolex/commit/d61cda3))
* add token reset as join:delete ([#50](https://github.com/ssube/isolex/issues/50)) ([8da0341](https://github.com/ssube/isolex/commit/8da0341))
* close and merge github PRs ([#72](https://github.com/ssube/isolex/issues/72)) ([f1508cc](https://github.com/ssube/isolex/commit/f1508cc))
* fix up time ctrl and add to ref config ([8e6828c](https://github.com/ssube/isolex/commit/8e6828c))
* get verb for github PR ctrl ([132e24a](https://github.com/ssube/isolex/commit/132e24a))
* github PR controller ([f65e1a2](https://github.com/ssube/isolex/commit/f65e1a2))
* initial PR ctrl ([#72](https://github.com/ssube/isolex/issues/72)) ([5c4f2b3](https://github.com/ssube/isolex/commit/5c4f2b3))
* inject jsonpath and math deps ([264015c](https://github.com/ssube/isolex/commit/264015c))
* inject schema, leverage prototype injection ([0898cd7](https://github.com/ssube/isolex/commit/0898cd7))
* lifecycle events for bot, svcs ([#16](https://github.com/ssube/isolex/issues/16)) ([2d4e650](https://github.com/ssube/isolex/commit/2d4e650))
* move named-args data to a shared class/config stanza ([f581506](https://github.com/ssube/isolex/commit/f581506))
* relative includes for config ([#19](https://github.com/ssube/isolex/issues/19)) ([4a4e444](https://github.com/ssube/isolex/commit/4a4e444))
* schemas in every service, run with and validate reference config ([26c5d38](https://github.com/ssube/isolex/commit/26c5d38))
* search for config without dot prefix ([4b51692](https://github.com/ssube/isolex/commit/4b51692))
* turn keyword into a command fragment ([#67](https://github.com/ssube/isolex/issues/67)) ([2337d9f](https://github.com/ssube/isolex/commit/2337d9f))
* validate config after parsing ([#13](https://github.com/ssube/isolex/issues/13)) ([b7ef1ad](https://github.com/ssube/isolex/commit/b7ef1ad))


### BREAKING CHANGES

* services must get jsonpath/mathjs instances via DI
* replaces the keyword table (renames old table)



<a name="0.5.0"></a>
# [0.5.0](https://github.com/ssube/isolex/compare/v0.4.0...v0.5.0) (2018-12-16)


### Bug Fixes

* auth ctrl should issue tokens to user id, not listener uid ([790dcb1](https://github.com/ssube/isolex/commit/790dcb1))
* descriptive errors for config types ([#25](https://github.com/ssube/isolex/issues/25)) ([03cb84a](https://github.com/ssube/isolex/commit/03cb84a))
* express listener checks token auth for graph endpoints ([17b03e7](https://github.com/ssube/isolex/commit/17b03e7))
* get sed ctrl working, add ref config ([6cae297](https://github.com/ssube/isolex/commit/6cae297))
* list tokens belonging to the current user ([36ba2f9](https://github.com/ssube/isolex/commit/36ba2f9))
* merge completion data, remove last emit refs ([7ef4a18](https://github.com/ssube/isolex/commit/7ef4a18))
* register fragment migration, attach parser/target to context, move ctrl reply to method ([ceb375e](https://github.com/ssube/isolex/commit/ceb375e))
* save fragment data, route completions correctly ([b7d1bea](https://github.com/ssube/isolex/commit/b7d1bea))


### Features

* add permissions to context and token ([#34](https://github.com/ssube/isolex/issues/34)) ([3e7c41b](https://github.com/ssube/isolex/commit/3e7c41b))
* add tokens to auth ctrl, sign/save/issue ([#33](https://github.com/ssube/isolex/issues/33)) ([64423d0](https://github.com/ssube/isolex/commit/64423d0))
* auth ctrl can delete tokens ([a955bbc](https://github.com/ssube/isolex/commit/a955bbc))
* auth ctrl can verify text tokens, fix time claims ([9975ac9](https://github.com/ssube/isolex/commit/9975ac9))
* auth ctrl config for tokens ([39b7d41](https://github.com/ssube/isolex/commit/39b7d41))
* auth ctrl handles roles, permissions; custom user repository ([8eec9a4](https://github.com/ssube/isolex/commit/8eec9a4))
* fetch msg on slack reaction ([#27](https://github.com/ssube/isolex/issues/27)) ([8866a7e](https://github.com/ssube/isolex/commit/8866a7e))
* list permissions (query trie), print roles with user ([5597e99](https://github.com/ssube/isolex/commit/5597e99))
* more detailed event metrics from bot ([3bca055](https://github.com/ssube/isolex/commit/3bca055))
* programmatic graph schema ([#46](https://github.com/ssube/isolex/issues/46)) ([2f63b7d](https://github.com/ssube/isolex/commit/2f63b7d))
* session support for slack listener ([a582b8f](https://github.com/ssube/isolex/commit/a582b8f))


### lint

* break up auth controller ([a717ced](https://github.com/ssube/isolex/commit/a717ced))


### BREAKING CHANGES

* the auth controller has been split into the session,
token, and user controllers



<a name="0.4.0"></a>
# [0.4.0](https://github.com/ssube/isolex/compare/v0.3.0...v0.4.0) (2018-12-09)


### Bug Fixes

* clean up match rules and map parser ([4bcb104](https://github.com/ssube/isolex/commit/4bcb104))
* make max value for randoms optional ([0c3a59f](https://github.com/ssube/isolex/commit/0c3a59f))
* save auth entities correctly ([f503bad](https://github.com/ssube/isolex/commit/f503bad))


### Features

* context is entity with services, replace migrations ([dc0b6b1](https://github.com/ssube/isolex/commit/dc0b6b1))
* make graph and metrics endpoints configurable ([40b02c1](https://github.com/ssube/isolex/commit/40b02c1))
* metrics and logging in discord listener, metrics live outside of bot ([7d77446](https://github.com/ssube/isolex/commit/7d77446))
* move service locator from bot to DI module ([#37](https://github.com/ssube/isolex/issues/37), fixes [#43](https://github.com/ssube/isolex/issues/43)) ([84ea022](https://github.com/ssube/isolex/commit/84ea022))
* replace tags with matches across parsers ([eaba907](https://github.com/ssube/isolex/commit/eaba907))
* rule matcher can remove matches, no implicit string values ([56b571d](https://github.com/ssube/isolex/commit/56b571d))


### BREAKING CHANGES

* database must be reset and migrations run again



<a name="0.3.0"></a>
# 0.3.0 (2018-12-06)
