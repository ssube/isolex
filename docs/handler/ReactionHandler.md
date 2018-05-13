# Reaction Handler

## Config

```yaml
handlers:
  - type: reaction-handler
    name: reaction
    field: body
    reactions:
      ghost:
        - chance: 0.01
          name: ghost
      maple:
        - chance: 0.5
          name: maple_leaf
```

## Examples

> input: `trees! everywhere, maple trees!`
>
> reply: `:maple_leaf:`

## Usage

When a command matches, the handler will reply to the thread with an empty body and any matching reactions.
