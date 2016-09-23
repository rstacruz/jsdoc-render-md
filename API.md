## jsdoc-render

<details>
<summary>jsdoc-render</summary>
</details>

### render

<details>
<summary><code>render(<b title='Section[]'>data</b>)</code> → <em>string</em></summary>

| Param | Type | Description |
| --- | --- | --- |
| `data` | Section[] | The data to be parsed |
</details>

Renders a Jsdoc document into a Markdown document.
Takes an input of a list of sections, as given by jsdom-parse.
This is the function exported by *require('jsdoc-render')*.

Returns a Markdown document.

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

<details>
<summary><code>renderSection(<b title='Section'>section</b>, <b title='object'>options</b>)</code> → <em>string</em></summary>

| Param | Type | Description |
| --- | --- | --- |
| `section` | Section | The section to render |
| `options` | <span title='Optional'>?</span>object | Options to be passed |
| `options.prefix` | <span title='Optional'>?</span>string | The prefix to be passed; usually `'## '` |
| `options.signature` | <span title='Optional'>?</span>boolean | If `false`, then signature is omitted |
</details>

Renders a *Section* (a function, class, and so on). Returns a Markdown fragment.

### renderBody<span title='private'>🔸</span>

<details>
<summary><code>renderBody(<b title='Section'>section</b>)</code> → <em>string</em></summary>

| Param | Type | Description |
| --- | --- | --- |
| `section` | Section | Section to be rendered |
</details>

Renders the body of a *Section* (a function, class, and so on).
Unlike [renderSection], this doesn't render the prelude (Markdown heading). Returns a Markdown block.

### renderParams<span title='private'>🔸</span>

<details>
<summary><code>renderParams(<b title='object[]'>params</b>)</code> → <em>string</em></summary>

| Param | Type | Description |
| --- | --- | --- |
| `params` | object[] | Parameters to be rendered |
</details>

Renders params. 

### renderParam<span title='private'>🔸</span>

<details>
<summary><code>renderParam(<b title='object'>param</b>)</code> → <em>string</em></summary>

| Param | Type | Description |
| --- | --- | --- |
| `param` | object | Parameter to be rendered |
</details>

Renders a parameter. 

### dotify<span title='private'>🔸</span>

<details>
<summary><code>dotify(<b title='string'>str</b>)</code> → <em>string</em></summary>

| Param | Type | Description |
| --- | --- | --- |
| `str` | string | The sentence to cententify |
</details>

Turns a string into a complete sentence. 

```js
dotify('Hello')   // => 'Hello.'
dotify('Hi.')     // => 'Hi.'
```

### renderAtom<span title='private'>🔸</span>

<details>
<summary><code>renderAtom()</code> → <em>string</em></summary>
</details>

Renders a function signature, a parameter, a type annotation, and so on. 
