# Logging

isolex features extensive logging from most services and within the bot core.

Messages the bot does not respond to **are not logged**, even at debug level. They are none of its business.

Messages the bot *does* respond to **are logged**, along with the commands issued. These logs are printed through
[the bunyan logger](https://github.com/trentm/node-bunyan) and entities (commands, messages, learned triggers) are
saved to the database connection.
