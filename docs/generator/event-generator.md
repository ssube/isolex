# Event Interval

The event interval notifies services of a tick event.

An example event interval is defined in [this config fragment](./event-generator.yml).

## Config

### `defaultContext`

The event's context.

### `defaultTarget`

The target listener for replies.

### `frequency`

The cron or time duration on which the interval will execute a new command.

### `services`

The services to notify. An array of service metadata (typically kind and name, although IDs are allowed).
