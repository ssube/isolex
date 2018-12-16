# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
