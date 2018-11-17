# Math Controller

The math controller relies on [mathjs](http://mathjs.org/) for parsing and calculation. Most features from the library are
available in the controller.

## Examples

Using `!!math` as the controller prefix:

> input: `1+2`
>
> reply: `3`
>
> input: `f(x) = random(0, x); f(10)`
>
> reply: `8`

## Interactions

Notable interactions with other controllers.

### Learn

When using the `LearnController` to keyword math commands, the resulting expression will be joined with `;\n` delimiters.
This should ensure that the original input and keyword input are parsed as different expressions, but unbound brackets
will still break things.
