# Getting Started

This guide will introduce the account system (authentication and authorization), common chat commands, and more
advanced deploy commands.

- [Getting Started](#getting-started)
  - [Architecture](#architecture)
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
    - [Help](#help)
    - [Chat](#chat)
      - [Learn Keyword](#learn-keyword)
      - [Solve Math](#solve-math)
      - [Roll Dice](#roll-dice)
      - [React To Message](#react-to-message)
    - [Deploy](#deploy)
      - [Merge Pull Request](#merge-pull-request)
      - [Start Pipeline](#start-pipeline)
      - [Scale Apps](#scale-apps)
  - [Security](#security)
    - [Root User](#root-user)
    - [Grants](#grants)
    - [Tokens](#tokens)

## Architecture

For details on what messages are, how commands are executed, and the various services involved, please see
[the architecture docs](./concept/arch.md).

## Running

### Config

The bot comes with a [reference config file](./isolex.yml) with somewhat reasonable defaults that show off most core
features. The local build will use this config file, remote deploys will need a config file to be mounted.

### Secrets

This config file does require some secrets to be defined in the environment. Empty defaults **suitable for testing**
are [included in `isolex.env`](./isolex.env). To use these secrets, copy the file into your home directory, fill
in the values, then `source ~/isolex.env` the file.

If you do not plan on using a feature, the service should be removed from the config file and related secrets do not
need to be defined.

### Kubernetes

To run the bot in a Kubernetes cluster, deploy the `ssube/isolex` image and mount a config file.

### Local

To build and run the bot locally, you will need `make`, `node`, and `yarn` installed globally.

In the project directory, run:

```shell
> yarn
> make local
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

The bot does not use passwords for authentication. Passwords have no inherent meaning and require substantial work to
salt and hash correctly. Instead, each user is issued a [JSON web token](https://jwt.io) allowing them to sign in and
create additional tokens. Tokens are signed but not encrypted, so any party can see the payload data, but cannot modify
existing tokens or forge new ones. Only the server has the secret necessary to create and validate tokens.

In a **private** channel:

> !!join --name username
>
> @you, user username joined, sign in token: eyJh....A6hg

This will print a JWT, which can be used to sign in as this user and issue more tokens. This token is not otherwise
useful on its own and will be referred to as the "sign in" token.

**Save this token in your password manager**. You will use this token every time you log in.

#### Sign In

Most of the chat services to which the bot connects have their own accounts. If a user is already logged into one of
these services, the bot can attach a session to that account and keep you logged in.

In a **private** channel:

> !!login --token eyJh...A6hg
>
> @you, created session

Once you are signed in, you will be granted permission to execute some commands. Grants are based on the token and
any roles attached to the user, and the grant must appear in both the token and roles.

#### Revoke Tokens

If any of your tokens are lost or compromised, you can revoke them. This will delete all existing tokens for your user
and create a new sign in token.

This command takes one argument, `confirm`, which must be set to `yes` for the tokens to be deleted.

In a **private** channel:

> !!args --noun join --verb delete --confirm yes
>
> @you, revoked tokens for username, new sign in token: eyJh..cRMs

**Save this token in your password manager**. Please see [sign up](#sign-up) for more information on sign in tokens.

### Help

The bot has a dynamic, localized help system. Users may set their language, while the bot sets the default language.

To list available nouns and the controllers that might be able to handle them:

> !!args --noun bot-noun --verb list
>
> @you, account-controller:default-account: grant
> account-controller:default-account: account
> account-controller:default-account: session
> bot-controller:default-bot: bot-noun
> completion-controller:default-completion: fragment
> dice-controller:test-dice: roll
> github-pr-controller:test-pr: github-pull-request
> gitlab-ci-controller:test-ci: gitlab-ci-job
> gitlab-ci-controller:test-ci: gitlab-ci-pipeline
> kubernetes-apps-controller:test-k8s-apps: kubernetes-daemonset
> kubernetes-apps-controller:test-k8s-apps: kubernetes-deployment
> kubernetes-apps-controller:test-k8s-apps: kubernetes-statefulset
> kubernetes-core-controller:test-k8s-core: kubernetes-pod
> kubernetes-core-controller:test-k8s-core: kubernetes-service
> learn-controller:test-learn: keyword
> math-controller:test_math: math
> random-controller:test-random: random
> reaction-controller:default-reaction: reaction
> search-controller:search_mdn: search
> sed-controller:test-sed: sed
> time-controller:test-time: time
> token-controller:default-token: token
> user-controller:default-user: role
> user-controller:default-user: user
> weather-controller:test_weather: weather

To get help for a noun:

> !!help account
>
> @you, The account controller handles registering new users, sign in for existing users,
> revoking sign in tokens, and checking grants.

The get help for a topic within the noun:

> !!help account account-create
>
> @you, The account controller handles registering new users, sign in for existing users,
> revoking sign in tokens, and checking grants.
> Register a new account and issue a sign in token. Should only be executed in a private channel.

### Chat

The bot has a number of traditional chat bot functions, including the very necessary ability to react to messages.

#### Learn Keyword

The bot is able to learn commands and execute them later using a keyword.

To teach the bot a new keyword:

> !!learn tgif time get
>
> @you, Learned command tgif.

To execute the command, passing some extra data (to be merged with any saved data):

> !!args --noun keyword --verb update --keyword tgif
>
> @you,  12/28/2018, 1:39:06 PM

#### Solve Math

The bot is able to solve some mathematical expressions thanks to [the mathjs library](http://mathjs.org/index.html).

To solve a simple expression:

> !!args --noun math --verb create --expr "1+2"
>
> @you, 3

The [full mathjs syntax](http://mathjs.org/docs/expressions/syntax.html) and
[all functions](http://mathjs.org/docs/reference/functions.html) are available and support some fairly complex
operations:

> !!args --noun math --verb create --expr "rationalize('2x/y - y/(x+1)')"
>
> @you, `(2 * x ^ 2 - y ^ 2 + 2 * x) / (x * y + y)`

#### Roll Dice

To roll a set of dice with the bot:

> !!args --noun roll --verb create --count 2 --sides 6
>
> @you, The results of your rolls were: 5,2. The sum is 7.

The first argument is the number of dice to roll, the second is the number of sides on each die.

#### React To Message

The bot can react to messages, adding emojis if the message matches a set of rules. This relies more on configuration
than interacting with the bot while it is running.

Reactions use [their own matching rules](./controller/reaction-controller.yml), and each reaction has a `chance` to
happen. Those chances are rolled individually, so the bot may add many reactions to a single message, or none.

Reactions are configured with the string or regexp to match and the emojis to be added:

```yaml
data:
  reactions:
    - chance: 0.5
      match:
        rules:
          - key: body
            operator: any
            values:
              - regexp: !regexp /maple/
      add: [":maple:"]
```

Emojis should be supported by [node-emoji](https://www.npmjs.com/package/node-emoji).

The bot rolls a random number `[0, 1)` for each message, for each reaction, and will add the listed emojis if that roll
is greater than the `chance`. To make it very likely the bot responds, use the keyword more than once:

> maple trees maple trees maple trees
> 🍁

### Deploy

#### Merge Pull Request

The bot is able to merge (or close) pull requests through [Github's API](https://developer.github.com/v3/).

To view open pull requests on a project which you own, such as a fork of the bot:

> !!args --noun github-pull-request --verb list --project isolex
>
> @you, PR#69: enable test coverage (by ssube)
> PR#74: github PR controller workflow (by ssube)

To merge a pull request, `update` it with a `message`:

> !!args --noun github-pull-request --verb update --project isolex --number 74 --message "feat: github PR controller"
>
> @you, merged pull request 74

To close a pull request, `delete` it (no `message` needed):

> !!args --noun github-pull-request --verb delete --project isolex --number 77
>
> @you, closed pull request 77

(this example refers to the first two pull requests closed and merged by the bot, #74 and #77)

#### Start Pipeline

The bot is able to start and check up on [Gitlab CI's](https://docs.gitlab.com/ee/ci/) pipelines and jobs.

To view recent pipelines on a project, such as the bot:

> !!args --noun gitlab-ci-pipeline --verb list --group ssube --project isolex
>
> @you, #1502 on master (c7bd0a0d): success
>
> #1501 on master (bfe2e754): success
>
> #1500 on master (ef3822d5): success
>
> #1499 on master (901046fc): success
>
> #1498 on master (8a2ef6f8): success

To run a new pipeline:

> !!args --noun gitlab-ci-pipeline --verb create --group ssube --project isolex --ref master
>
> @you, #1504 on master (c7bd0a0d): pending

To cancel that pipeline:

> !!args --noun gitlab-ci-pipeline --verb delete --group ssube --project isolex --pipeline 1504
>
> @you, #1504 on master (c7bd0a0d): running

The status is shown as `running` after canceling the pipeline, since the jobs take a moment to stop.

#### Scale Apps

The bot is able to view and scale applications on [Kubernetes](https://kubernetes.io/). Support is split by
`apiVersion` on the k8s side, with a bot controller for each set of resources.

To view running pods:

> !!k8s --noun kubernetes-pod --verb list --ns gitlab
>
> @you, gitlab-0: Running
> postgres-0: Running
> redis-0: Running

To view the stateful sets (or deployment) that created those pods:

> !!k8s --noun kubernetes-statefulset --verb list --ns gitlab
>
> @you, gitlab: 1
> postgres: 1
> redis: 1

To scale the set up or down::

> !!k8s --noun kubernetes-statefulset --verb update --ns gitlab --name redis --replicas 2
>
> @you, k8s-app&amp;#x3D;redis: 1

The response will show the *current* number of replicas, not the desired number. After a moment, new pods should
appear:

> !!k8s --noun kubernetes-pod --verb list --ns gitlab
>
> @you, gitlab-0: Running
> postgres-0: Running
> redis-0: Running
> redis-1: Running

## Security

The bot features RBAC (role-based access control) as a way of enforcing granular permissions for users. Access is
handled exclusively through JSON web tokens (JWT) and the bot does not use or store passwords.

When the bot first launches, it will not have any roles or users, so most commands will be inaccessible. You should
[create a root user](#root-user) to begin setting up other roles and users.

**It is both safe and recommended that you delete the root user** after setting up an admin role and additional users.

### Root User

The repository includes [a script](../scripts/bot-root.sh) that will **remove any existing roles, tokens, and users**
before creating a new `root` role. This script must be run after the bot database has been created and is safe to run
while the bot is also running.

With the bot running in another terminal:

```shell
> ./scripts/bot-root.sh

DELETE FROM role;
DELETE FROM token;
DELETE FROM user;

INSERT INTO role ("id", "name", "grants") VALUES ('9160b8fe-144d-4737-973e-485c4c8d96ae', 'root', '["*"]');
```

You do not need to know the role ID for the next steps; roles are granted by name and names must be unique.

Back in chat, in a **private channel** where the bot is active:

```
> !!join --name root
>
> @you, user root joined, sign in token: ey.._4
```

This is the root user's [sign in token](#sign-in). It is the most important token and should be kept safe (a physical
safe should provide adequate security).

The root user will be granted the roles configured in `root.roles` *as well as* the roles in `join.roles`, while the
sign in token will have the standard grants from `join.grants`. For additional grants, another token must be created,
as with all users.

The root user is not inherently special, but does have additional roles. It is not guaranteed to exist (and indeed
*should not* exist unless needed). The name of the root user may be changed with the `root.name` key to make it more
difficult to guess, although the bot will advertise whether a username exists if `join.allow` is enabled.

### Grants

Users are given Roles, Roles are given grants. Grants (permissions) use
[Shiro-style syntax](http://shiro.apache.org/permissions.html) via
[shiro-trie](https://www.npmjs.com/package/shiro-trie). The account controller is responsible for creating users,
verifying tokens, and establishing sessions.

When executing a command, controllers check for `kind:name:noun:verb`. Commands can be granted down to the noun and
verb, but data is not visible to permissions yet (the syntax does not support maps).

When sending a message, listeners check for `kind:name:channel:type`. Messages can be granted down to the MIME type
and destination channel.

### Tokens

Instead of passwords, JSON web tokens (JWT) are used to authenticate to the bot. Rather than password reset, users
can revoke all existing tokens and issue a new sign in token.

Sign in tokens should be created with a limited set of grants, preventing most API access. Despite this, they are still
the most privileged token for each user, being able to create additional tokens.

A typical set of sign in grants may include:

- `account:delete`
- `grant:get,list`
- `session:create,delete`
- `token:create,delete`
