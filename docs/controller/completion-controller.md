# Completion Controller

The completion controller is responsible for saving and executing completion fragments.

Without at least one completion controller loaded, the bot will not be able to prompt users for missing data.

The default completion controller is defined in [this config fragment](./completion-controller.yml).

## Config

### `defaultTarget`

The default listener to which replies will be sent, if the command does not have its own target.

### `filters`

Filters are used to check incoming commands, as usual.

### `transforms`

Transforms are not currently used.
