/**
 * @module jsdoc-render
 */

const ARROW = ' → '
const PRIVATE = '🔸'
const OPTIONAL = ', _optional_'
const OPTIONAL_SMALL = '<sub title="Optional">?</sub>'

/**
 * Renders a Jsdoc document into a Markdown document.
 * Takes an input of a list of sections, as given by jsdom-parse.
 * This is the function exported by *require('jsdoc-render')*.
 *
 * @param {Section[]} data The data to be parsed
 * @param {String=} options.title The title to be used
 * @return {string} a Markdown document.
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

function render (data, options) {
  if (!options) options = {}

  // Remove unrenderable sections
  data = data.filter(s => !s.undocumented && s.kind !== 'package')

  // Remove privates
  if (!options || !options.includePrivate) {
    data = data.filter(s => !s.access || s.access !== 'private')
  }

  let output = data
    .map(section => {
      if (~['module'].indexOf(section.kind)) {
        return renderSection(section, { prefix: '## ' })
      } else if (~['class', 'module'].indexOf(section.kind)) {
        return renderSection(section, { prefix: '## ' })
      } else if (~['function', 'member'].indexOf(section.kind)) {
        return renderSection(section, { prefix: '### ' })
      } else {
        return renderSection(section, { prefix: '### ' })
      }
    })
    .join("\n\n")

  if (options.title) {
    output = `# ${options.title}\n\n${output}`
  }

  return output
}

/**
 * Renders a *Section* (a function, class, and so on).
 *
 * @param {Section} section The section to render
 * @param {object=} options Options to be passed
 * @param {string=} options.prefix The prefix to be passed; usually `'## '`
 * @param {boolean=} options.signature If `false`, then signature is omitted
 * @returns {string} a Markdown fragment
 * @private
 */

function renderSection (section, options = {}) {
  let md = []
  const prefix = options.prefix || ''

  const b = '`'
  const access = renderAccess(section)
  const id = `<a id='${section.name}'></a>`
  const fn = section.kind === 'function' ? '()' : ''
  var prelude = `${prefix}${id}${section.name}${fn}${access ? access : ''}`
  md.push(prelude)

  md = md.concat([ renderBody(section) ])
  return md.join('\n\n')
}

function renderAccess (section) {
  if (section.access && section.access !== 'public') {
    return `<span title='${section.access}'>${PRIVATE}</span>`
  }
}


/**
 * Renders the body of a *Section* (a function, class, and so on).
 * Unlike [renderSection], this doesn't render the prelude (Markdown heading).
 *
 * @param {Section} section Section to be rendered
 * @returns {string} a Markdown block
 * @private
 */

function renderBody (section, options) {
  let md = []
  let prefix = ''

  if (section.params && section.params.length !== 0) {
    // section.kind === 'function'
    md = md.concat([
      '<details>\n' +
      `<summary>${renderAtom(section)}</summary>\n\n` +
      renderParams(section.params) + '\n\n' +
      renderReturnSignature(section) + '\n' +
      '</details>'
    ])
  } else if (section.properties && section.properties.length !== 0) {
    // section.kind === 'object' ?
    md = md.concat([
      '<details>\n' +
      `<summary>${renderAtom(section)}</summary>\n\n` +
      renderParams(section.properties) + '\n' +
      '</details>'
    ])
  } else if (['class', 'module'].indexOf(section.kind) === -1) {
    md = md.concat([
      '<details>\n' +
      `<summary>${renderAtom(section)}</summary>\n` +
      '</details>'
    ])
  }

  if (section.description) {
    md.push(prefix + section.description)
  }

  if (section.returns) {
    const returns = renderReturns(section.returns)
    // If the return statement doesn't end in a dot, just append it to the last
    // paragraph.
    if (!returns) {
    } else if (isSimpleReturn(section.returns) && md.length !== 0) {
      md[md.length - 1] = md[md.length - 1] + ' ' + returns
    } else {
      md = md.concat(returns)
    }
  }

  if (section.examples) {
    md = md.concat(section.examples.map(ex => '```js\n' + ex + '\n```'))
  }

  return md.join('\n\n')
}

