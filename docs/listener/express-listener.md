# Express Listener

The express listener is responsible for listening on an HTTP port and routing requests. It can set up a GraphQL
endpoint and host the GraphiQL discovery tool.

The default completion controller is defined in [this config fragment](./completion-controller.yml).

## Config

### `defaultTarget`

The default listener to which replies will be sent, if the command does not have its own target.

### `expose`

Endpoints and sub-services to expose.

#### `graph`

> boolean

Enable the GraphQL endpoint.

Required for GraphiQL.

#### `graphiql`

> boolean

Enable the GraphiQL discovery tool.

#### `metrics`

> boolean

Enable the Prometheus metrics endpoint.

### `listen`

#### `address`

The host address on which the server will listen.

Setting this to `0.0.0.0` will listen on every interface.

#### `port`

The port on which to bind.

This should be a port greater than 1024. Ports below 1024 are reserved for system processes. To serve
`http://example.com/` requests without a port in the URL, run a load balancer like nginx in front of the bot.

### `token`

Please see [the auth docs](../concept/auth.md#issuer) for details about tokens.

The `audience`, `issuer`, and `secret` fields are required.

#### `scheme`

The expected scheme for any authorization headers.

To accept OAuth bearer tokens (which these tokens are not), set this to `bearer`.
