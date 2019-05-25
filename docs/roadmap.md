# Roadmap

While detailed progress is tracked through issues and tickets, the high level roadmap for upcoming features is:

![project roadmap](./roadmap.svg)

## States

- New: blue
- In-progress: yellow
- Complete: green

## Process

1. No more than 4 items on the roadmap can be in-progress at a time.
2. Items should have an issue number attached by the time they are in-progress.
3. Roadmap should be updated when a feature is merged.
4. Roadmap is generated as an SVG export of https://drive.google.com/file/d/1LGLhn3ikiB7FMfnYWw4m3Beub8W_-k7f/view?usp=sharing,
   typically using https://draw.io, and formatted with `cat download.svg | xmllint --format - > docs/roadmap.svg`