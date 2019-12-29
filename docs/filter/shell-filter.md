# Shell Filter

The shell filter executes a shell command (external process(es)) and
uses their exit status to filter events.

## Execution

The `command` is executed with `child_process.spawn` and the filter
value is written to `stdin` as JSON.

The command must exit 0 to allow the value through the filter. Any
other exit status, or writing to `stdout`, will be considered an
error and block the value.

## Config

### `command`

The shell command to be spawned.

### `options`

The spawn `options`, passed through with minimal changes.

#### `options.env`

Since GraphQL does not support dictionaries, `env` is configured as a
list of name-value pairs:

```yaml
data:
  options:
    env:
      - name: ISOLEX_VAR
        value: foo
```
