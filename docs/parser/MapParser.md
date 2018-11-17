# Map Parser

The map parser can match many keywords and emit different messages based on which one matched.

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

### Alias

Each alias defines another keyword and the command it will emit. The value of each alias must be a key in
[`emit`](#emit).

### Emit

Each entry defines a keyword and the command it will emit, with name and destination fields.

Input tokens are placed in output fields based on [`fields`](#fields) and [`rest`](#rest). The original keyword can be
included (as the first item) by setting `remove: false`.

Each item in `fields` will consume one token and add it to the given data field. Any remaining tokens will be added to
the `rest` field.

For example, with the config:

```yaml
echo:
  name: debug_echo
  fields: [body, next]
  remove: true
  rest: args
```

The input string `echo 1 2 3 4` will be split and the keyword `echo` matched. Since `remove` is set, the keyword will
not be included in the output. The emitted command will look like:

```yaml
command:
  name: debug_echo
  data:
    body: [1]
    next: [2]
    args: [3, 4]
```

### Name

The service's name.

### Split

Nested [split-string options](https://www.npmjs.com/package/split-string#options). The most frequently useful are
`brackets` (boolean or object, enable bracket groups) and `separator` (the characters on which to split).

## Examples

> input: `echo a b echo c d`
>
> reply: `cmd{name: echo, args: [a, b]}`
>
> reply: `cmd{name: echo, args: [c, d]}`

## Usage

Messages containing any of the keywords will be split, and a command issued for each keyword found.

Input is split on each keyword, with any unused arguments to the right being passed on.
