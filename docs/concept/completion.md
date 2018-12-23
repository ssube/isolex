# Completion

- [Completion](#completion)
  - [Example](#example)
    - [Lex](#lex)

Parsers may not be able to complete a command from a single message. When that happens, they need to store a fragment
and prompt for completion.

Prompts happen one argument at a time, without any knowledge of other arguments that may yet need to be filled
(knowing would be impossible, since the required arguments may depend on defined ones).

The completion model is based on the programming model of the AWS Lex service, which uses a `slotToElicit` parameter
to indicate that a slot (argument) still needs to be filled.

## Example

### Lex

1. User pings `Bot`
1. `Listener` sends `Message`
1. Lex `Parser` handles `Message`
    1. `Parser` sends message to Lex runtime
        1. Response has `slotToElicit` set
    1. `Parser` creates a completion `Command` (`completion:create`)
1. Completion `Controller` handles `Command`
    1. `Controller` creates and saves `Fragment`
    1. `Controller` sends a `Message` prompting user for argument
1. `Listener` responds to user with completion code
1. User responds with value
1. `Listener` sends `Message`
1. Completion `Parser` handles `Message`
    1. `Parser` extracts next `value`
    1. `Parser` loads `Fragment`
    1. `Parser` forwards `(Fragment, value)` to original `Parser`
1. Lex Parser completes `Fragment`
    1. `Parser` sends next `value` to Lex runtime
    1. `Parser` merges (next) response slots with (prev) fragment arguments
    1. `Parser` executes complete `Command`