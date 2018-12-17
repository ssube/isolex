# isolex

Unified chat bot with [AWS Lex](https://aws.amazon.com/lex/) integration, observables,
[templates](https://handlebarsjs.com/) and [buzzwords](https://www.youtube.com/watch?v=PYtXuBN1Hvc).

[![Dependency status](https://img.shields.io/david/ssube/isolex.svg)](https://david-dm.org/ssube/isolex)
[![Dev dependency status](https://img.shields.io/david/dev/ssube/isolex.svg)](https://david-dm.org/ssube/isolex?type=dev)
[![Maintainability score](https://api.codeclimate.com/v1/badges/5d4326d6f68a2fa137cd/maintainability)](https://codeclimate.com/github/ssube/isolex/maintainability)
[![Open issue count](https://img.shields.io/github/issues/ssube/isolex.svg)](https://github.com/ssube/isolex/issues)
[![Pipeline status](https://git.apextoaster.com/ssube/isolex/badges/master/pipeline.svg)](https://git.apextoaster.com/ssube/isolex/commits/master)
[![MIT license](https://img.shields.io/github/license/ssube/isolex.svg)](https://github.com/ssube/isolex/blob/master/LICENSE.md)

## Releases

[![Github release version](https://img.shields.io/github/tag/ssube/isolex.svg)](https://github.com/ssube/isolex/releases)
[![NPM release version](https://img.shields.io/npm/v/isolex.svg)](https://www.npmjs.com/package/isolex)

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
