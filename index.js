/**
 * Sup.
 * @module jsdoc-render
 */

/**
 * Renders a jsdoc document into a markdown document.
 */

function render (data) {
  return data.map(section => {
    if (~['class', 'module'].indexOf(section.kind)) {
      return renderSection(section, '##')
    } else if (~['function', 'member'].indexOf(section.kind)) {
      return renderSection(section, '###')
    } else {
      return renderSection(section, '###')
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

function renderSection (section, level) {
  var md = []

  md.push(`${level} ${section.name}\n` +
    `> ${renderAtom(section)}`)

  md = renderBody(section, md)
  return md.join('\n\n')
}

/**
 * Renders the body of a function, class, etc
 */

function renderBody (section, md) {
  if (section.description) {
    md.push(section.description)
  }

  if (section.params && section.params.length !== 0) {
    md = md.concat(renderParams(section.params))
  }

  if (section.returns) {
    md = md.concat(renderReturns(section.returns))
  }

  if (section.examples) {
    md = md.concat(section.examples.map(ex => '```js\n' + ex + '\n```'))
  }

  return md
}

function renderParams (params) {
  return [ params.map(p => renderParam(p)).join('\n') ]
}

function renderParam (param) {
  const b = '`'
  var parts = ['-']
  parts.push('`' + param.name + '`')

  if (param.type) {
    parts.push(`(${renderAtom(param.type)}${param.optional ? ', optional' : ''})`)
  }

  if (param.description) {
    parts.push('&mdash;')
    parts.push(param.description)
  }

  return parts.join(' ')
}

function renderReturns (returns) {
  return returns.map(r => {
    // A return with a type
    if (r.description && r.type) {
      return `Returns ${r.description} (${renderAtom(r.type)})`
    }

    if (r.description) {
      return `Returns ${r.description}`
    }

    if (r.type) {
      return `Returns ${renderAtom(r.type)}.`
    }
  })
}

/**
 * Renders a signature.
 */

function renderAtom (atom) {
  if (Array.isArray(atom)) {
    return atom.map(a => renderAtom(a)).join(', ')
  }

  if (typeof atom === 'string') {
    return atom.replace(/\*/g, '\\*')
  }

  if (!atom) return

  // A function
  if (atom.kind === 'function') {
    const left = `${atom.name}(${renderAtom(atom.params)})`
    const right = renderAtom(atom.returns)
    if (left && right) return `${left} → ${right}`
    return left
  }

  // A type
  if (atom.names) {
    return '*' + atom.names.map(n => renderAtom(n)).join(' | ') + '*'
  }

  // A parameter
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

/*
 * Export
 */
module.exports = render
