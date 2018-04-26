# Config

Config will be loaded from YAML document named `.isolex.yml` located in one of:

1. the *directory* indicated by `${ISOLEX_HOME}` (if set)
1. the *directory* indicated by `${HOME}` (again, if set)
1. the current directory

Only the first file will be loaded and used.

The [reference configuration may be found here](./isolex.yml). The following headers break down each section.

When an instance is being configured, the block must have a `type` field with the registered name (usually kebab-case)
of the class being created. This is passed to the DI container to locate services when the bot is started. For example:

```yaml
filters:
  - type: user-filter
    ignore: [ssube]
```

The `type` field is *not* passed to the object being created. It already knows what it did.

## Filters

A list of type-config objects for each [`Filter`](../src/filter/Filter.ts) created by the bot.

## Handlers

A list of type-config objects for each [`Handler`](../src/handler/Handler.ts) created by the bot.

## Intervals

A list of type-config objects for each [`Interval`](../src/interval/Interval.ts) created by the bot.

## Logger

`logger` is not a list (surprise!). Instead, it is passed to the
[bunyan logger](https://github.com/trentm/node-bunyan#constructor-api) as constructor options.

The only required field is a `name: string`.

*Note*: This does not currently support bunyan streams or serializers, but should in the future.

## Parsers

A list of type-config objects for each [`Parser`](../src/parser/Parser.ts) created by the bot.

## Stack

`stack` is passed to the [SO client](https://github.com/xbenjii/so-client/) as constructor options.
