# Schema

The config file is stored as a YAML document, parsed in a JS object, then validated (twice, in fact) with a JSON schema.

The whole config object is validated using [the default schema's root](../isolex.yml#L737). Each service constructor is
responsible for validating its `data` using the appropriate service definition (`isolex#/definitions/service-*`).

## Graph Schema

The GraphQL schema is defined in code. Objects are defined with the interface or entity class, with miscellaneous types
living in [the `schema/graph` directory](../../src/schema/graph).

## JSON Schema

The JSON schema is validated by [ajv](https://ajv.js.org/).

## YAML Schema

The default schema adds a few custom keywords to support the custom types in the YAML schema.

### Regexp

The `regexp` keyword takes a boolean value, checking whether the value is or is not an instance of the native regexp
type, or an object with the string `flags`, checking the regexp instance's flags.

For example:

```yaml
foo:
  type: object
  properties:
    regexp:
      regexp: true # must be a regexp
    string:
      regexp: false # must not be a regexp
      type: string

bar:
  regexp: gu # must have global and unicode flags set
```
