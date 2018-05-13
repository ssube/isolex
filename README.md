# isolex

Unified chat bot with [AWS Lex](https://aws.amazon.com/lex/) integration, observables,
[templates](https://handlebarsjs.com/) and [buzzwords](https://www.youtube.com/watch?v=PYtXuBN1Hvc).

[![Maintainability](https://api.codeclimate.com/v1/badges/5d4326d6f68a2fa137cd/maintainability)](https://codeclimate.com/github/ssube/isolex/maintainability)
[![pipeline status](https://git.apextoaster.com/apex-open/isolex/badges/master/pipeline.svg)](https://git.apextoaster.com/apex-open/isolex/commits/master)

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
