# isolex Documentation

Hopefully this explains what the bot is and how it works.

## Architecture

Incoming events from the chat client (currently SO) are `parsed` into commands, with consistent fields and data. Those
commands are then `handled`, with replies being sent back through the bot. Between each stage, data is `filtered`.

The flow is:

*With `[class]` denoting an interface, `<class>` denoting a bot primitive, and `(func)` denoting a function call.*

```none
                               (cron) ---> [interval]
                                               |
                                               v
room -> <event> -> [filter] -> [parser] -> <command> <-\
                                               |       |
                                               v       |
                                           [filter]    |
                                               |       |
                                               v       |
room <- (send) <------------- <message> <- [handler] --/
```

The `[filter] -> [parser]` pair handles user input, filtering messages that match strings or to ban users, then parsing
the content into commands. For each incoming `<event>`, each `[parser]` is checked and potentially run, producing
multiple `<command>`s. A single `<event>` can produce any number of `<command>`s.

The `[filter] -> [handler]` pair behaves similarly, filtering commands and performing some work on them. For each
`<command>`, the `[handler]`s are run in order until one returns true and consumes the command.Handlers may
directly reply to users (the `<command>` has reply-to data) or create additional `<command>`s to be handled later
(which should have the reply-to destination attached).

The `(send)` queue has retry logic to dispatch messages on an adjusting interval, with errors increasing the time
between ticks and success decreasing it (see the [cooldown](../src/util/Cooldown.ts)).
