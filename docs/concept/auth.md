# Auth

This document covers the authentication and authorization system used by the bot, implemented via the auth controller
and context.

- [Auth](#auth)
  - [Authorization](#authorization)
    - [Entity](#entity)
      - [Command Entity](#command-entity)
      - [Message Entity](#message-entity)
    - [Syntax](#syntax)
      - [Match Syntax](#match-syntax)
      - [Query Syntax](#query-syntax)
  - [Authentication](#authentication)
    - [Getting Started](#getting-started)
    - [Login](#login)
    - [Session](#session)

## Authorization

### Entity

#### Command Entity

Commands permissions are used by controllers to filter incoming commands. They use the form `scope:name:noun:verb`,
with the controller's `scope` and `name`.

#### Message Entity

Message permissions are used by listeners and parsers to filter incoming messages and by listeners to filter outgoing
messages. They use the form `scope:name:type`, with the listener or parser's `kind` and `name` and message's `type`.

### Syntax

#### Match Syntax

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

#### Query Syntax

To query permissions, replace one section with the `?` operator. The result of the query will be all allowed values for
that section.

For example:

- with the grants `office:door:*` and `factory:equipment:drill`
- the query `office:door:?` will return `*`
- the query `office:?` will return `door`
- the query `factory:equipment` will return `drill`

```
TODO: example
```

## Authentication

### Getting Started

To create a new user and role with the reference config, please run:

```none
!!args --noun role --verb create --name test_role --grants foo
!!join --name test_user --roles test_role
!!login --name test_user
!!args --noun token --verb list
!!args --noun token --verb create --grants test
```

### Login

To log in with the reference config, please run:

```none
!!login --name test_user
```

### Session

Session is managed by the listeners and attached a `uid` (unique user ID, meaningful to the listener) to a `User`
entity suitable for creating `Context`. Not all listeners maintain sessions; HTTP uses `Authentication` header tokens,
which extend session, and does not need to track them outside of the request scope. Listeners that work with logged in
users, like most chat applications, should support keeping the user logged in. This is a convenience and may be
disabled for security reasons.