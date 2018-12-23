# Getting Started

This guide will introduce the account system (authentication and authorization), common chat commands, and more
advanced deploy commands.

- [Getting Started](#getting-started)
  - [Concepts](#concepts)
  - [Running](#running)
    - [Config](#config)
    - [Secrets](#secrets)
    - [Kubernetes](#kubernetes)
    - [Local](#local)
    - [Signals](#signals)
      - [Reload](#reload)
      - [Reset](#reset)
      - [Stopping](#stopping)
  - [Usage](#usage)
    - [Account](#account)
      - [Sign Up](#sign-up)
      - [Sign In](#sign-in)
      - [Revoke Tokens](#revoke-tokens)
    - [Chat](#chat)
      - [Roll Dice](#roll-dice)
      - [Edit Message](#edit-message)
      - [Learn Command](#learn-command)
    - [Deploy](#deploy)
      - [Scale Apps](#scale-apps)
      - [Start Job](#start-job)
      - [Merge Pull Request](#merge-pull-request)

## Concepts

## Running

### Config

The bot comes with a [reference config file](./isolex.yml) with somewhat reasonable defaults that show off most core
features. The local build will use this config file, remote deploys will need a config file to be mounted.

### Secrets

This config file does require some secrets to be defined in the environment. They are:

```shell
export ISOLEX_DISCORD_TOKEN=""
export ISOLEX_DISCORD_USER_ID="@"
export ISOLEX_LEX_ACCOUNT_ACCESS_KEY=""
export ISOLEX_LEX_ACCOUNT_SECRET_KEY=""
export ISOLEX_SLACK_TOKEN_BOT="xoxb-"
export ISOLEX_SLACK_TOKEN_WEB="xoxp-"
export ISOLEX_WEATHER_API_KEY=""
```

If you do not plan on using a feature, the service should be removed from the config file and related secrets do not
need to be defined.

### Kubernetes

To run the bot in a Kubernetes cluster, deploy the `ssube/isolex` image and mount a config file.

### Local

To build and run the bot locally, you will need `make`, `node`, and `yarn` installed globally.

In the project directory, run:

```shell
> yarn
> make
```

### Signals

The bot listens for [OS signals](https://linux.die.net/Bash-Beginners-Guide/sect_12_01.html) to reload or stop. Use
`kill` to send signals to the bot process. Pressing `Ctrl+C` will reset counters within the bot but will not stop it.

#### Reload

> Signal: `SIGHUP`

TODO: implement and describe reloading config

#### Reset

> Signal: `SIGINT`

To reset the bot, setting counters and metrics back to their initial values:

```shell
{"name":"isolex","hostname":"ssube-cerberus","pid":12116,...}

> kill -2 12116
```

#### Stopping

> Signal: `SIGKILL`

To stop the bot, `kill` the PID from the log messages:

```shell
{"name":"isolex","hostname":"ssube-cerberus","pid":12116,...}

> kill 12116
```

## Usage

### Account

#### Sign Up

When the bot first starts, the database will be empty. Begin by signing up, which will create a new user and an initial
(sign in) token.

In a **private** channel:

```
> !!join --name username

> @you, user username joined, sign in token: eyJh....A6hg
```

This will print a JWT, which can be used to sign in as this user and issue more tokens. This token is not otherwise
useful on its own and will be referred to as the "sign in" token.

**Save this token in your password manager**. You will need to provide this token when logging in.

#### Sign In

Most of the services to which the bot connects use accounts. Since a user has logged in to the upstream service,
sessions can be attached to users.

In a **private** channel:

```
> !!login --token eyJh...A6hg

> @you, created session
```

#### Revoke Tokens

If a token is lost or compromised, you can reset tokens with the `join:delete` command.

This command takes one argument, `confirm`, which must be set to `yes` for the tokens to be deleted.

In a **private** channel:

```
> !!args --noun join --verb delete --confirm yes

> @you, revoked tokens for username, new sign in token: eyJh..cRMs
```

**Save this token in your password manager**. Please see [sign up](#sign-up) for more information on sign in tokens.

### Chat

#### Roll Dice

TODO: roll dice

#### Edit Message

TODO: edit an existing message

#### Learn Command

TODO: learn a command shortcut

### Deploy

#### Scale Apps

TODO: scale up k8s apps deployment

#### Start Job

TODO: start Gitlab job

#### Merge Pull Request

TODO: merge Github PR
