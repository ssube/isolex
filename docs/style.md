# Style

This document covers Typescript and YAML style, explains some lint rules, and major conventions.

- [Style](#style)
  - [Documentation](#documentation)
    - [Headers](#headers)
    - [Table of Contents](#table-of-contents)
  - [Paths](#paths)
  - [Typescript](#typescript)
    - [Exports](#exports)
    - [Imports](#imports)
      - [Order](#order)
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
