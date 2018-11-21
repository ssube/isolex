# YAML Parser

This `Parser` turns `text/json` and `text/yaml` messages into structured data.

- [YAML Parser](#yaml-parser)
  - [Config](#config)
    - [Types](#types)
      - [Include](#include)
      - [Env](#env)

## Config

### Types

#### Include

Enable the `!include` type. This allows YAML to include files from within the `root` path.

#### Env

Enable the `!env` type. This allows YAML to use environment variables.