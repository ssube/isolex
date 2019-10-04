# isolex

Chat bot able to speak natural language and markup, prompt to complete commands, and offer localized help.
Configured with schema-validated YAML, features JWT authentication with granular RBAC, and SQL persistence.
Listeners for common chat services, controllers for chat functions and devops tools, and inspired by the Kubernetes API.

## Getting Started

The bot interacts through Discord and Slack, Github and Gitlab comments, and a GraphQL API.

The [getting started guide](./docs/getting-started.md) has more information on using the bot.

## Status

[![Pipeline status](https://img.shields.io/gitlab/pipeline/ssube/isolex.svg?gitlab_url=https%3A%2F%2Fgit.apextoaster.com&logo=gitlab)](https://git.apextoaster.com/ssube/isolex/commits/master)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=ssube_isolex&metric=ncloc)](https://sonarcloud.io/dashboard?id=ssube_isolex)
[![Test coverage](https://sonarcloud.io/api/project_badges/measure?project=ssube_isolex&metric=coverage)](https://sonarcloud.io/dashboard?id=ssube_isolex)
[![MIT license](https://img.shields.io/github/license/ssube/isolex.svg)](https://github.com/ssube/isolex/blob/master/LICENSE.md)

[![Open bug count](https://img.shields.io/github/issues-raw/ssube/isolex/type-bug.svg)](https://github.com/ssube/isolex/issues?q=is%3Aopen+is%3Aissue+label%3Atype%2Fbug)
[![Open issue count](https://img.shields.io/github/issues-raw/ssube/isolex.svg)](https://github.com/ssube/isolex/issues?q=is%3Aopen+is%3Aissue)
[![Closed issue count](https://img.shields.io/github/issues-closed-raw/ssube/isolex.svg)](https://github.com/ssube/isolex/issues?q=is%3Aissue+is%3Aclosed)

[![Renovate badge](https://badges.renovateapi.com/github/ssube/isolex)](https://renovatebot.com)
[![Known vulnerabilities](https://snyk.io/test/github/ssube/isolex/badge.svg)](https://snyk.io/test/github/ssube/isolex)
[![Dependency status](https://img.shields.io/david/ssube/isolex.svg)](https://david-dm.org/ssube/isolex)
[![Dev dependency status](https://img.shields.io/david/dev/ssube/isolex.svg)](https://david-dm.org/ssube/isolex?type=dev)

[![Maintainability score](https://api.codeclimate.com/v1/badges/5d4326d6f68a2fa137cd/maintainability)](https://codeclimate.com/github/ssube/isolex/maintainability)
[![Technical debt ratio](https://img.shields.io/codeclimate/tech-debt/ssube/isolex.svg)](https://codeclimate.com/github/ssube/isolex/trends/technical_debt)
[![Quality issues](https://img.shields.io/codeclimate/issues/ssube/isolex.svg)](https://codeclimate.com/github/ssube/isolex/issues)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fssube%2Fisolex.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fssube%2Fisolex?ref=badge_shield)

[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/ssube/isolex.svg?logo=lgtm)](https://lgtm.com/projects/g/ssube/isolex/context:javascript)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/ssube/isolex.svg)](https://lgtm.com/projects/g/ssube/isolex/alerts/)

## Releases

[![github release link](https://img.shields.io/badge/github-release-blue?logo=github)](https://github.com/ssube/isolex/releases)
[![github release version](https://img.shields.io/github/tag/ssube/isolex.svg)](https://github.com/ssube/isolex/releases)
[![github commits since release](https://img.shields.io/github/commits-since/ssube/isolex/v0.7.0.svg)](https://github.com/ssube/isolex/compare/v0.7.0...master)

[![npm package link](https://img.shields.io/badge/npm-package-blue?logo=npm)](https://www.npmjs.com/package/isolex)
[![npm release version](https://img.shields.io/npm/v/isolex.svg)](https://www.npmjs.com/package/isolex)
[![Typescript definitions](https://img.shields.io/npm/types/isolex.svg)](https://www.npmjs.com/package/isolex)

[![docker image link](https://img.shields.io/badge/docker-image-blue?logo=docker)](https://hub.docker.com/r/ssube/isolex)
[![docker image size](https://images.microbadger.com/badges/image/ssube/isolex:master.svg)](https://microbadger.com/images/ssube/isolex:master)

## Build

To build and run the bot locally, you will need `make`, `node`, and `yarn` installed globally or a container with the
same.

Clone this repository:

```shell
> git clone git@github.com:ssube/isolex.git
> cd isolex
```

Within the project directory, make the bundle:

```shell
> make local

yarn install
[1/4] Resolving packages...
...
Done in 0.65s

ℹ ｢atl｣: Using typescript@3.2.2 from typescript

...
starting bot...
```

## Config

An [example config file](./docs/isolex.yml) is provided in [the `docs/` directory](./docs). This enables most of the
core features, but requires [some secrets](./docs/getting-started.md#secrets) to be defined in the environment.

## Run

### Deploy to Kubernetes

To deploy the bot into a Kubernetes cluster:

```shell
> kubectl apply -f deploy/isolex-deploy.yml
```

### Locally in Docker

To run the bot locally from the Docker image:

```shell
> docker run ssube/isolex:master
```

### Locally from bundle

To run the bot locally from [the build bundle](#build):

```shell
> make run-bunyan
```

Logs will be piped through [bunyan](https://github.com/trentm/node-bunyan) and pretty-printed.
