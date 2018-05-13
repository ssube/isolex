# Map Parser

The map parser can match many triggers and emit different messages based on which one matched.

## Config

```yaml
  - type: map-parser
    alias:
      alias: echo
      maple: react
    emit:
      echo:
        name: debug_echo
        fields: []
        remove: true
        rest: args
      react:
        fields: [body]
        name: test_reaction
        remove: false
        rest: args
    name: map_echo
    split:
      brackets: true
      separator: " "
```

## Examples

> input: `echo a b echo c d`
>
> reply: `cmd{name: echo, args: [a, b]}`
> reply: `cmd{name: echo, args: [c, d]}`

## Usage

Messages containing any of the keywords will be split, and a command issued for each keyword found.

Input is split on each keyword, with any unused arguments to the right being passed on.
