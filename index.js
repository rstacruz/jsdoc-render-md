const read = require('read-input')

read(process.argv.slice(2)).then(res => {
  const data = JSON.parse(res.data)
  console.log('data:', require('util').inspect(data, { depth: null, colors: true }))
  console.log(render(data))
})
.catch(err => {
  console.error(err)
  throw er
})

/**
 * Renders a jsdoc document into a markdown document.
 */

function render (data) {
  return data.map(section => {
    if (section.kind === 'function') {
      return renderFunction(section)
    } else {
      return `## ${section.name}`
    }
  }).join("\n\n")
}

/**
 * Renders a function.
 *
 * Takes an input like this:
 *
 *
 *     { id: 'len',
 *       longname: 'len',
 *       name: 'len',
 *       scope: 'global',
 *       kind: 'function',
 *       description: 'Returns the number of keys in a HAMT tree.',
 *       params: [ { type: { names: [ 'Tree' ] }, name: 'data' } ],
 *       returns: [ { type: { names: [ 'number' ] } } ],
 *       meta:
 *        { lineno: 217,
 *          filename: 'index.js',
 *          path: '/Users/rsc/Projects/rstacruz/nested-hamt' },
 *       order: 5 } ]
 */

function renderFunction (section) {
  const b = '`'
  return `## ${section.name}\n` +
    `> ${renderAtom(section)}` +
    `\n` +
    `${section.description}`
}

/**
 * Renders a signature.
 */

function renderAtom (atom) {
  if (Array.isArray(atom)) {
    return atom.map(a => renderAtom(a)).join(', ')
  }

  if (typeof atom === 'string') {
    return atom
  }

  // A function
  if (atom.kind === 'function') {
    const left = `${atom.name}(${renderAtom(atom.params)})`
    const right = renderAtom(atom.returns)
    if (left && right) return `${left} → ${right}`
    return left
  }

  // A type
  if (atom.names) {
    return '*' + atom.names.join(' | ') + '*'
  }

  // A paramete
  if (atom.name && atom.type) {
    return `${atom.name}: ${renderAtom(atom.type)}`
  }

  if (atom.type) {
    return renderAtom(atom.type)
  }

  if (atom.name) {
    return atom.name
  }
}
