# Config

The [reference configuration may be found here](./isolex.yml). The rest of this document breaks down the sections and
custom types available.

- [Config](#config)
  - [File](#file)
    - [Custom Types](#custom-types)
      - [Env](#env)
      - [Include](#include)
      - [Regexp](#regexp)
    - [Search Paths](#search-paths)
  - [Bot Definition](#bot-definition)
    - [Data](#data)
      - [Controllers](#controllers)
      - [Filters](#filters)
      - [Intervals](#intervals)
      - [Listeners](#listeners)
      - [Logger](#logger)
      - [Parsers](#parsers)
      - [Process](#process)
    - [Metadata](#metadata)
      - [Kind](#kind)
      - [Name](#name)

## File

The config file must be a YAML document with a service definition for `kind: bot` as the root object.

### Custom Types

Custom YAML types are available in the config to include environment variables and other config files.

#### Env

The `!env` tag will read its value from `process.env`:

```yaml
foo: !env bar
```

Will produce `{foo: process.env['bar']}`.

#### Include

The `!include` tag will include another YAML file:

```yaml
foo: !include /data/other.yml
bar: !include ./data/other.yml
```

With `/data/other.yml` containing:

```yaml
bar:
  - 1
  - 2
  - 3
```

Will produce `{foo: {bar: [1, 2, 3]}}`.

Relative paths will be resolved from the directory where the main bundle resides (Node's `__dirname` semantics).

#### Regexp

The `!regexp` tag will define a regular expression:

```yaml
foo: !regexp /bar/g
```

Is equivalent to the JS `/bar/g/` expression and will match `'bar'` anywhere in a string.

### Search Paths

Config will be loaded from `isolex.yml` or `.isolex.yml`, located in one of:

1. the *directory* indicated by `${ISOLEX__HOME}` (if set)
1. the *directory* indicated by `${HOME}` (again, if set)
1. the current working directory (`__dirname`)
1. any extra paths passed

The first file discovered will be loaded and used.

## Bot Definition

Each type of service is grouped into a config section.

### Data

When an instance is being configured, the block must have a `type` field with the registered name (usually kebab-case)
of the class being created. This is passed to the DI container to locate services when the bot is started. For example:

```yaml
filters:
  - type: user-filter
    ignore: [ssube]
```

The `type` field is *not* passed to the object being created. It already knows what it did.

#### Controllers

A list of type-config objects for each [`Controller`](../src/controller/Controller.ts) created by the bot.

#### Filters

A list of type-config objects for each [`Filter`](../src/filter/Filter.ts) created by the bot.

#### Intervals

A list of type-config objects for each [`Interval`](../src/interval/Interval.ts) created by the bot.

#### Listeners

A list of type-config objects for each [`Listener`](../src/listener/Listener.ts) created by the bot.

#### Logger

`logger` is not a list (surprise!). Instead, it is passed to the
[bunyan logger](https://github.com/trentm/node-bunyan#constructor-api) as constructor options.

The only required field is a `name: string`.

*Note*: This does not currently support bunyan streams or serializers, but should in the future.

#### Parsers

A list of type-config objects for each [`Parser`](../src/parser/Parser.ts) created by the bot.

#### Process

Process-specific (as opposed to cluster-level) configuration.

The only required field is `pid`, containing a `file: string`. The bot's process ID (`pid`) will be written to this
file, for make targets and service monitors to use when reloading or stopping the bot.

### Metadata

#### Kind

The root `kind` must be `bot`.

#### Name

The bot's name, used to log.
