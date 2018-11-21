# Utils

For developers, this document explains what libraries and utilities are available in the code base.

## Libraries

| task         | library      | location    | usage                               | notes            |
|--------------|--------------|-------------|-------------------------------------|------------------|
| AWS          | aws-sdk      | main bundle | `import {} from 'aws-sdk'`          |                  |
| cron         | cron         | main bundle |                                     |                  |
| database     | sqlite3      | production  |                                     |                  |
| database     | typeorm      | main bundle | `container.create('storage')`       | entity orm       |
| DI           | noicejs      | main bundle | `constructor` options container     |                  |
| DOM          | cheerio      | main bundle |                                     |                  |
| emoji        | node-emoji   | main bundle |                                     | GFM `:emoji:`    |
| json         | jsonpath     | main bundle | `import * as jp from 'jsonpath'`    |                  |
| logging      | bunyan       | main bundle | `container.create('logger')`        | via DI           |
| math         | mathjs       | main bundle | `import {} from 'mathjs`            |                  |
| request      | request      | main bundle | `container.create('request')`       |                  |
| string       | split-string | main bundle |                                     | quotes, brackets |
| template     | handlebars   | main bundle |                                     |                  |
| test asserts | chai         | test bundle | `import {} from 'chai'`             |                  |
| test leaks   | test/utils   | test bundle | `import {} from 'test/utils/async'` | test wrappers    |
| test mocks   | ineeda       | test bundle |                                     |                  |
| yaml         | js-yaml      | main bundle |                                     | custom schema    |

## Services

| task    | service          | type     | notes |
|---------|------------------|----------|-------|
| discord | discord-listener | Listener |       |

## Utilities

| task      | class     |
|-----------|-----------|
| blacklist | Checklist |
| whitelist | Checklist |
