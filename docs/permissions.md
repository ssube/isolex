# Permissions

This document covers permissions used by the bot and auth controller.

- [Permissions](#permissions)
  - [Entity](#entity)
    - [Command Entity](#command-entity)
    - [Message Entity](#message-entity)
  - [Syntax](#syntax)
    - [Match Syntax](#match-syntax)
    - [Query Syntax](#query-syntax)

## Entity

### Command Entity

Commands permissions are used by controllers to filter incoming commands. They use the form `scope:noun:verb`.

### Message Entity

Message permissions are used by listeners and parsers to filter incoming messages and by listeners to filter outgoing
messages. They use the form `scope:kind:name:type`, with the listener or parser's `kind` and `name`.

## Syntax

### Match Syntax

Permissions use the Shiro syntax, originally from [Apache Shiro](https://shiro.apache.org/permissions.html), as
implemented by [shiro-trie](https://www.npmjs.com/package/shiro-trie). Sections are delimited by colons, lists are
delimited by commas, and `*` is a wildcard.

For example:

- `office,factory:door:outside,office` allows all of:
  - `office:door:outside`
  - `office:door:office`
  - `factory:door:outside`
  - `factory:door:office`

Each section can specify one or more values, or the `*` (anything) wildcard.

### Query Syntax