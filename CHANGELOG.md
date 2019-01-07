# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.7.0"></a>
# [0.7.0](https://github.com/ssube/isolex/compare/v0.6.0...v0.7.0) (2019-01-07)


### Bug Fixes

* add template compiler to bot svc options, remove any from svc bind helper ([245b2a5](https://github.com/ssube/isolex/commit/245b2a5))
* begin using std error replies ([450d324](https://github.com/ssube/isolex/commit/450d324))
* change transform signature to avoid msg wrapper ([#84](https://github.com/ssube/isolex/issues/84)) ([69cfdbd](https://github.com/ssube/isolex/commit/69cfdbd))
* check even more grants ([#97](https://github.com/ssube/isolex/issues/97)) ([d248aaa](https://github.com/ssube/isolex/commit/d248aaa))
* check grants for discord listener ([2f26ce5](https://github.com/ssube/isolex/commit/2f26ce5))
* check grants for learn ctrl ([#97](https://github.com/ssube/isolex/issues/97)) ([7e60a9f](https://github.com/ssube/isolex/commit/7e60a9f))
* check grants in completion ctrl, user ctrl ([9bf0c54](https://github.com/ssube/isolex/commit/9bf0c54))
* check injected request option types ([#95](https://github.com/ssube/isolex/issues/95)) ([ac10229](https://github.com/ssube/isolex/commit/ac10229))
* clarify verbs ([#17](https://github.com/ssube/isolex/issues/17)), doc command data and collection ([#96](https://github.com/ssube/isolex/issues/96)) ([d6571b9](https://github.com/ssube/isolex/commit/d6571b9))
* combine ctrl handler noun/verb decorators ([0380b8b](https://github.com/ssube/isolex/commit/0380b8b))
* correct overly short token expiration timestamps ([d829d65](https://github.com/ssube/isolex/commit/d829d65))
* correct request options type, use injected request in gitlab client ([dbf8b29](https://github.com/ssube/isolex/commit/dbf8b29))
* default config message reactions ([d4eb853](https://github.com/ssube/isolex/commit/d4eb853))
* enable strict properties, begin fixing errors ([ad0f39c](https://github.com/ssube/isolex/commit/ad0f39c))
* enforce more grants ([b8d62ae](https://github.com/ssube/isolex/commit/b8d62ae))
* ensure handler errors are caught ([bff44b0](https://github.com/ssube/isolex/commit/bff44b0))
* escape outgoing messages in listener ([2c2c2c4](https://github.com/ssube/isolex/commit/2c2c2c4))
* handle gitlab request errors, correct pipeline create endpoint ([ab21533](https://github.com/ssube/isolex/commit/ab21533))
* handle old tokens better ([f385a8e](https://github.com/ssube/isolex/commit/f385a8e))
* ignore msg source when listener checks to send ([#87](https://github.com/ssube/isolex/issues/87)) ([b72c004](https://github.com/ssube/isolex/commit/b72c004))
* last few property errors ([acb6bdc](https://github.com/ssube/isolex/commit/acb6bdc))
* listeners should call super lifecycle methods ([6cc67e8](https://github.com/ssube/isolex/commit/6cc67e8))
* make injected svcs optional, assert existence before use ([#110](https://github.com/ssube/isolex/issues/110)) ([b73d42a](https://github.com/ssube/isolex/commit/b73d42a))
* move k8s ctrl to k8s/core ([#32](https://github.com/ssube/isolex/issues/32)) ([637c5e2](https://github.com/ssube/isolex/commit/637c5e2))
* notify services of tick event ([#88](https://github.com/ssube/isolex/issues/88)) ([99c81de](https://github.com/ssube/isolex/commit/99c81de))
* random ctrl, include in ref config ([2959055](https://github.com/ssube/isolex/commit/2959055))
* remove dom from tsconfig, fix resulting errors ([b3afa71](https://github.com/ssube/isolex/commit/b3afa71))
* remove last few handle methods, update docs ([915df8a](https://github.com/ssube/isolex/commit/915df8a))
* rename session ctrl to account, join noun to account ([51f5f34](https://github.com/ssube/isolex/commit/51f5f34))
* rename zeit to time throughout for clarity ([2aad519](https://github.com/ssube/isolex/commit/2aad519))
* replace negated isnil with semantic predicate ([93b2807](https://github.com/ssube/isolex/commit/93b2807))
* restore entity labels ([d8bb90f](https://github.com/ssube/isolex/commit/d8bb90f))
* set default filters/transforms in schema, fix conditionals ([c7adc2f](https://github.com/ssube/isolex/commit/c7adc2f))
* set empty default for ctrl transforms, conditionals ([e15264c](https://github.com/ssube/isolex/commit/e15264c))
* strict props and copy ctors all around ([8242979](https://github.com/ssube/isolex/commit/8242979))
* support and test regexp keyword negation ([#92](https://github.com/ssube/isolex/issues/92)) ([f060210](https://github.com/ssube/isolex/commit/f060210))
* switch injected request to use request-promise-native ([9d0f666](https://github.com/ssube/isolex/commit/9d0f666))
* tick should not have empty id, save interval context, discord listener target ([f32fb88](https://github.com/ssube/isolex/commit/f32fb88))
* translate controllers, ctd ([f8c8160](https://github.com/ssube/isolex/commit/f8c8160))
* translate errors, ctrl replies ([#17](https://github.com/ssube/isolex/issues/17)) ([2546c5f](https://github.com/ssube/isolex/commit/2546c5f))
* update dice ctrl for cmd data ([279c7a3](https://github.com/ssube/isolex/commit/279c7a3))
* update k8s ctrl to use named data and std switch-switch handlers ([9003e5b](https://github.com/ssube/isolex/commit/9003e5b))
* update learn ctrl to use named data ([4a53d4a](https://github.com/ssube/isolex/commit/4a53d4a))
* use a real type for template and transform scopes ([520cda0](https://github.com/ssube/isolex/commit/520cda0))
* use injected jsonpath in flatten transform ([901046f](https://github.com/ssube/isolex/commit/901046f))
* use named data for dice ctrl ([b7292b1](https://github.com/ssube/isolex/commit/b7292b1))
* use named data in math ctrl, add to getting started ([379d20a](https://github.com/ssube/isolex/commit/379d20a))
* use named data in sed ctrl, include in ref config ([605e80e](https://github.com/ssube/isolex/commit/605e80e))
* use symbols for all injected bot svcs ([#110](https://github.com/ssube/isolex/issues/110)) ([ba965da](https://github.com/ssube/isolex/commit/ba965da))
* use symbols for injected base svcs ([#110](https://github.com/ssube/isolex/issues/110)) ([acce966](https://github.com/ssube/isolex/commit/acce966))
* wrap single-item gitlab responses to keep templates consistent ([30b125b](https://github.com/ssube/isolex/commit/30b125b))


### Features

* add default target to completion ctrl ([#87](https://github.com/ssube/isolex/issues/87)) ([3ad5350](https://github.com/ssube/isolex/commit/3ad5350))
* add entity timestamps, completion ctrl supports last fragment per user ([3eeb7be](https://github.com/ssube/isolex/commit/3eeb7be))
* add filters to base service ([#83](https://github.com/ssube/isolex/issues/83)) ([f582f15](https://github.com/ssube/isolex/commit/f582f15))
* add filters to transforms ([#80](https://github.com/ssube/isolex/issues/80)) ([34475a6](https://github.com/ssube/isolex/commit/34475a6))
* add help text for most ctrls ([#17](https://github.com/ssube/isolex/issues/17)) ([4e9d35d](https://github.com/ssube/isolex/commit/4e9d35d))
* add interval services ([d2374b0](https://github.com/ssube/isolex/commit/d2374b0))
* add interval services ([#88](https://github.com/ssube/isolex/issues/88)) ([5fa8a5e](https://github.com/ssube/isolex/commit/5fa8a5e))
* add locale to injected svcs ([#17](https://github.com/ssube/isolex/issues/17)) ([51dc323](https://github.com/ssube/isolex/commit/51dc323))
* add target listener to express listener ([#90](https://github.com/ssube/isolex/issues/90)) ([b3a5fb7](https://github.com/ssube/isolex/commit/b3a5fb7))
* add type coercion to collection helper ([#96](https://github.com/ssube/isolex/issues/96)) ([33b8b6e](https://github.com/ssube/isolex/commit/33b8b6e))
* bind-by-kind (kebab case) helper for modules ([e375334](https://github.com/ssube/isolex/commit/e375334))
* cancel and retry gitlab pipelines ([27854fd](https://github.com/ssube/isolex/commit/27854fd))
* collect cmd data all at once ([a0969d0](https://github.com/ssube/isolex/commit/a0969d0))
* controller error reply helper ([90d070b](https://github.com/ssube/isolex/commit/90d070b))
* controller method decorators ([#100](https://github.com/ssube/isolex/issues/100)) ([e0121f7](https://github.com/ssube/isolex/commit/e0121f7))
* create configurable root user ([#98](https://github.com/ssube/isolex/issues/98)) ([cb24214](https://github.com/ssube/isolex/commit/cb24214))
* enable array coercion for schemas, use schema while collecting cmd data ([#96](https://github.com/ssube/isolex/issues/96)) ([d3d52d8](https://github.com/ssube/isolex/commit/d3d52d8))
* enable schema defaults and remove extra props, fix schema for reference config ([8a2ef6f](https://github.com/ssube/isolex/commit/8a2ef6f))
* get config name and path from cli args ([8d8e003](https://github.com/ssube/isolex/commit/8d8e003))
* gitlab CI ctrl ([be4ca4f](https://github.com/ssube/isolex/commit/be4ca4f))
* gitlab ci ctrl, filters on all svcs ([7a2588e](https://github.com/ssube/isolex/commit/7a2588e))
* help and i18n ([d9a7261](https://github.com/ssube/isolex/commit/d9a7261))
* helper to collect data or prompt for completion ([#96](https://github.com/ssube/isolex/issues/96)) ([1e8ba01](https://github.com/ssube/isolex/commit/1e8ba01))
* make anonymous join a config option ([c53a8f4](https://github.com/ssube/isolex/commit/c53a8f4))
* make completion fragments user-specific ([f636374](https://github.com/ssube/isolex/commit/f636374))
* message interval has and runs transforms ([#91](https://github.com/ssube/isolex/issues/91)) ([7eaec2c](https://github.com/ssube/isolex/commit/7eaec2c))
* message interval runs transforms ([d20e791](https://github.com/ssube/isolex/commit/d20e791))
* metrics interval ([#94](https://github.com/ssube/isolex/issues/94)) ([2d8872f](https://github.com/ssube/isolex/commit/2d8872f))
* remove fragments after completion ([#85](https://github.com/ssube/isolex/issues/85)) ([c96e1e2](https://github.com/ssube/isolex/commit/c96e1e2))
* schema regexp keyword with flag check ([#92](https://github.com/ssube/isolex/issues/92)) ([cb75b98](https://github.com/ssube/isolex/commit/cb75b98))
* send msg to ctx target ([#87](https://github.com/ssube/isolex/issues/87)), use target in intervals ([#88](https://github.com/ssube/isolex/issues/88)) ([48d45f2](https://github.com/ssube/isolex/commit/48d45f2))
* tick entity for interval to consume, add intervals to schema ([628d91b](https://github.com/ssube/isolex/commit/628d91b))



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
