# Intervals

Intervals emit a command, event, or message on a regular interval.

## Cron Interval

The cron interval uses [a cron pattern](https://www.npmjs.com/package/cron#available-cron-patterns) to match time,
running each time the expression matches.

For example, `* * * * * *` matches everything (a wildcard in every position) and runs every second, while
`0 0 * * * *` runs at the beginning of every hour.

## Time Interval

The time interval uses a math expression, expecting time units, and converted to seconds.