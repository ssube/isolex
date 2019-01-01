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

Controllers typically handle a few nouns. To keep the noun/verb logic simple, controllers use a set of decorators:

```typescript
@HandleNoun(NOUN_FOO)
@HandleVerb(CommandVerb.Create)
public async createFoo(cmd: Command) {
  const foo = await this.fooRepository.create({ /* ... */ });
  return this.transformJSON(foo);
}
```

Grants can be checked with the RBAC decorator:

```typescript
@CheckRBAC({
  defaultGrant: true, /* check the noun:verb grant along with any others */
  grants: ['special:grant'], /* other required grants */
  user: true, /* require a logged in user */
})
public async getFoo(cmd: Command) {
  /* ... */
}
```

Errors thrown during a handler method, sync or async, will be caught by the base controller and the message used as a
reply.

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
