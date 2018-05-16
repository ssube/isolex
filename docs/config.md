# Config

The [reference configuration may be found here](./isolex.yml). The rest of this document breaks down the sections and
custom types available.

## Load Order

Config will be loaded from YAML document named `.isolex.yml` located in one of:

1. the *directory* indicated by `${ISOLEX_HOME}` (if set)
1. the *directory* indicated by `${HOME}` (again, if set)
1. the current working directory (`__dirname`)
1. any extra paths passed

Only the first file will be loaded and used.

## Sections

Each type of service is grouped into a config section.

### Services

When an instance is being configured, the block must have a `type` field with the registered name (usually kebab-case)
of the class being created. This is passed to the DI container to locate services when the bot is started. For example:

```yaml
filters:
  - type: user-filter
    ignore: [ssube]
```

The `type` field is *not* passed to the object being created. It already knows what it did.

### Filters

A list of type-config objects for each [`Filter`](../src/filter/Filter.ts) created by the bot.

### Handlers

A list of type-config objects for each [`Handler`](../src/handler/Handler.ts) created by the bot.

### Intervals

A list of type-config objects for each [`Interval`](../src/interval/Interval.ts) created by the bot.

### Listeners

A list of type-config objects for each [`Listener`](../src/listener/Listener.ts) created by the bot.

### Logger

`logger` is not a list (surprise!). Instead, it is passed to the
[bunyan logger](https://github.com/trentm/node-bunyan#constructor-api) as constructor options.

The only required field is a `name: string`.

*Note*: This does not currently support bunyan streams or serializers, but should in the future.

### Parsers

A list of type-config objects for each [`Parser`](../src/parser/Parser.ts) created by the bot.

## Types

Custom YAML types are available in the config to include environment variables and other config files.

### Env

The `!env` tag will read its value from `process.env`:

```yaml
foo: !env bar
```

Will produce `{foo: process.env['bar']}`.

### Include

The `!include` tag will include another YAML file:

```yaml
foo: !include /data/bar.yml
```

With `/data/bar.yml` containing:

```yaml
bar:
  - 1
  - 2
  - 3
```

Will produce `{foo: {bar: [1, 2, 3]}}`.
