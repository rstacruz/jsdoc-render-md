/**
 * @module jsdoc-render
 */

const ARROW = ' → '

/**
 * Renders a Jsdoc document into a Markdown document.
 * Takes an input of a list of sections, as given by `jsdom-parse`.
 *
 * @param {Section[]} data The data to be parsed
 * @return {string} a Markdown document
 *
 * @example
 * const data = [ { id: 'len',
 *     longname: 'len',
 *     name: 'len',
 *     scope: 'global',
 *     kind: 'function',
 *     description: 'Returns the number of keys in a HAMT tree.',
 *     params: [ { type: { names: [ 'Tree' ] }, name: 'data' } ],
 *     returns: [ { type: { names: [ 'number' ] } } ],
 *     meta:
 *      { lineno: 217,
 *        filename: 'index.js',
 *        path: '/Users/rsc/Projects/rstacruz/nested-hamt' },
 *     order: 5 } ]
 *
 * render(data)
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
 * @param {Section} section The section to render
 * @param {string} prefix The prefix for the section; usually `###`
 * @private
 */

function renderSection (section, prefix) {
  var md = []

  const b = '`'
  md.push(`${prefix} ${section.name}\n` +
    `> ${b}${renderAtom(section).replace(ARROW, `${b}${ARROW}${b}`)}${b}`)

  md = md.concat(renderBody(section))
  return md.join('\n\n')
}

/**
 * Renders the body of a `Section` (a function, class, and so on)
 *
 * @return {string[]} Markdown blocks
 * @private
 */

function renderBody (section) {
  let md = []
  let prefix = ''

  if (section.access && section.access !== 'public') {
    prefix = `**(${section.access})** `
  }

  if (section.description) {
    md.push(prefix + section.description)
  }

  if (section.returns) {
    md = md.concat(renderReturns(section.returns))
  }

  if (section.params && section.params.length !== 0) {
    md = md.concat(renderParams(section.params))
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
      return `Returns ${dotify(r.description)} (${renderAtom(r.type)})`
    }

    if (r.description) {
      return `Returns ${dotify(r.description)}`
    }

    if (r.type) {
      return `Returns ${renderAtom(r.type)}.`
    }
  })
}

/**
 * Turns a string into a complete sentence.
 * @param {string} str The sentence to cententify
 * @private
 */

function dotify (str) {
  return /\.$/.test(str) ? str : `${str}.`
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
      .replace(/Array\.<([^>]+)>/g, '$1[]')
      .replace(/\*/g, '\\*')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  if (!atom) return

  // A function
  if (atom.kind === 'function') {
    const left = `${atom.name}(${renderAtom(atom.params)})`
    const right = renderAtom(atom.returns)
    if (left && right) return `${left}${ARROW}${right}`
    return left
  }

  // A type
  if (atom.names) {
    return atom.names.map(n => renderAtom(n)).join(' | ')
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
