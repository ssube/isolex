# Style

This document covers Typescript and YAML style, explains some lint rules, and major conventions.

- [Style](#style)
  - [Documentation](#documentation)
    - [Headers](#headers)
    - [Table of Contents](#table-of-contents)
  - [Naming](#naming)
    - [Abbreviations](#abbreviations)
    - [Commands](#commands)
    - [Messages](#messages)
  - [Paths](#paths)
  - [Typescript](#typescript)
    - [Arrays](#arrays)
    - [Arrow Functions ("lambdas")](#arrow-functions-%22lambdas%22)
    - [Async](#async)
    - [Constructors](#constructors)
    - [Destructuring](#destructuring)
    - [Entities](#entities)
    - [Errors](#errors)
    - [Exports](#exports)
    - [Generics](#generics)
    - [Imports](#imports)
      - [Order](#order)
    - [Null](#null)
    - [Properties](#properties)
    - [Return Types](#return-types)
    - [Ternaries](#ternaries)
    - [Tests](#tests)
      - [Async Tests](#async-tests)
      - [Assertions](#assertions)
  - [YAML](#yaml)

## Documentation

Write it!

### Headers

Make sure headers are unique. Duplicate headers will not link correctly and are not helpful. When in doubt, include
the previous header:

`### Documentation Headers`

### Table of Contents

Create a table of contents for any document with more than three headers.

Always keep the table of contents up to date. The VS Code markdown plugin can handle this.

## Naming

### Abbreviations

There are a few long class names and commonly-abbreviated terms in use. In order to keep variable names and issues
consistent, the following should be used:

| long       | short | plural      | avoid |
|------------|-------|-------------|-------|
| message    | msg   | messages    | msgs  |
| command    | cmd   | commands    | cmds  |
| context    | ctx   | contexts    |       |
| controller | ctrl  | controllers |       |
| listener   | lstn  | listeners   |       |
| transform  | xfmr  | transforms  |       |

If a class or entity does not appear here (such as user, role, and token), please do not shorten it unnecessarily.

### Commands

Commands are executed and received.

### Messages

Messages are sent and received.

## Paths

| Path          | What Is                                                       |
|---------------|---------------------------------------------------------------|
| config/       | tool configuration                                            |
| deploy/       | kubernetes resources                                          |
| docs/         | documentation                                                 |
| node_modules/ | installed dependencies (not committed)                        |
| out/          | build output (not committed)                                  |
| scripts/      | helper scripts                                                |
| src/          | typescript source                                             |
| test/         | mocha tests                                                   |
| vendor/       | vendored (inlined, submoduled, etc) dependencies and typedefs |

## Typescript

Dictionary objects (`{...}`) SHOULD always be treated as immutable and MUST never have properties added after being
declared. If the properties may be undefined, they SHOULD be declared with `?: types`.

If the shape of the object is unknown or variable, it MUST be declared with the `Dict` type and treated as an index-
only object (no `.property` access). These SHOULD be converted into `Map`s, `Set`s, or another proper collection as
soon as possible.

### Arrays

Arrays MUST use generic types (`Array<Foo>`). The `Foo[]` types do not always nest correctly.

Empty arrays MUST be declared with `[]`.

### Arrow Functions ("lambdas")

Arrow function parameters MUST use parentheses, even when there is only one, and *especially* when there are none.

If the body is a single statement, a function call, or otherwise fits well on a single line, braces SHOULD be omitted.
If the body returns an object literal or needs more than one line (excluding nested object literals), braces
MUST be used.

### Async

Async code MUST use promises. Callbacks MUST be wrapped to create and resolve (or reject) a promise.

Functions returning a promise SHOULD be `async` and `await` MAY be used inside them, but MAY also return plain promises
when no `await` is needed.

### Constructors

Classes should have a constructor if it contains more than a `super(options)` call.

Service constructors must always take `options: FooOptions` as the first argument, where
`FooOptions extends ChildServiceOptions` (or `BaseServiceOptions` for services that live outside the bot).
This ensures that injected dependencies from the bot and service module will be available and typed correctly.

### Destructuring

Destructuring is great and SHOULD be used. Braces MUST be `{ spaced, out }` (lint will warn about this, VS Code can
fix it).

Destructuring MUST NOT be nested.

Default values SHOULD be used instead `||`. For example, `const { foo = 3 } = bar;` over `const foo = bar.foo || 3;`.

### Entities

Always provide the table name as an exported constant and use it in `@Entity(TABLE_FOO)` and the migrations.

### Errors

Throw must always throw a new instance of `BaseError` or something which inherits from `BaseError`.

Error messages must be literals and should not use template strings (although they may if the values are limited, like
HTTP error codes). Errors may pass nested errors from other libraries, the stack trace should show everything.

### Exports

Modules MUST NOT use default exports (`export default`) or export a single symbol (`export =`).

### Generics

Array types MUST use generic arrays (see [arrays](#arrays)).

Generic type names MUST start with `T` and SHOULD have a somewhat meaningful name. For example: `TData`, `TConfig`,
`TKey` and `TValue`.

### Imports

Imports MUST NOT start with `../`. Use `src/` or `test/` instead. Imports MAY start with `./`.

Imports MUST use destructuring (`import { by, name }`) and MAY rename imports. When using a broken old library, it may
be necessary to `import * as foo`, but destructuring should still be used if possible.

Long imports MUST be broken across lines as if they were object literals.

#### Order

1. Libraries
1. `src/`
1. `test/`
1. `./`

Imports MUST be sorted alphabetically, even within a single line. Your editor should be able to do this for you,
because it is extremely tedious to do by hand.

### Null

Null MUST NOT be used.

Null SHOULD NOT exist.

### Properties

Object properties SHOULD NOT be optional (`?: type` or `| undefined`) unless necessary. Prefer sensible defaults. This
sort of doesn't apply to entities, though.

Properties MUST NOT be nullable (`| null` or set to `null`).

### Return Types

Be consistent with return types. If one method returns a promise, there's a good chance they all do.

Prefer `Array<Foo>` over `Foo | undefined`. If you can return 0 of them, you can probably return 2.

### Ternaries

Ternaries SHOULD NOT be used, but MAY be used with `return` or assignments.

Ternaries MUST NOT be nested.

### Tests

Typescript tests (small, unit tests) are run using Mocha and Chai.

#### Async Tests

Wrap any tests using async resources (promises, observables, the bot, services, pretty much anything) in the
`describeAsync` and `itAsync` helpers. These will track and report leaking async resources.

#### Assertions

Always use `expect`-style assertions.

Use `.to.equal(true)` instead of `.to.be.true`, since the call helps the assertion happens and appeases lint. Same with
false.

## YAML

Indent lightly, anchor well.
