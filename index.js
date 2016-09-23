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

function render (data) {
  return data.map(section => {
    if (~['module'].indexOf(section.kind)) {
      return renderSection(section, { prefix: '## ' })
    } else if (~['class', 'module'].indexOf(section.kind)) {
      return renderSection(section, { prefix: '## ' })
    } else if (~['function', 'member'].indexOf(section.kind)) {
      return renderSection(section, { prefix: '### ' })
    } else {
      return renderSection(section, { prefix: '### ' })
    }
  }).join("\n\n")
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
  var prelude = `${prefix}${section.name}${access ? access : ''}`
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

function renderBody (section) {
  let md = []
  let prefix = ''

  if (section.params && section.params.length !== 0) {
    md = md.concat([
      '<details>\n' +
      `<summary>${renderAtom(section)}</summary>\n\n` +
      renderParams(section.params) + '\n' +
      '</details>'
    ])
  } else {
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
 * Renders params.
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

function renderAtom (atom) {
  if (Array.isArray(atom)) {
    return atom.map(a => renderAtom(a)).join(', ')
  }

  if (typeof atom === 'string') {
    return atom
      .replace(/Array\.<([^>]+)>/g, '$1[]')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  if (!atom) return

  // A function
  if (atom.kind === 'function') {
    // Discard 'deep' parameters
    const params_ = atom.params.filter(p => p.name.indexOf('.') === -1)
    const left = '<code>' + `${atom.name}(${renderAtom(params_)})` + '</code>'
    const right = renderAtom(atom.returns) || 'void'
    return `${left}${ARROW}<em>${right}</em>`
  }

  // A type
  if (atom.names) {
    return atom.names.map(n => renderAtom(n)).join(' | ')
  }

  // A parameter
  if (atom.name && atom.type) {
    const opt = atom.optional ? OPTIONAL_SMALL : ''
    return `<b title='${renderAtom(atom.type)}'>${atom.name}</b>${opt}`
  }

  if (atom.name) {
    return atom.name
  }

  if (atom.type) {
    return renderAtom(atom.type)
  }
}

/*
 * Export
 */
module.exports = render
