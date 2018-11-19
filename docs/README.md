# Documentation

Hopefully this explains what the bot is and how it works.

## Architecture

Incoming events from the chat client (currently SO) are `parsed` into commands, with consistent fields and data. Those
commands are then `handled`, with replies being sent back through the bot. Between each stage, data is `filtered`.

The flow is:

```none
                                   cron -----> interval
                                                  |
                                                  v
listener -> <message> -> filter -> parser --> <command> <---\
                                                  |         |
                                                  v         |
                                               filter       |
                                                  |         |
                                                  v         |
listener <---------------------- <message> <- controller ---/
```

*With `<class>` denoting an entity.*

Within each parser:

```none
           |-         parser        -|

<message> --> filters -> pre-transforms
                               |
<command> <---+----------------/
              |
<fragment> <--/
```

Within each controller:

```none
           |-               controller                  -|

<command> --> filters -> pre-transforms -> side-effects
                                                |
                                                |
                                                v
<response> <-- post-transforms <------------ <data>
```

### Incoming

The `listener -> filter -> parser` sequence handles user input, filtering messages that should be ignored before
matching and parsing messages into executable commands. Each `parser` is checked and potentially run, so a single
incoming message can produce any number of commands (and may not produce them immediately, so context must be
passed).

### Execution

The `filter -> controller` pair behaves similarly, filtering commands and performing some work based on them. For each
`<command>`, the `controller`s are checked in order until one is found that can handle the `<command>`, which is then
passed to the `controller` and consumed. Only a single controller will be run for each command.

### Outgoing

The bot handles an outgoing message queue, dispatched to `listener`s based on the message context. Listeners may
implement their own rate limiting and add failed messages back to the queue after some delay.
