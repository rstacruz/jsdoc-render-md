## jsdoc-render
> `jsdoc-render`

### render
> `render(data)` → string

Renders a Jsdoc document into a Markdown document.
Takes an input of a list of sections, as given by `jsdom-parse`.

Returns a Markdown document. (string)

- `data` (Section[]) &mdash; The data to be parsed

```js
const data = [ { id: 'len',
    longname: 'len',
    name: 'len',
    scope: 'global',
    kind: 'function',
    description: 'Returns the number of keys in a HAMT tree.',
    params: [ { type: { names: [ 'Tree' ] }, name: 'data' } ],
    returns: [ { type: { names: [ 'number' ] } } ],
    meta:
     { lineno: 217,
       filename: 'index.js',
       path: '/Users/rsc/Projects/rstacruz/nested-hamt' },
    order: 5 } ]

render(data)
```

### renderSection
> `renderSection(section: Section, prefix: string)`

**(private)** Renders a function.

- `section` (Section) &mdash; The section to render
- `prefix` (string) &mdash; The prefix for the section; usually `###`

### renderBody
> `renderBody()` → string[]

**(private)** Renders the body of a `Section` (a function, class, and so on)

Returns Markdown blocks. (string[])

### dotify
> `dotify(str: string)`

**(private)** Turns a string into a complete sentence.

- `str` (string) &mdash; The sentence to cententify

### renderAtom
> `renderAtom()`

Renders a signature.
