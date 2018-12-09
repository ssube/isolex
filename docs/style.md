# Style

This document covers Typescript and YAML style, explains some lint rules, and major conventions.

- [Style](#style)
  - [Documentation](#documentation)
    - [Headers](#headers)
    - [Table of Contents](#table-of-contents)
  - [Naming](#naming)
    - [Commands](#commands)
    - [Messages](#messages)
  - [Paths](#paths)
  - [Typescript](#typescript)
    - [Destructuring](#destructuring)
    - [Entities](#entities)
    - [Exports](#exports)
    - [Imports](#imports)
      - [Order](#order)
    - [Properties](#properties)
    - [Tests](#tests)
      - [Async](#async)
      - [Assertions](#assertions)
  - [YAML](#yaml)

## Documentation

Write it!

### Headers

Make sure headers are unique. Duplicate headers will not link correctly and are not helpful. When in doubt, include
the previous header: `### Documentation Headers`

### Table of Contents

Create a table of contents for any document with more than three headers.

Always keep the table of contents up to date.

## Naming

### Commands

Commands are emitted or executed. (TODO: decide)

### Messages

Messages are sent.

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

Dictionary objects (`{...}`) must always be treated as immutable.

### Destructuring

Destructuring is great, use it! Groups should be `{ spaced, out }` like imports (lint will warn about this, code can
fix it).

Never nest destructuring. Defaults are ok.

Prefer destructuring with default over `||`. For example, `const { foo = 3 } = bar;` over `const foo = bar.foo || 3;`.

### Entities

Always provide the table name as an exported constant and use it in `@Entity(TABLE_FOO)` and the migrations.

### Exports

Never use default exports.

Do not ever `export default` anything ever.

### Imports

Never use `../` imports. Use `src/` or `test/` instead. Local `./` imports _are_ allowed.

Always `import { by, name }`, unless using a broken old library that required `import * as foo`.

#### Order

1. Libraries
1. `src/`
1. `test/`
1. `./`

Ensure imports are sorted alphabetically, even within a single line. Your editor should be able to do this for you,
because it is extremely tedious to do by hand.

### Properties

Object properties should not be nullable or optional unless absolutely needed. Prefer sensible defaults.

### Tests

Typescript tests (small, unit tests) are run using Mocha and Chai.

#### Async

Wrap any tests using async resources (promises, observables, the bot, services, pretty much anything) in the
`describeAsync` and `itAsync` helpers. These will track and report leaking async resources.

#### Assertions

Always use `expect`-style assertions.

Use `.to.equal(true)` instead of `.to.be.true`, since the call helps the assertion happens and appeases lint.

## YAML

Indent lightly, anchor well.
