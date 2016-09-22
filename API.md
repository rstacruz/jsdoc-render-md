## jsdoc-render

### render
> `render(data)` → *string*

Renders a Jsdoc document into a Markdown document.
Takes an input of a list of sections, as given by jsdom-parse.
This is the function exported by `require('jsdoc-render')`.

Returns a Markdown document. *(string)*

- `data` *(Section[])* &mdash; The data to be parsed

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
> `renderSection(section, options)`

**(private)** Renders a function.

- `section` *(Section)* &mdash; The section to render
- `options` *(?object)* &mdash; Options to be passed
  - `prefix` *(?string)* &mdash; The prefix to be passed; usually `'## '`
  - `signature` *(?boolean)* &mdash; If `false`, then signature is omitted

### renderBody
> `renderBody()` → *string[]*

**(private)** Renders the body of a `Section` (a function, class, and so on)

Returns Markdown blocks. *(string[])*

### renderParams
> `renderParams(params)` → *string*

**(private)** Renders params.

Returns a string.

- `params` *(object[])* &mdash; Parameters to be rendered

### renderParam
> `renderParam(param)` → *string*

**(private)** Renders a parameter.

Returns a string.

- `param` *(object)* &mdash; Parameter to be rendered

### dotify
> `dotify(str)` → *string*

**(private)** Turns a string into a complete sentence.

Returns a string.

- `str` *(string)* &mdash; The sentence to cententify

### renderAtom
> `renderAtom()` → *string*

**(private)** Renders a function signature, a parameter, a type annotation, and so on.

Returns a string.
