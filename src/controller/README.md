# Controllers

Controllers are services that execute commands and cause side effects, usually handling a few nouns. Controllers often
modify entities or call some external API, but may also trigger a completion or reply.

- [Controllers](#controllers)
  - [Config](#config)
  - [Developing](#developing)
  - [Commands](#commands)
    - [Nouns](#nouns)
    - [Verbs](#verbs)
    - [Data](#data)
      - [`collectOrComplete` Helper](#collectorcomplete-helper)

## Config

See [docs/controller](../../docs/controller) for example config for each controller.

## Developing

Most controllers should extend the `BaseController`, which implements noun and filter checks, as well as transforms.

Controllers typically handle a few nouns. To keep the noun/verb logic simple, controllers use a decorator for each
handler method:

```typescript
@Handler(NOUN_FOO, CommandVerb.Create)
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

When a command is received, the first handler which matches both the noun and verb will be selected. If the handler
also has the `@CheckRBAC` decorator, grants will be checked and may cause an error reply *instead of* invoking the
handler.

Errors thrown during a handler method, sync or async, will be caught by the base controller and the message used as a
reply.

## Commands

### Nouns

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

### Verbs

Verbs mimic HTTP and k8s verbs:

| Verb   | Actions                                               |
|--------|-------------------------------------------------------|
| Create | Insert a new entity, perform a one-time action        |
| Delete | Remove an existing entity, destroy something          |
| Get    | View single entities (typically with details)         |
| Help   | Print contextual help for a command                   |
| List   | View many entities (typically as summaries)           |
| Update | Update an existing entity, complete a previous action |

### Data

Commands have some data attached.

#### `collectOrComplete` Helper

This helper function will collect a type-safe set of fields from a command's data, or create a completion command to
prompt users for the missing fields.

Until Typescript is able to infer the return type, it must be passed as the generic type:

```typescript
interface GetData {
  namespace: string;
}

const results = collectOrComplete<GetData>(cmd, defaults);
```
