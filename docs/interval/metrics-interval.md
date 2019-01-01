# Metrics Interval

The metrics interval collects Prometheus metrics about Node and the system, such as CPU time spent and memory pressure.

An example metrics interval is defined in [this config fragment](./metrics-interval.yml).

## Config

### `defaultContext`

The interval context. Not used.

### `defaultTarget`

The interval target. Not used.

### `frequency`

The cron or time duration on which the interval will collect metrics.
