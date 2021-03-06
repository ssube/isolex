# Build

This section describes what build targets and tools are used, which libraries and utilities are available, and how to
make it go.

- [Build](#build)
  - [Libraries](#libraries)
  - [Style](#style)

## Libraries

When installing libraries, prefer a `~` version range and set the `major.minor` components (`~X.Y`) unless the
library is still a `0.0` release, then specify the entire `^X.Y.Z` specifier.

| task         | library      | location    | usage                               | notes            |
|--------------|--------------|-------------|-------------------------------------|------------------|
| AWS          | aws-sdk      | main bundle | `import {} from 'aws-sdk'`          |                  |
| cron         | cron         | main bundle |                                     |                  |
| database     | sqlite3      | production  |                                     |                  |
| database     | typeorm      | main bundle | `@Inject(INJECT_STORAGE)`           | entity orm       |
| DI           | noicejs      | main bundle | `constructor` options container     |                  |
| emoji        | node-emoji   | main bundle |                                     | GFM `:emoji:`    |
| jsonpath     | jsonpath     | main bundle | `@Inject(INJECT_JSONPATH)`          | via DI           |
| logging      | bunyan       | main bundle | `@Inject(INJECT_LOGGER)`            | via DI           |
| math         | mathjs       | main bundle | `@Inject(INJECT_MATH)`              | via DI           |
| request      | request      | main bundle | `container.create('request')`       | via DI           |
| string       | split-string | main bundle |                                     | quotes, brackets |
| template     | handlebars   | main bundle | `@Inject(INJECT_COMPILER)`          | via DI           |
| test asserts | chai         | test bundle | `import {} from 'chai'`             |                  |
| test leaks   | test/utils   | test bundle | `import {} from 'test/utils/async'` | test wrappers    |
| test mocks   | ineeda       | test bundle |                                     |                  |
| yaml         | js-yaml      | main bundle |                                     | custom schema    |

## Style

[The style guide](./style.md) describes naming and code conventions.
