## jsdoc-render

### render

<pre><code>render(<b title='Section[]'>data</b>)</code> → <em>string</em></pre>

Renders a Jsdoc document into a Markdown document.
Takes an input of a list of sections, as given by jsdom-parse.
This is the function exported by `require('jsdoc-render')`.

Returns a Markdown document.

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

### renderSection<span title='private'>🔸</span>

<pre><code>renderSection(<b title='Section'>section</b>, <b title='object'>options</b>)</code> → <em>string</em></pre>

Renders a `Section` (a function, class, and so on). Returns a Markdown fragment.

- `section` *(Section)* &mdash; The section to render
- `options` *(<span title='Optional'>?</span>object)* &mdash; Options to be passed
  - `prefix` *(<span title='Optional'>?</span>string)* &mdash; The prefix to be passed; usually `'## '`
  - `signature` *(<span title='Optional'>?</span>boolean)* &mdash; If `false`, then signature is omitted

### renderBody<span title='private'>🔸</span>

<pre><code>renderBody(<b title='Section'>section</b>)</code> → <em>string[]</em></pre>

Renders the body of a `Section` (a function, class, and so on).
Unlike [renderSection], this doesn't render the prelude (Markdown heading). Returns Markdown blocks.

- `section` *(Section)* &mdash; Section to be rendered

### renderParams<span title='private'>🔸</span>

<pre><code>renderParams(<b title='object[]'>params</b>)</code> → <em>string</em></pre>

Renders params. 

- `params` *(object[])* &mdash; Parameters to be rendered

### renderParam<span title='private'>🔸</span>

<pre><code>renderParam(<b title='object'>param</b>)</code> → <em>string</em></pre>

Renders a parameter. 

- `param` *(object)* &mdash; Parameter to be rendered

### dotify<span title='private'>🔸</span>

<pre><code>dotify(<b title='string'>str</b>)</code> → <em>string</em></pre>

Turns a string into a complete sentence. 

- `str` *(string)* &mdash; The sentence to cententify

### renderAtom<span title='private'>🔸</span>

<pre><code>renderAtom()</code> → <em>string</em></pre>

Renders a function signature, a parameter, a type annotation, and so on. 
