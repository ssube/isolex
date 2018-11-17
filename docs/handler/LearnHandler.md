# Learn Controller

The learn controller handles learning new commands.

## Config

## Examples

> input: `add solve 's(x) = simplify("x^2 / x", {x: x});'`
>
> reply: Command 'solve' learned.
>
> input: `solve math s(10)`
>
> reply: `10`

## Usage

The learn controller allows creating, deleting, and executing commands. The mode is passed as the first argument; if no
mode is specific (any other string passed instead), execute will be assumed.

### Create

To create a new command, pass the name of the trigger and any arguments:

> input: `add test "a b" c`
>
> reply: Command 'test' learned.

The trigger `test` will create a command with the args `["a b", c]`.

### Delete

To delete an existing command, pass the trigger name:

> input: `del test`
>
> reply: Command 'test' removed.

### Execute

To execute an existing command, pass the trigger name, destination controller (command name), and any arguments:

> input: `run test 1 2 3`
>
> reply: `"a b", c, 1, 2, 3`
