# Lex Parser

The Lex parser uses [Amazon Lex]() to interpret natural language (English).

## Intent

The [programming model]() uses "intents" and "slots," which map neatly to the bot's noun, verb, and data. Intents are
split on `_` characters into a `[noun, verb, ...misc]` tuple.
