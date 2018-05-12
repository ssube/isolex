# Math Handler

The math handler relies on [mathjs](http://mathjs.org/) for parsing and calculation. Most features from the library are
available in the handler.

## Examples

Using `!!math` as the handler prefix:

> input: `1+2`
>
> reply: `3`
>
> input: `f(x) = random(0, x); f(10)`
>
> reply: `8`

## Interactions

Notable interactions with other handlers.

### Learn

When using the `LearnHandler` to trigger math commands, the resulting expression will be joined with `;\n` delimiters.
This should ensure that the original input and trigger input are parsed as different expressions, but unbound brackets
will still break things.
