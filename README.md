# isolex

Unified chat bot with [AWS Lex](https://aws.amazon.com/lex/) integration, observables,
[templates](https://handlebarsjs.com/) and [buzzwords](https://www.youtube.com/watch?v=PYtXuBN1Hvc).

[![Pipeline status](https://git.apextoaster.com/ssube/isolex/badges/master/pipeline.svg)](https://git.apextoaster.com/ssube/isolex/commits/master)
[![Greenkeeper badge](https://badges.greenkeeper.io/ssube/isolex.svg)](https://greenkeeper.io/)
[![Dependency status](https://img.shields.io/david/ssube/isolex.svg)](https://david-dm.org/ssube/isolex)
[![Dev dependency status](https://img.shields.io/david/dev/ssube/isolex.svg)](https://david-dm.org/ssube/isolex?type=dev)

[![Maintainability score](https://api.codeclimate.com/v1/badges/5d4326d6f68a2fa137cd/maintainability)](https://codeclimate.com/github/ssube/isolex/maintainability)
[![Technical debt ratio](https://img.shields.io/codeclimate/tech-debt/ssube/isolex.svg)](https://codeclimate.com/github/ssube/isolex/trends/technical_debt)
[![MIT license](https://img.shields.io/github/license/ssube/isolex.svg)](https://github.com/ssube/isolex/blob/master/LICENSE.md)
[![Open issue count](https://img.shields.io/github/issues-raw/ssube/isolex.svg)](https://github.com/ssube/isolex/issues?q=is%3Aopen+is%3Aissue)
[![Closed issue count](https://img.shields.io/github/issues-closed-raw/ssube/isolex.svg)](https://github.com/ssube/isolex/issues?q=is%3Aissue+is%3Aclosed)

## Releases

[![Github release version](https://img.shields.io/github/tag/ssube/isolex.svg)](https://github.com/ssube/isolex/releases)
[![Commits since release](https://img.shields.io/github/commits-since/ssube/isolex/v0.5.0.svg)](https://github.com/ssube/isolex/compare/v0.5.0...master)

[![NPM release version](https://img.shields.io/npm/v/isolex.svg)](https://www.npmjs.com/package/isolex)
[![Docker image size](https://images.microbadger.com/badges/image/ssube/isolex:master.svg)](https://microbadger.com/images/ssube/isolex:master) 
[![Typescript definitions](https://img.shields.io/npm/types/isolex.svg)](https://www.npmjs.com/package/isolex)


## Build

```shell
$ yarn

yarn install
[1/4] Resolving packages...
...
Done in 0.65s

$ make

...
Success! make run-terminal to launch
```

## Config

Create [a config file](docs/config.md) at `${HOME}/.isolex.yml`.

## Usage

With a valid config:

```shell
$ make run-terminal

node /home/yourname/code/isolex//out/main-bundle.js
hello bot
loading config from paths [ '/home/yourname/.isolex.yml' ]
...
{"name":"isolex","hostname":"your-host","pid":32661,"level":30,"msg":"setting up streams","time":"2018-04-22T02:12:44.759Z","v":0}
{"name":"isolex","hostname":"your-host","pid":32661,"level":30,"msg":"authenticating with chat","time":"2018-04-22T02:12:44.761Z","v":0}
{"name":"isolex","hostname":"your-host","pid":32661,"level":30,"msg":"joining rooms","time":"2018-04-22T02:12:46.305Z","v":0}
```