function isSimpleReturn (returns) {
  return returns &&
    returns[0] &&
    (!returns[0].description || !/\.$/.test(returns[0].description))
}
/**
 * Renders params or properties as a table.
 *
 * @param {object[]} params Parameters to be rendered
 * @return {string}
 * @private
 */

function renderParams (params) {
  return '| Param | Type | Description |\n' +
    '| --- | --- | --- |\n' +
    params.map(p => renderParam(p)).join('\n')
}

/**
 * Renders a return signature.
 *
 *     > Returns <code>String</code>
 *
 * @param {object} atom A function
 * @private
 */

function renderReturnSignature (atom) {
  const type = renderAtom(atom.returns, { html: true }) || 'void'
  let signature = `<code>${type}</code>`
  if (atom.kind === 'typedef') signature += ` *(callback)*`

  return `> Returns ${signature}`
}

/**
 * Renders a parameter.
 *
 * @param {object} param Parameter to be rendered
 * @return {string}
 * @private
 */

function renderParam (param) {
  const b = '`'

  let parts = []
  parts.push('`' + param.name + '`')

  if (param.type) {
    const opt = param.optional ? OPTIONAL : ''
    parts.push(`${renderAtom(param.type)}${opt}`)
  } else {
    parts.push(``)
  }

  if (param.description) {
    parts.push(param.description)
  } else {
    parts.push(``)
  }

  return '| ' + parts.join(' | ') + ' |'
}

function renderReturns (returns) {
  return returns.map(r => {
    // A return with a type: don't do this, it's noisy and it's redundant
    // if (r.description && r.type) {
    //   return `Returns ${dotify(r.description)} *(${renderAtom(r.type)})*`
    // }

    if (r.description) {
      return `Returns ${dotify(r.description)}`
    }

    // if (r.type) {
    //   return `Returns a ${renderAtom(r.type)}.`
    // }
  })
}

/**
 * Turns a string into a complete sentence.
 *
 * @param {string} str The sentence to cententify
 * @return {string}
 * @private
 * @example
 * dotify('Hello')   // => 'Hello.'
 * dotify('Hi.')     // => 'Hi.'
 */

function dotify (str) {
  return /\.$/.test(str) ? str : `${str}.`
}

/**
 * Renders a function signature, a parameter, a type annotation, and so on.
 * @return {string}
 * @private
 */

function renderAtom (atom, options) {
  if (Array.isArray(atom)) {
    return atom.map(a => renderAtom(a, options)).join(', ')
  }

  if (typeof atom === 'string') {
    return renderString(atom, options)
  }

  if (!atom) return

  // A function
  if (atom.kind === 'function' || (atom.kind === 'typedef' && atom.params)) {
    // Discard 'deep' parameters
    const params_ = atom.params.filter(p => p.name.indexOf('.') === -1)
    const left = '<code>' + `${atom.name}(${renderAtom(params_)})` + '</code>'
    let signature = `${left}`

    return signature
  }

  // A typedef of an object
  if (atom.kind === 'typedef' && atom.properties) {
    return '<code>' + `{ ${renderAtom(atom.properties, options)} }` + '</code>'
  }

  // A type
  if (atom.names) {
    return atom.names.map(n => renderAtom(n, options)).join(' | ')
  }

  // A parameter
  if (atom.name && atom.type) {
    let html = `<b title='${renderAtom(atom.type, options)}'>${atom.name}</b>`
    if (atom.optional) html = `${html}${OPTIONAL_SMALL}`
    if (atom.variable) html = `...${html}`
    return html
  }

  if (atom.name) {
    return atom.name
  }

  if (atom.type) {
    return renderAtom(atom.type, options)
  }
}

function renderString (atom, options) {
  let str = atom
    .replace(/Array\.<([^>]+)>/g, '$1[]')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Link it if it starts with an uppercase
  if (options && options.html) {
    str = str.replace(/([A-Z][a-z0-9]*)+/g,
      s => `<a href='#${s.toLowerCase().replace(/[^a-z0-9]/g, '')}'>${s}</a>`)
  }

  return str
  }

/*
 * Export
 */

module.exports = render
