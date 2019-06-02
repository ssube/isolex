# Services

- [Services](#services)
  - [Types](#types)
  - [Out of Tree Services](#out-of-tree-services)

## Types

- Controllers execute commands and cause side effects, persist entities, etc.
- Endpoints work with the `ExpressListener` to implement custom endpoints.
- Filters check and remove Commands and Messages from the bot's streams.
- Intervals emit a Message or Command occasionally.
- Listeners connect to a chat service, listen for new Messages, and send outgoing Messages.
- Parsers turn Message bodies into useful Commands.
- Transforms modify data as it passes between Messages and Commands

## Out of Tree Services

Out-of-tree services are provided by external modules, required while the bot is starting and added to the DI
container.

[This example out-of-tree service](https://github.com/ssube/isolex-oot-example) implements the bare minimum to define
and load a service.
