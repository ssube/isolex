# Controllers

Controllers are services that execute commands and cause side effects, usually handling a few nouns. Controllers often
modify entities or call some external API, but may also trigger a completion or reply.

- [Controllers](#controllers)
  - [Config](#config)
  - [Developing](#developing)
  - [Nouns](#nouns)

## Config

See [docs/controller](../../docs/controller) for example config for each controller.

## Developing

Most controllers should extend the `BaseController`, which implements noun and filter checks, as well as transforms.

Controllers typically handle a few nouns. To keep the noun/verb logic simple, many controllers use a pair of
`switch`es:

```typescript
public handle(cmd: Command) {
  switch (cmd.noun) {
    case NOUN_FOO:
      return this.handleFoo(cmd);
    default:
      return this.reply('unknown noun');
  }
}

public handleFoo(cmd: Command) {
  switch (cmd.verb) {
    case CommandVerb.Get:
      return this.getFoo(cmd);
    default:
      return this.reply('unknown verb');
  }
}
```

Be careful of the 20 method limit on classes. A class that handles three nouns would have one noun switch method, three
verb switch methods, and up to fifteen handlers (nineteen methods total).

Permissions should be implemented early in the handler methods and failures must exit early:

```typescript
public async getFoo(cmd: Command) {
  if (!cmd.context.checkGrants([
    'foo:get',
  ])) {
    return this.reply('permission denied');
  }
}
```

## Nouns

| Noun     | Controller |
|----------|------------|
| account  | Account    |
| counter  | Count      |
| echo     | Echo       |
| fragment | Completion |
| grant    | Account    |
| keyword  | Learn      |
| math     | Math       |
| pick     | Pick       |
| pod      | Kubernetes |
| random   | Random     |
| reaction | Reaction   |
| role     | User       |
| roll     | Dice       |
| sed      | Sed        |
| service  | Kubernetes |
| session  | Account    |
| token    | Token      |
| user     | User       |
| weather  | Weather    |
