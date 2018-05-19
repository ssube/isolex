# Workflow

This document describes the issue and merge workflow for isolex.

## Issues

Issues are broken down by the `service` they impact (with `service/other` as a catch-all) and their current `status`.

- [Create a new bug](https://github.com/ssube/isolex/issues/new?template=type_bug.md).
- [Create a new feature](https://github.com/ssube/isolex/issues/new?template=type_feature.md).
- [Create a new update](https://github.com/ssube/isolex/issues/new?template=type_update.md).

### Service

### Status

New issues should be confirmed (to exist, get details, etc) before any planning happens. Issues with a feature branch
are in progress. Finally, issues should not be closed until the fix can be confirmed.

![issue workflow diagram](./workflow.png)

### Type

#### Bug

Bugs are problems with existing features, missing features that should work, or anything else that seems out of place.

[Create a new bug](https://github.com/ssube/isolex/issues/new?template=type_bug.md).

#### Feature

Features are new feature requests, new options, and other suggestions to add things.

[Create a new feature](https://github.com/ssube/isolex/issues/new?template=type_feature.md).

#### Update

Updates are routine updates of existing features and dependencies, with any associated work to update options or tests.

TODO: some updates can be handled by Greenkeeper

[Create a new update](https://github.com/ssube/isolex/issues/new?template=type_update.md).

## Merges

The `master` branch is the stable, usable branch and is automatically deployed.

Code should be merged into master after:

- pipeline has run and passed
- tests have been written and pass
- lint issues have been resolved
