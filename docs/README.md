# isolex Documentation

Hopefully this explains what the bot is and how it works.

## Architecture

Incoming events from the chat client (currently SO) are `parsed` into commands, with consistent fields and data. Those
commands are then `handled`, with replies being sent back through the bot. Between each stage, data is `filtered`.