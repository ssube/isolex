# Entity

Entities are classes with TypeORM annotations and a backing table.

## Base Entities

Base entities do not have their own table, only annotations. They cannot be instantiated, but typically have state and
some methods to manipulate it.

When an entity needs a `data` or `labels` map, inherit from the base entity class.