# Source

This readme documents what lives in this directory and some of the decisions.

## Services

Services consist of two parts: the class (or service interface) and the `Data` interface. Both interfaces (in the index
file) and implementations (in individual files) MUST define a data interface. The data interface and schema definition
MUST match.

Services SHOULD NOT declare an `Options` interface. The `BotServiceOptions` expose all available dependencies from the
`BotModule`.
