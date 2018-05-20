# Migrations

This directory contains the TypeORM migrations for each entity schema change.

**Note:** any documentation claiming to use a "UNIX timestamp" requires a *13 digit* timestamp

Each migration should be a class named `DescriptiveName0000000000000` in its own file `0000000000000-DescriptiveName`.
The class must `implements MigrationInterface` to work with the ORM logic.
