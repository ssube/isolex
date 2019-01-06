# Message Interval

The command interval creates and sends a new message with the given body and type.

An example message interval is defined in [this config fragment](./message-interval.yml).

## Config

### `defaultContext`

The command's context.

### `defaultMessage`

The message to send.

### `defaultTarget`

The target listener for replies.

### `frequency`

The cron or time duration on which the interval will execute a new command.

### `transforms`

A set of transforms to be applied to the default message before it is sent. These can be used to interpolate the time
and other tick information into the message.
