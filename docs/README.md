# Documentation

Hopefully this explains what the bot is and how it works.

- [Documentation](#documentation)
  - [Getting Started](#getting-started)
  - [Architecture](#architecture)
    - [Incoming Messages](#incoming-messages)
      - [Completion](#completion)
    - [Executing Commands](#executing-commands)
    - [Outgoing Messages](#outgoing-messages)
  - [Amazon Lex](#amazon-lex)
  - [Build](#build)
  - [Config](#config)
  - [Concept](#concept)
  - [Service Reference](#service-reference)
  - [Workflow](#workflow)

## Getting Started

Please see the [getting started guide](./getting-started.md).

## Architecture

Incoming events from the chat client are `parsed` into commands, with consistent fields and data. Those
commands are then `handled`, with replies being sent back through the bot. Between each stage, data is `filtered`.

The flow is:

```none
                                               interval
                                                  |
                                                  v
listener -> <message> -> filter -> parser --> <command> <---\
                                                  |         |
                                                  v         |
                                               filter       |
                                                  |         |
                                                  v         |
listener <---------------------- <message> <- controller ---/
```

*With `<class>` denoting an entity.*

Within each parser:

```none
           |-         parser        -|

<message> --> filters -> pre-transforms
                               |
<command> <---+----------------/
              |
<fragment> <--/
```

Within each controller:

```none
           |-               controller                  -|

<command> --> filters -> pre-transforms -> side-effects
                                                |
                                                |
                                                v
<response> <-- post-transforms <------------ <data>
```

### Incoming Messages

The `listener -> filter -> parser` sequence handles user input, filtering messages that should be ignored before
matching and parsing messages into executable commands. Each `parser` is checked and potentially run, so a single
incoming message can produce any number of commands (and may not produce them immediately, so context must be
passed).

#### Completion

Sometimes a message is parsed and valid, but incomplete. When this happens, the bot issues a `fragment:create` command
used to complete the command later. This is powered by the completion controller, but works with any parser
implementing the `complete` method.

### Executing Commands

The `filter -> controller` pair behaves similarly, filtering commands and performing some work based on them. For each
`<command>`, the `controller`s are checked in order until one is found that can handle the `<command>`, which is then
passed to the `controller` and consumed. Only a single controller will be run for each command.

### Outgoing Messages

The bot handles an outgoing message queue, dispatched to `listener`s based on the message context. Listeners may
implement their own rate limiting and add failed messages back to the queue after some delay.

## Amazon Lex

Please see [the lex docs](./concept/lex.md) for information on the Lex model and how intents map to commands.

## Build

Please see [the build docs](./build) for information on the development process and how to build the bot.

## Config

Please see [the config docs](./concept/config.md) for information on the config schema and search path.

## Concept

Documentation detailing the architectural concepts:

- [Amazon Lex integration](./concept/lex.md)
- [Authentication & Authorization](./concept/auth.md)
- [Completion](./concept/completion.md)
- [Config](./concept/config.md)
- [GraphQL API](./concept/graph.md)
- [Logging](./concept/logging.md)
- [Sessions](./concept/sessions.md)

## Service Reference

Documentation for individual services is organized by service type:

- [Controller](./controller)
- [Filter](./filter)
- [Listener](./listener)
- [Parser](./parser)

## Workflow

Please see [the workflow docs](./workflow.md) for issue types and the PR process.
