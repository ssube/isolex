# Documentation

Hopefully this explains what the bot is and how it works.

- [Documentation](#documentation)
  - [Amazon Lex](#amazon-lex)
  - [Architecture](#architecture)
  - [Concepts](#concepts)
  - [Config](#config)
  - [Developing](#developing)
  - [Getting Started](#getting-started)
  - [Roadmap](#roadmap)
  - [Service Reference](#service-reference)
  - [Workflow](#workflow)

## Amazon Lex

Please see [the lex docs](./concept/lex.md) for the Lex model and how intents are mapped to commands.

## Architecture

Please see [the architectural docs](./concept/arch.md) for an explanation of how messages are parsed, how commands are
executed, and what the services do within the bot.

## Concepts

For more detail on some of the architectural concepts:

- [Amazon Lex integration](./concept/lex.md)
- [Authentication & Authorization](./concept/auth.md)
- [Completion](./concept/completion.md)
- [Config](./concept/config.md)
- [GraphQL API](./concept/graph.md)
- [Logging](./concept/logging.md)
- [Sessions](./concept/sessions.md)

## Config

Please see [the config docs](./concept/config.md) for the config schema and search path for config files.

## Developing

Please see [the dev docs](./dev) for the development process and instructions on how to build the bot.

## Getting Started

Please see [the getting started guide](./getting-started.md) for an introduction to the bot, config, and general
usage.

## Roadmap

Please see [the project roadmap](./roadmap.md) for a high-level roadmap of planned features.

## Service Reference

Documentation for individual services is organized by service type:

- [Controller](./controller)
- [Filter](./filter)
- [Listener](./listener)
- [Parser](./parser)

## Workflow

Please see [the workflow docs](./workflow.md) for issue types and the PR process.
