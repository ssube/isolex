# isolex

Chat bot capable of parsing natural language, driven by observables, and controlling almost anything.
Inspired by the Kubernetes API.

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

To build and run the bot locally, you will need `make`, `node`, and `yarn` installed globally or a container with the
same.

In the project directory, run:

```shell
> yarn

yarn install
[1/4] Resolving packages...
...
Done in 0.65s

> make

...
starting bot...
```

## Config

An [example config file](./docs/isolex.yml) is provided in [the `docs/` directory](./docs). This enables most of the
core features, but requires [some secrets](./docs/getting-started.md#config) to be defined in the environment.

## Getting Started

The bot interacts through Discord, Slack, or a GraphQL API.

The [getting started guide](./docs/getting-started.md) has more information on using the bot.
