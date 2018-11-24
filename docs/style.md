# Style

This document covers Typescript and YAML style, explains some lint rules, and major conventions.

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

## YAML

Indent lightly, anchor well.

## Documentation

Write it!

### Headers

Make sure headers are unique. Duplicate headers will not link correctly and are not helpful. When in doubt, include
the previous header: `### Documentation Headers`

### Table of Contents

Create a table of contents for any document with more than three headers.

Always keep the table of contents up to date.