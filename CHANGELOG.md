# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.10.1](https://github.com/ssube/isolex/compare/v0.10.0...v0.10.1) (2020-03-21)


### Features

* **generator:** make metrics timeout configurable ([d1b15ea](https://github.com/ssube/isolex/commit/d1b15ea6b96ad9704f70ebd6f47aa45284737204))
* add command args to shell filter and transform ([7ab9377](https://github.com/ssube/isolex/commit/7ab937744aa6ae390f2144682b9390e6b6e33fff))
* **filter:** add shell exec filter ([6260946](https://github.com/ssube/isolex/commit/62609469338ad13814861d6f79413667b7852f6b))
* **scripts:** add github status check script for shell filter ([36a7e20](https://github.com/ssube/isolex/commit/36a7e203f68bbf58734d30a630dde1d06c69cc89))
* **scripts:** add github status event filter script ([f8e2059](https://github.com/ssube/isolex/commit/f8e205951a26f46cbe3b664cd5efbede42a24404))
* **transform:** add shell transform ([4d1701f](https://github.com/ssube/isolex/commit/4d1701fc9ba8c1137f96a6871c9c6e62a7b35f3e))


### Bug Fixes

* uuid lib import ([507fe0a](https://github.com/ssube/isolex/commit/507fe0a95ee32f60a75e5abeac62fc7b6f782a73))
* **controller:** make collected value type explicit ([300048b](https://github.com/ssube/isolex/commit/300048b2bbec7707e85020d879a03be9afe8d61a))
* scoped github client imports ([d6002bc](https://github.com/ssube/isolex/commit/d6002bc164d60f04642f50b642a61607da4abd85))
* specialize counters to string, remove metrics interval ([9db18f5](https://github.com/ssube/isolex/commit/9db18f5be2821eae2322d7212880f9b78afed9c2))
* **build:** add eslint peer dep ([822308b](https://github.com/ssube/isolex/commit/822308b037e1e2b644e150fac59a4c0d342b4546))
* **build:** bump nyc memory limit to 8GB ([c4d6444](https://github.com/ssube/isolex/commit/c4d644483e6a76d92ea07ca8c72d5f150ac6cb1f))
* **build:** make got package external to fix electron dep ([1c62de1](https://github.com/ssube/isolex/commit/1c62de1d56d7f09fcbee161366d3e5e0c3d7f81c))
* **build:** make kubernetes client external ([4cd81b1](https://github.com/ssube/isolex/commit/4cd81b1bad69bee4744e6edb57462032ce75b1de))
* **build:** update sonarcloud coverage options ([04cb5d4](https://github.com/ssube/isolex/commit/04cb5d48f9a8a3c8f218002fa8d57c988a42f51d))
* **container:** add bash and jq for shell scripts ([318901e](https://github.com/ssube/isolex/commit/318901e2c3d612c93bb947a0de76bd17d4711166))
* **docs:** explain shell filter ([7e4dd64](https://github.com/ssube/isolex/commit/7e4dd64ca876834de6966d43c3d63a6bd9446a9c))
* **filter:** drop value when child emits error message ([b5ff736](https://github.com/ssube/isolex/commit/b5ff736d9ed847da535768f85bf5800bb6a123cd))
* **filter:** end line after shell payload ([0975d08](https://github.com/ssube/isolex/commit/0975d080259686003254c529c2105eddc54c6858))
* **filter:** improve logging in shell filter ([0419d5b](https://github.com/ssube/isolex/commit/0419d5b042e4d233ad27b51bb812c590b454027f))
* **filter:** reject value when child exits non-0 ([5f88aeb](https://github.com/ssube/isolex/commit/5f88aebad75f211fdabd6de058db241d7f292adc))
* **filter:** switch to spawn for shell commands ([3945ec6](https://github.com/ssube/isolex/commit/3945ec6f10dc6ad1c9fdcc2bc10e8f6fb2c29229))
* **filter:** use command option from child config stanza ([8205feb](https://github.com/ssube/isolex/commit/8205febf6d7769d83fb4b273a852c5472d02bcdd))
* **filter:** use error output from child process as inner error ([607df08](https://github.com/ssube/isolex/commit/607df08b2a5a32663e8e81f3329662dd5769b23d))
* **filter:** use name/value pairs for env, begin testing ([7fd5de3](https://github.com/ssube/isolex/commit/7fd5de36d3839d8ccec1ad5efd179a58a548333f))
* **scripts:** filter PR approval by author ([21020aa](https://github.com/ssube/isolex/commit/21020aa6969a41cbc165c5b90813694ec7904cd3))
* **test:** cover error exit status and output ([050cc6f](https://github.com/ssube/isolex/commit/050cc6fe39658ba8343ab313198aa3fd67009d68))
* **test:** cover missing stdin for shell filter ([e7d4b56](https://github.com/ssube/isolex/commit/e7d4b56cc6fb4a97e3accd7def7b4821198dc1d1))
* **test:** cover shell transform, edge cases in shell filter ([b2900c8](https://github.com/ssube/isolex/commit/b2900c8dd3f97a1d6f949aebe4d483f06aff9ff1))
* **utils:** handle error events from child processes ([d32abb1](https://github.com/ssube/isolex/commit/d32abb17f068cea29afb5dd1391ebc87aef3717f))
* add redirects to example controllers ([40ce4ad](https://github.com/ssube/isolex/commit/40ce4add70fc21249f3af069857b05498a2ed0f3))

## [0.10.0](https://github.com/ssube/isolex/compare/v0.9.1...v0.10.0) (2019-11-10)


### ⚠ BREAKING CHANGES

* **bot:** bot will attempt to execute commands with each
controller in turn, rather than stopping after the first passing
check. This allows workflows to branch off and coexist with chat.

### Bug Fixes

* **build:** add package keywords ([5a2cac4](https://github.com/ssube/isolex/commit/5a2cac4))
* **build:** include rollup cache in gitlab cache ([5a5362c](https://github.com/ssube/isolex/commit/5a5362c))
* **build:** run node from path ([dc64d9f](https://github.com/ssube/isolex/commit/dc64d9f))
* bind with type where extra options are required ([ccd1c1d](https://github.com/ssube/isolex/commit/ccd1c1d))
* **build:** replace tslint with eslint in codeclimate ([29c9175](https://github.com/ssube/isolex/commit/29c9175))
* **docs:** add example command controller ([668e5c5](https://github.com/ssube/isolex/commit/668e5c5))
* **docs:** add ToC ([2a087fa](https://github.com/ssube/isolex/commit/2a087fa))
* **docs:** filter metadata out of PR results ([68c335c](https://github.com/ssube/isolex/commit/68c335c))
* **docs:** include project name in gitlab push message ([fa8f89f](https://github.com/ssube/isolex/commit/fa8f89f))
* **docs:** make entities more visible in vector ([3e0ac70](https://github.com/ssube/isolex/commit/3e0ac70))
* **docs:** note side effects in arch vector ([79d0b94](https://github.com/ssube/isolex/commit/79d0b94))
* **docs:** switch to codecov badge ([0e078ad](https://github.com/ssube/isolex/commit/0e078ad))
* **docs:** update roadmap ([fe3b20f](https://github.com/ssube/isolex/commit/fe3b20f))
* **docs:** update roadmap with ticket numbers, tweak arch layout ([ef2d2f0](https://github.com/ssube/isolex/commit/ef2d2f0))
* **endpoint/gitlab:** filter build hooks by label ([aac1458](https://github.com/ssube/isolex/commit/aac1458))
* **endpoint/gitlab:** register json parser with other middleware ([202fbd1](https://github.com/ssube/isolex/commit/202fbd1))
* **entity/context:** coalesce default/forced context properties ([3d2adb2](https://github.com/ssube/isolex/commit/3d2adb2))
* **entity/context:** correct redirect stage order ([ea9f5fd](https://github.com/ssube/isolex/commit/ea9f5fd))
* **entity/context:** pass user through redirects ([e6718ce](https://github.com/ssube/isolex/commit/e6718ce))
* **filter:** correctly filter on empty labels (fixes [#561](https://github.com/ssube/isolex/issues/561)) ([bc8fbd1](https://github.com/ssube/isolex/commit/bc8fbd1))
* **github:** shorter PR template ([9fca0ee](https://github.com/ssube/isolex/commit/9fca0ee))
* **interval:** report errors to logger ([317b8b0](https://github.com/ssube/isolex/commit/317b8b0))
* **listener/express:** throw session required error on missing request context ([2675beb](https://github.com/ssube/isolex/commit/2675beb))
* **locale:** update for i18n 19 API ([d1fd497](https://github.com/ssube/isolex/commit/d1fd497))
* **metrics:** namespace service metrics ([30d972c](https://github.com/ssube/isolex/commit/30d972c))
* **schema/graph:** add message reactions to input type ([705c56f](https://github.com/ssube/isolex/commit/705c56f))
* **schema/graph:** correct args on message/service queries ([a68cd88](https://github.com/ssube/isolex/commit/a68cd88))
* **tests:** add missing assertions, bubble ORM connection errors ([eceab17](https://github.com/ssube/isolex/commit/eceab17))
* **tests:** begin covering context redirect helpers ([e4881fd](https://github.com/ssube/isolex/commit/e4881fd))
* **tests:** begin covering user entity ([b1e8540](https://github.com/ssube/isolex/commit/b1e8540))
* **tests:** check sent status from health handlers ([7d4a3f5](https://github.com/ssube/isolex/commit/7d4a3f5))
* **tests:** cover checklist util ([6f8e736](https://github.com/ssube/isolex/commit/6f8e736))
* **tests:** cover command controller happy path ([a0e1434](https://github.com/ssube/isolex/commit/a0e1434))
* **tests:** cover command entity toJSON ([13cfa80](https://github.com/ssube/isolex/commit/13cfa80))
* **tests:** cover command, message intervals ([ba5a1ba](https://github.com/ssube/isolex/commit/ba5a1ba))
* **tests:** cover data entity ([11e942b](https://github.com/ssube/isolex/commit/11e942b))
* **tests:** cover data entity json codec ([f7ab9b9](https://github.com/ssube/isolex/commit/f7ab9b9))
* **tests:** cover entriesOf helper ([073f0aa](https://github.com/ssube/isolex/commit/073f0aa))
* **tests:** cover github token renewal ([6b7e1ba](https://github.com/ssube/isolex/commit/6b7e1ba))
* **tests:** cover grant handlers, clean up mock storage ([96b6f3b](https://github.com/ssube/isolex/commit/96b6f3b))
* **tests:** cover intervals ([d3313a5](https://github.com/ssube/isolex/commit/d3313a5))
* **tests:** cover keyword entity, duplicate service registration ([3e08920](https://github.com/ssube/isolex/commit/3e08920))
* **tests:** cover loopback listener ([dfa8f77](https://github.com/ssube/isolex/commit/dfa8f77))
* **tests:** cover map and array-to-map utils further ([b694fe1](https://github.com/ssube/isolex/commit/b694fe1))
* **tests:** cover math results formatting ([a9e56dc](https://github.com/ssube/isolex/commit/a9e56dc))
* **tests:** cover more of context and message entity ([9ac1092](https://github.com/ssube/isolex/commit/9ac1092))
* **tests:** cover new code in github endpoint and commit controller ([f0fc748](https://github.com/ssube/isolex/commit/f0fc748))
* **tests:** cover new transform helpers ([4354131](https://github.com/ssube/isolex/commit/4354131))
* **tests:** cover regex parser errors ([e85b1b2](https://github.com/ssube/isolex/commit/e85b1b2))
* **tests:** cover start and signal error handler ([ac08431](https://github.com/ssube/isolex/commit/ac08431))
* **tests:** cover token entity, cooldown observable ([3043b17](https://github.com/ssube/isolex/commit/3043b17))
* **tests:** cover transform helpers, gitlab client job list ([e64339a](https://github.com/ssube/isolex/commit/e64339a))
* **tests:** cover trim string helper ([7a2e94c](https://github.com/ssube/isolex/commit/7a2e94c))
* **transform:** check final transforms return type ([1cf1d3b](https://github.com/ssube/isolex/commit/1cf1d3b))
* **transform:** merge transform results ([811a98a](https://github.com/ssube/isolex/commit/811a98a))
* **transform:** resolve transform applicability ([7b2ef32](https://github.com/ssube/isolex/commit/7b2ef32))
* check service-scope grants ([b9f12d1](https://github.com/ssube/isolex/commit/b9f12d1))
* **tests:** cover counter entity ([3660868](https://github.com/ssube/isolex/commit/3660868))
* **tests:** cover debug and graph endpoints ([2a62978](https://github.com/ssube/isolex/commit/2a62978))
* **tests:** cover echo endpoint ([13000da](https://github.com/ssube/isolex/commit/13000da))
* **tests:** cover event interval, inject math into test services ([b0e16be](https://github.com/ssube/isolex/commit/b0e16be))
* **tests:** cover filter helpers ([3333439](https://github.com/ssube/isolex/commit/3333439))
* **tests:** cover filter ignore paths, transform helpers ([a8244c5](https://github.com/ssube/isolex/commit/a8244c5))
* **tests:** cover gitlab endpoint, base parser ([fd4945d](https://github.com/ssube/isolex/commit/fd4945d))
* **tests:** cover gitlab error handling ([6459cae](https://github.com/ssube/isolex/commit/6459cae))
* **tests:** cover metrics interval ([5156461](https://github.com/ssube/isolex/commit/5156461))
* **tests:** cover more gitlab hooks, consolidate middleware ([2e19f1e](https://github.com/ssube/isolex/commit/2e19f1e))
* **tests:** cover more of match utils ([7fea5db](https://github.com/ssube/isolex/commit/7fea5db))
* **tests:** cover request helper ([1c7eeb2](https://github.com/ssube/isolex/commit/1c7eeb2))
* **tests:** cover routes in debug, metrics endpoints ([815d1d6](https://github.com/ssube/isolex/commit/815d1d6))
* **tests:** cover service module list ([a39e5c7](https://github.com/ssube/isolex/commit/a39e5c7))
* **tests:** cover slack logger level methods ([75084c2](https://github.com/ssube/isolex/commit/75084c2))
* **tests:** cover tick and token entities, various error handling branches ([f07a116](https://github.com/ssube/isolex/commit/f07a116))
* **tests:** cover token entity, github client ([4e0f1bb](https://github.com/ssube/isolex/commit/4e0f1bb))
* **tests:** cover user repository, base command ([9e5694d](https://github.com/ssube/isolex/commit/9e5694d))
* **tests:** drop unused services from test config, bump log level to warn ([8513783](https://github.com/ssube/isolex/commit/8513783))
* **tests:** ensure each test has new config, instrument endpoints and listeners further ([f1bcc72](https://github.com/ssube/isolex/commit/f1bcc72))
* **utils/github:** fix navigator leak (fixes [#506](https://github.com/ssube/isolex/issues/506)) ([6e8daf7](https://github.com/ssube/isolex/commit/6e8daf7))
* **utils/template:** pass data on through eq operator ([68280b8](https://github.com/ssube/isolex/commit/68280b8))


### Features

* **build:** add alpine image from template ([7fe0885](https://github.com/ssube/isolex/commit/7fe0885))
* **build:** add target to globally link bin ([4366516](https://github.com/ssube/isolex/commit/4366516))
* **build:** add test debug target ([2b2d4ab](https://github.com/ssube/isolex/commit/2b2d4ab))
* **build:** replace tslint with eslint ([43f23f2](https://github.com/ssube/isolex/commit/43f23f2))
* **controller:** add command execution controller ([#555](https://github.com/ssube/isolex/issues/555)) ([490cda8](https://github.com/ssube/isolex/commit/490cda8))
* **controller/github/commit:** pass project, owner, and ref to transforms ([d8d25e7](https://github.com/ssube/isolex/commit/d8d25e7))
* **deploy:** add k8s service ([2ac0540](https://github.com/ssube/isolex/commit/2ac0540))
* **endpoint:** add github webhook endpoint ([6f58d5d](https://github.com/ssube/isolex/commit/6f58d5d))
* **entity/context:** redirect to source, target, or specific service ([83e899f](https://github.com/ssube/isolex/commit/83e899f))
* replace context/target config with redirect ([#582](https://github.com/ssube/isolex/issues/582)) ([02b7cc3](https://github.com/ssube/isolex/commit/02b7cc3))
* **bot:** dispatch commands to multiple controllers ([848c547](https://github.com/ssube/isolex/commit/848c547))
* **controller:** github check/status controller ([2387943](https://github.com/ssube/isolex/commit/2387943))
* **controller/github:** register commit noun, apply transforms to check/status data ([076b7c7](https://github.com/ssube/isolex/commit/076b7c7))
* **docs:** add github webhook endpoint to express listener ([ac78327](https://github.com/ssube/isolex/commit/ac78327))
* **endpoint:** add health check ([68ca117](https://github.com/ssube/isolex/commit/68ca117))
* **endpoint:** add route decorator ([#513](https://github.com/ssube/isolex/issues/513)) ([5c22283](https://github.com/ssube/isolex/commit/5c22283))
* **endpoint:** make graphql and metrics independent endpoints ([9c95ac2](https://github.com/ssube/isolex/commit/9c95ac2))
* **endpoint/github:** execute pull review and status hooks ([19bd735](https://github.com/ssube/isolex/commit/19bd735))
* **endpoint/github:** parse check run and suite hooks ([a1a8a6a](https://github.com/ssube/isolex/commit/a1a8a6a))
* **endpoint/gitlab:** handle issue and note hooks ([c5fee7a](https://github.com/ssube/isolex/commit/c5fee7a))
* **endpoint/gitlab:** run hooks as configured user ([7d58208](https://github.com/ssube/isolex/commit/7d58208))
* **endpoint/health:** add status body, register with express listener ([729bea6](https://github.com/ssube/isolex/commit/729bea6))
* **generator:** split interval producer from generator service ([e9bfed9](https://github.com/ssube/isolex/commit/e9bfed9))
* **listener:** add loopback listener ([bf21bb0](https://github.com/ssube/isolex/commit/bf21bb0))
* **listener:** instrument discord and slack more ([ba82c7c](https://github.com/ssube/isolex/commit/ba82c7c))
* **listener/loopback:** add default target listener to config ([145b9c1](https://github.com/ssube/isolex/commit/145b9c1))
* **scripts:** add webhook role and users ([75cfbfc](https://github.com/ssube/isolex/commit/75cfbfc))
* **utils/template:** add equality block helper ([00eac2b](https://github.com/ssube/isolex/commit/00eac2b))

### [0.9.1](https://github.com/ssube/isolex/compare/v0.9.0...v0.9.1) (2019-10-05)


### Bug Fixes

* **build:** publish to npmjs.org ([cb5c681](https://github.com/ssube/isolex/commit/cb5c681))

## [0.9.0](https://github.com/ssube/isolex/compare/v0.8.0...v0.9.0) (2019-10-05)


### ⚠ BREAKING CHANGES

* rule keys are now jsonpath expressions, which are
more flexible than the lodash get syntax. Each returned item is
tested using the same rules as before. Simple `key` rules can be
replaced with `$.key` and should behave as before.

### Bug Fixes

* **bot:** stop locale service ([ff7288c](https://github.com/ssube/isolex/commit/ff7288c))
* **build:** add sonar job ([f4d566d](https://github.com/ssube/isolex/commit/f4d566d))
* **build:** ensure tests do not end up in vendor chunk ([d83f00e](https://github.com/ssube/isolex/commit/d83f00e))
* **build:** exclude rollup config from code climate ([b4f89d0](https://github.com/ssube/isolex/commit/b4f89d0))
* **build:** remove test pid ([e896d7f](https://github.com/ssube/isolex/commit/e896d7f))
* **deploy:** add resource limits ([9e727d7](https://github.com/ssube/isolex/commit/9e727d7))
* **docs:** metrics template ([74a37ed](https://github.com/ssube/isolex/commit/74a37ed))
* **docs:** noun help template ([0e1f4cb](https://github.com/ssube/isolex/commit/0e1f4cb))
* **docs:** update weather template for API response with more arrays ([fe426a3](https://github.com/ssube/isolex/commit/fe426a3))
* **lint:** inject logger in base service ([7a9e60c](https://github.com/ssube/isolex/commit/7a9e60c))
* **lint:** tweak code climate method size thresholds ([8c86969](https://github.com/ssube/isolex/commit/8c86969))
* **tests:** cover gitlab client ([ad452c5](https://github.com/ssube/isolex/commit/ad452c5))
* log level enum ([6482756](https://github.com/ssube/isolex/commit/6482756))
* **build:** disallow exclusive tests, bump timeout ([5839337](https://github.com/ssube/isolex/commit/5839337))
* **module:** make logger required in service module ([ed66591](https://github.com/ssube/isolex/commit/ed66591))
* **tests:** begin testing plugin loading, config errors ([6802d8d](https://github.com/ssube/isolex/commit/6802d8d))
* **tests:** begin testing templates ([8656ab2](https://github.com/ssube/isolex/commit/8656ab2))
* **tests:** cover assorted i18n/ORM loggers ([8e5ccc4](https://github.com/ssube/isolex/commit/8e5ccc4))
* **tests:** cover clock dates, fix resulting issues ([d5d076a](https://github.com/ssube/isolex/commit/d5d076a))
* **tests:** cover locale service ([4fac002](https://github.com/ssube/isolex/commit/4fac002))
* **tests:** cover math result formatting ([c2e135c](https://github.com/ssube/isolex/commit/c2e135c))
* **tests:** cover metrics ([9ca9834](https://github.com/ssube/isolex/commit/9ca9834))
* **tests:** cover pairs to map helper ([f530266](https://github.com/ssube/isolex/commit/f530266))
* **tests:** cover random selection of list items ([3ae1cf5](https://github.com/ssube/isolex/commit/3ae1cf5))
* **tests:** cover template compiler ([9347054](https://github.com/ssube/isolex/commit/9347054))
* **tests:** cover typeorm log adapter ([6a52c2b](https://github.com/ssube/isolex/commit/6a52c2b))
* **tests:** disable slack in test config ([615dbb8](https://github.com/ssube/isolex/commit/615dbb8))
* **tests:** ensure unknown signals are ignored ([b84e07b](https://github.com/ssube/isolex/commit/b84e07b))
* **tests:** extract transformed data from body key ([6d5ed93](https://github.com/ssube/isolex/commit/6d5ed93))
* **tests:** make test-specific config ([66d6f5f](https://github.com/ssube/isolex/commit/66d6f5f))
* **tests:** simplify spying on services ([d81f54a](https://github.com/ssube/isolex/commit/d81f54a))
* **tests:** split main and app stop timeouts ([5bab086](https://github.com/ssube/isolex/commit/5bab086))
* typo ([bb5e766](https://github.com/ssube/isolex/commit/bb5e766))
* **tests:** test math utils ([64ba7ae](https://github.com/ssube/isolex/commit/64ba7ae))
* **tests:** test typed errors ([d4fa47d](https://github.com/ssube/isolex/commit/d4fa47d))
* package entry point ([28c9ce5](https://github.com/ssube/isolex/commit/28c9ce5))
* **build:** add ci target ([e228c56](https://github.com/ssube/isolex/commit/e228c56))
* **build:** add tslint, fix issues ([44ae78c](https://github.com/ssube/isolex/commit/44ae78c))
* **build:** always collect make target logs in CI ([b4f1417](https://github.com/ssube/isolex/commit/b4f1417))
* **build:** bump test timeout to 5s ([e1b8bed](https://github.com/ssube/isolex/commit/e1b8bed))
* **build:** bump timeout on main fn test ([da19205](https://github.com/ssube/isolex/commit/da19205))
* **build:** copy tslint config from template, fix issues that exposed ([e2c440e](https://github.com/ssube/isolex/commit/e2c440e))
* **build:** fix package name in bundle ([b762829](https://github.com/ssube/isolex/commit/b762829))
* **build:** include yml in bundle (fixes [#396](https://github.com/ssube/isolex/issues/396)) ([07217f5](https://github.com/ssube/isolex/commit/07217f5))
* **build:** mark bundle with package version ([80a44cd](https://github.com/ssube/isolex/commit/80a44cd))
* **build:** run tests under bash for source command ([4cf21e6](https://github.com/ssube/isolex/commit/4cf21e6))
* **build:** source example env before running tests ([fd85fa7](https://github.com/ssube/isolex/commit/fd85fa7))
* **build:** use npm package mirror ([8bac000](https://github.com/ssube/isolex/commit/8bac000))
* **build:** use template makefile ([51acbd4](https://github.com/ssube/isolex/commit/51acbd4))
* **config:** add path to include errors ([328187a](https://github.com/ssube/isolex/commit/328187a))
* **docs:** update api docs ([3c0fec0](https://github.com/ssube/isolex/commit/3c0fec0))
* **docs:** update to local make target ([cbd7bbc](https://github.com/ssube/isolex/commit/cbd7bbc))
* **parser/split:** implement keep quotes option (fixes [#468](https://github.com/ssube/isolex/issues/468)) ([8f1fe60](https://github.com/ssube/isolex/commit/8f1fe60))
* **test:** more map helper tests ([b91374e](https://github.com/ssube/isolex/commit/b91374e))
* **tests:** add tests for reload and reset signals ([4868194](https://github.com/ssube/isolex/commit/4868194))
* **tests:** expect sequence of service events in reload/reset cases ([8f9123d](https://github.com/ssube/isolex/commit/8f9123d))
* **tests:** finish moving code out of index, test main, fix resulting issues ([ce80ed5](https://github.com/ssube/isolex/commit/ce80ed5))
* **tests:** improve yaml include tests ([92a134e](https://github.com/ssube/isolex/commit/92a134e))
* **tests:** move modules from harness to modules test ([3eac4b4](https://github.com/ssube/isolex/commit/3eac4b4))
* **tests:** test config validation mode flag ([60f0f6d](https://github.com/ssube/isolex/commit/60f0f6d))
* git ignore pid files ([fbe44a0](https://github.com/ssube/isolex/commit/fbe44a0))
* **tests:** test start and sigterm cycle ([7a5f6c8](https://github.com/ssube/isolex/commit/7a5f6c8))
* json/yml typedefs ([1a60952](https://github.com/ssube/isolex/commit/1a60952))
* locale type ([ab54c9b](https://github.com/ssube/isolex/commit/ab54c9b))
* make exit status an enum, start moving testable code out of index ([849420e](https://github.com/ssube/isolex/commit/849420e))
* **tests:** update to template helpers ([e0f39b7](https://github.com/ssube/isolex/commit/e0f39b7))
* replace lodash get with jsonpath ([a7e2ee5](https://github.com/ssube/isolex/commit/a7e2ee5))
* **parser/split:** map and remove prefixes correctly, add test coverage ([8fb6f0d](https://github.com/ssube/isolex/commit/8fb6f0d))
* external modules create modules ([def32f7](https://github.com/ssube/isolex/commit/def32f7))


### Features

* **build:** add debug targets ([1afada8](https://github.com/ssube/isolex/commit/1afada8))
* **build:** add local target, fix run entrypoint ([36305b6](https://github.com/ssube/isolex/commit/36305b6))
* **build:** externalize rollup data ([c610131](https://github.com/ssube/isolex/commit/c610131))
* **controller/github:** add MR approval action ([8556d30](https://github.com/ssube/isolex/commit/8556d30))
* **docs:** add run section to readme ([bc219b1](https://github.com/ssube/isolex/commit/bc219b1))
* **template:** entries helper iterates dicts as well ([ca4419d](https://github.com/ssube/isolex/commit/ca4419d))
* **utils/github:** switch to app auth ([814a5d9](https://github.com/ssube/isolex/commit/814a5d9))
* **utils/github:** switch to app auth (fixes [#502](https://github.com/ssube/isolex/issues/502)) ([ab241a9](https://github.com/ssube/isolex/commit/ab241a9))

## [0.8.0](https://github.com/ssube/isolex/compare/v0.7.0...v0.8.0) (2019-09-08)


### ⚠ BREAKING CHANGES

* locale and storage are proper services
* the typeorm config moves to data.storage.orm within the
bot def

### Bug Fixes

* **build:** add and use CI target ([590a7cf](https://github.com/ssube/isolex/commit/590a7cf))
* **build:** add index chunk ([19b38fb](https://github.com/ssube/isolex/commit/19b38fb))
* **build:** add yarn lock to dockerfile ([89ef3f3](https://github.com/ssube/isolex/commit/89ef3f3))
* **build:** enable coverage ([99ef1c8](https://github.com/ssube/isolex/commit/99ef1c8))
* **build:** exclude version info from hard-source cache ([11ae377](https://github.com/ssube/isolex/commit/11ae377))
* **build:** mark externals as production deps ([5fe71f8](https://github.com/ssube/isolex/commit/5fe71f8))
* **build:** run default make target ([f58c528](https://github.com/ssube/isolex/commit/f58c528))
* **build:** split image build ([773177d](https://github.com/ssube/isolex/commit/773177d))
* **build:** temporarily add yaml resources ([dc57625](https://github.com/ssube/isolex/commit/dc57625))
* **build:** update run target entry point ([2fb3a12](https://github.com/ssube/isolex/commit/2fb3a12))
* **build:** upgrade to rollup ([5fbe772](https://github.com/ssube/isolex/commit/5fbe772))
* **build:** use consistent memory settings ([126f02a](https://github.com/ssube/isolex/commit/126f02a))
* **build:** use relative paths, run api-extractor ([8ec8039](https://github.com/ssube/isolex/commit/8ec8039))
* **controller/github:** mock just enough of navigator ([5d62c9e](https://github.com/ssube/isolex/commit/5d62c9e))
* **controller/k8s:** update to camel-cased names and incorporate patch headers upstream fix ([6fad8e7](https://github.com/ssube/isolex/commit/6fad8e7))
* **docs:** add fossa status badge ([8dac1f7](https://github.com/ssube/isolex/commit/8dac1f7))
* **endpoint:** create a single router for each endpoint service and register with multiple paths ([d62aed9](https://github.com/ssube/isolex/commit/d62aed9))
* **endpoint/gitlab:** hack up the scope/data helper to avoid dict/map issues, fix pipeline hook message ([b9a9fa5](https://github.com/ssube/isolex/commit/b9a9fa5))
* **env:** add default slack channel ([aee52ff](https://github.com/ssube/isolex/commit/aee52ff))
* **listener/slack:** improve slack logging ([7835394](https://github.com/ssube/isolex/commit/7835394))
* **listener/slack:** log channel before sending message ([8bbdd28](https://github.com/ssube/isolex/commit/8bbdd28))
* **listener/slack:** wrap logger to match slack API ([0e9421f](https://github.com/ssube/isolex/commit/0e9421f))
* **module:** make entity list public ([c260c83](https://github.com/ssube/isolex/commit/c260c83))
* **module/bot:** make logger required ([9718f51](https://github.com/ssube/isolex/commit/9718f51))
* **module/service:** add container to service module ([893021f](https://github.com/ssube/isolex/commit/893021f))
* **parser/args:** convert values to strings ([5dea140](https://github.com/ssube/isolex/commit/5dea140))
* **test:** check active service count during lifecycle test ([09c80f1](https://github.com/ssube/isolex/commit/09c80f1))
* **test:** get tests working again ([bd7b9f1](https://github.com/ssube/isolex/commit/bd7b9f1))
* **test:** split up plain container and service module helpers ([8a45015](https://github.com/ssube/isolex/commit/8a45015))
* **test:** test entity module ([0f0b5ac](https://github.com/ssube/isolex/commit/0f0b5ac))
* **test/helpers:** bind console logger to helper container ([b0f67b0](https://github.com/ssube/isolex/commit/b0f67b0))
* **tests:** fiddle with rollup chunks until tests work ([3d9ea24](https://github.com/ssube/isolex/commit/3d9ea24))
* begin handling cmd data in a consistent manner ([fe47706](https://github.com/ssube/isolex/commit/fe47706))
* circular dep with config index ([13a3484](https://github.com/ssube/isolex/commit/13a3484))
* do not invoke fns returned from math ([58f29c5](https://github.com/ssube/isolex/commit/58f29c5))
* express listener should load user roles after validating token ([78e0114](https://github.com/ssube/isolex/commit/78e0114))
* filter bot controller templates ([bcf2803](https://github.com/ssube/isolex/commit/bcf2803))
* move storage to service ([#114](https://github.com/ssube/isolex/issues/114)) ([1e70c04](https://github.com/ssube/isolex/commit/1e70c04))
* propagate stricter DI types ([7ed022e](https://github.com/ssube/isolex/commit/7ed022e))
* remove redundant type check ([58592e3](https://github.com/ssube/isolex/commit/58592e3))
* remove source map support from main bundle ([b7c7329](https://github.com/ssube/isolex/commit/b7c7329))
* set both commit title and msg when merging ([88cb709](https://github.com/ssube/isolex/commit/88cb709))
* start locale and storage with other services ([48f4908](https://github.com/ssube/isolex/commit/48f4908))
* swap octokit graphql for rest ([#133](https://github.com/ssube/isolex/issues/133)) ([1915492](https://github.com/ssube/isolex/commit/1915492))
* type check yaml output better ([a476cb4](https://github.com/ssube/isolex/commit/a476cb4))
* update github response format ([834797f](https://github.com/ssube/isolex/commit/834797f))
* useful output for metrics ([3fdf9af](https://github.com/ssube/isolex/commit/3fdf9af))
* wire up data and labels for graph/iql ([c2324bf](https://github.com/ssube/isolex/commit/c2324bf))
* yaml parser should set logic for valid types ([a115056](https://github.com/ssube/isolex/commit/a115056))


### Features

* **bot:** load external modules ([93da867](https://github.com/ssube/isolex/commit/93da867))
* **bot:** schema stubs and global exports for external services ([b6ba40e](https://github.com/ssube/isolex/commit/b6ba40e))
* **bot:** use custom name and dynamic require for external services ([cc45660](https://github.com/ssube/isolex/commit/cc45660))
* **build:** add hard source caching ([aee15da](https://github.com/ssube/isolex/commit/aee15da))
* **build:** add targets to stop and reset based on pid file ([9f5aaa3](https://github.com/ssube/isolex/commit/9f5aaa3))
* **build:** support overriding docker image to run version other than master ([1bf44aa](https://github.com/ssube/isolex/commit/1bf44aa))
* **config:** add pid file ([1ea52ca](https://github.com/ssube/isolex/commit/1ea52ca))
* **controller:** add argument to set context on transformed data ([fd8b8f4](https://github.com/ssube/isolex/commit/fd8b8f4))
* **controller/echo:** add option to force message channel in config ([e5ffc1f](https://github.com/ssube/isolex/commit/e5ffc1f))
* **endpoint:** add gitlab webhook endpoint ([300734c](https://github.com/ssube/isolex/commit/300734c))
* **endpoint:** add stubs for gitlab note and pipeline ([3dc7c42](https://github.com/ssube/isolex/commit/3dc7c42))
* **endpoint:** add transforms to base endpoint, echo push hooks ([6211c12](https://github.com/ssube/isolex/commit/6211c12))
* **endpoint:** implement service endpoints ([#68](https://github.com/ssube/isolex/issues/68)) ([ceaa865](https://github.com/ssube/isolex/commit/ceaa865))
* **endpoint/debug:** add debug endpoint for svc config ([#298](https://github.com/ssube/isolex/issues/298)) ([6ca7132](https://github.com/ssube/isolex/commit/6ca7132))
* **endpoint/gitlab:** transform data and execute command ([fc79930](https://github.com/ssube/isolex/commit/fc79930))
* **interval/cron:** implement cron schedules ([#93](https://github.com/ssube/isolex/issues/93)) ([aa89a44](https://github.com/ssube/isolex/commit/aa89a44))
* **schema:** support sub-schemas added during runtime ([160c0be](https://github.com/ssube/isolex/commit/160c0be))
* **template:** add key helper to fetch map entries ([949019a](https://github.com/ssube/isolex/commit/949019a))
* **template:** add withMap helper ([5830ea6](https://github.com/ssube/isolex/commit/5830ea6))
* **test:** test DI modules and debug ([436b800](https://github.com/ssube/isolex/commit/436b800))
* **transform:** add scope/data helper ([7858f64](https://github.com/ssube/isolex/commit/7858f64))
* **utils:** add coalesce or throw helper ([03033d2](https://github.com/ssube/isolex/commit/03033d2))
* add bot ctrl, handle noun list ([#70](https://github.com/ssube/isolex/issues/70)) ([f779e60](https://github.com/ssube/isolex/commit/f779e60))
* add command number helper ([ece9be6](https://github.com/ssube/isolex/commit/ece9be6))
* add k8s apps ctrl, get deployments ([#32](https://github.com/ssube/isolex/issues/32)) ([e6956a4](https://github.com/ssube/isolex/commit/e6956a4))
* add stub gh listener ([5172673](https://github.com/ssube/isolex/commit/5172673))
* attach locale to logger ([#113](https://github.com/ssube/isolex/issues/113)) ([99d6ddc](https://github.com/ssube/isolex/commit/99d6ddc))
* bot ctrl can get metrics ([#70](https://github.com/ssube/isolex/issues/70)) ([eacb4b6](https://github.com/ssube/isolex/commit/eacb4b6))
* fetch recent gh comments, convert and send ([#14](https://github.com/ssube/isolex/issues/14)) ([3b393da](https://github.com/ssube/isolex/commit/3b393da))
* github listener session support ([#14](https://github.com/ssube/isolex/issues/14)) ([f2516c4](https://github.com/ssube/isolex/commit/f2516c4))
* handle lex confirm state ([edb194d](https://github.com/ssube/isolex/commit/edb194d))
* list k8s daemon and stateful sets ([#32](https://github.com/ssube/isolex/issues/32)) ([5e012d6](https://github.com/ssube/isolex/commit/5e012d6))
* locale logger class ([#113](https://github.com/ssube/isolex/issues/113)) ([1bd476d](https://github.com/ssube/isolex/commit/1bd476d))
* logging helpers with common fields ([#113](https://github.com/ssube/isolex/issues/113)) ([e6a7136](https://github.com/ssube/isolex/commit/e6a7136))
* make service timeout configurable ([3f0adca](https://github.com/ssube/isolex/commit/3f0adca))
* merge saved keyword data with next field ([940d7d9](https://github.com/ssube/isolex/commit/940d7d9))
* prefer user lang when translating ([#112](https://github.com/ssube/isolex/issues/112)) ([461594a](https://github.com/ssube/isolex/commit/461594a))
* reaction ctrl matches many reactions, add to ref config ([ae7ed3e](https://github.com/ssube/isolex/commit/ae7ed3e))
* replace github graphql client with rest ([1b9293d](https://github.com/ssube/isolex/commit/1b9293d))
* scale k8s deploy and stateful, add templates ([#32](https://github.com/ssube/isolex/issues/32)) ([be87491](https://github.com/ssube/isolex/commit/be87491))
* service list and version info from bot introspection ctrl ([#70](https://github.com/ssube/isolex/issues/70)), doc in getting-started ([#53](https://github.com/ssube/isolex/issues/53)) ([10f0188](https://github.com/ssube/isolex/commit/10f0188))
* slack listener can fetch messages ([bfa73c4](https://github.com/ssube/isolex/commit/bfa73c4))
* slack listener support for reactions, threads ([da07d53](https://github.com/ssube/isolex/commit/da07d53))
* slack reactions, reaction ctrl ([e4f16b1](https://github.com/ssube/isolex/commit/e4f16b1))
* timeout to prevent slow-starting services from blocking others ([#116](https://github.com/ssube/isolex/issues/116)) ([8ebbcbf](https://github.com/ssube/isolex/commit/8ebbcbf))
* update user locale ([#112](https://github.com/ssube/isolex/issues/112)) ([54fc58a](https://github.com/ssube/isolex/commit/54fc58a))
* user locale data ([#112](https://github.com/ssube/isolex/issues/112)) ([d131670](https://github.com/ssube/isolex/commit/d131670))


* make storage a service ([c899aaa](https://github.com/ssube/isolex/commit/c899aaa))

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
