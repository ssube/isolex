# Style

This document covers Typescript and YAML style, explains some lint rules, and major conventions.

- [Style](#style)
  - [Code Climate](#code-climate)
    - [Helpful Views](#helpful-views)
    - [Close Reasons](#close-reasons)
      - [Decorator Complexity](#decorator-complexity)
      - [Super Call Complexity](#super-call-complexity)
      - [Test Data & Fixtures](#test-data--fixtures)
  - [Naming](#naming)
    - [Arguments](#arguments)
    - [Commands](#commands)
    - [Messages](#messages)

## Code Climate

Code Climate runs lint and style checks against the project, on pull requests and the master branch.

[Project maintainability](https://codeclimate.com/github/ssube/isolex) MUST be an A. Technical debt MUST remain
under 1% and SHOULD NOT increase with any PR.

### Helpful Views

- [Exclude complexity and duplicates](https://codeclimate.com/github/ssube/isolex/issues?category%5B%5D=style&category%5B%5D=bugrisk&status%5B%5D=&status%5B%5D=open&status%5B%5D=confirmed&status%5B%5D=invalid&status%5B%5D=wontfix&engine_name%5B%5D=structure&engine_name%5B%5D=duplication&engine_name%5B%5D=fixme&engine_name%5B%5D=tslint&language_name%5B%5D=TypeScript&language_name%5B%5D=Other)
- [TODOs](https://codeclimate.com/github/ssube/isolex/issues?category%5B%5D=complexity&category%5B%5D=duplication&category%5B%5D=style&category%5B%5D=bugrisk&status%5B%5D=&status%5B%5D=open&status%5B%5D=confirmed&status%5B%5D=invalid&status%5B%5D=wontfix&engine_name%5B%5D=fixme&language_name%5B%5D=TypeScript&language_name%5B%5D=Other)

### Close Reasons

Warnings shown here can be closed. Others MUST be fixed.

#### Decorator Complexity

Any complexity warnings around the declaration of a controller's handler method, especially on with decorators, should
be closed as `WONTFIX`.

```typescript
@Handler(NOUN_FOO, CommandVerb.Get)
@CheckRBAC({
  grants: ['a', 'b', 'c']
})
public async getFoo(cmd: Command, ctx: Context) {
  /* ... */
}
```

#### Super Call Complexity

Calling an async super method can trigger a complexity warning:

```typescript
export class ListenerModule extends Module {
  public async configure(options: ModuleOptions) {
    await super.configure(options);
 
    // listeners
```

This should be marked as `INVALID`.

#### Test Data & Fixtures

Any duplication or length warnings related to test data, especially object literals in constructors, and other fixtures
should be marked as `WONTFIX`.

## Naming

### Arguments

Arguments are the `--foo --bar=3` flags passed on the command line. Commands have data, which is not the same thing.

### Commands

Commands SHOULD be executed and received. Commands MUST NOT be emitted.

### Messages

Messages SHOULD be sent and received.

Message types MUST be MIME types.
