# isolex

Unified observable chat bot with [AWS Lex](https://aws.amazon.com/lex/) integration,
[handlebars templates](https://handlebarsjs.com/) and [buzzwords](https://www.youtube.com/watch?v=PYtXuBN1Hvc).

## Build

[![pipeline status](https://git.apextoaster.com/apex-open/isolex/badges/master/pipeline.svg)](https://git.apextoaster.com/apex-open/isolex/commits/master)

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
