const NameRx = /^[\p{Letter}\p{Mark}\p{Number}\p{Connector_Punctuation}][\p{Letter}\p{Mark}\p{Number}\p{Connector_Punctuation}-]*\s*=/u
const BlankRx = /[ \t]+/
const Escape = '\\'
const SingleQuote = '\''
const DoubleQuote = '"'
const Delimiter = ','
const ExceptDelimiterRx = /[^,]/
const BoundaryRx = {
  [DoubleQuote]: /.*?[^\\](?=")/,
  [SingleQuote]: /.*?[^\\](?=')/,
  [Delimiter]: /.*?(?=,|$)/,
}
const EscapedQuotes = {
  [DoubleQuote]: '\\"',
  [SingleQuote]: '\\\'',
}

class StringScanner {

  constructor (text) {
    this.chars = [...text]
    this.pos = 0
  }

  skipBlank () {
    let index = this.pos
    while (index < this.chars.length) {
      if (BlankRx.test(this.chars[index])) {
        index++
        continue;
      }
      break;
    }
    this.pos = index
  }

  skip (rx) {
    let index = this.pos
    while (index < this.chars.length) {
      if (rx.test(this.chars[index])) {
        index++
        continue;
      }
      break;
    }
    this.pos = index
  }

  peek () {
    return this.chars[this.pos]
  }

  get () {
    const pos = this.pos
    this.pos += 1
    return this.chars[pos]
  }

  scan (rx) {
    const text = this.chars.slice(this.pos, this.chars.length).join('')
    const match = text.match(rx)
    if (match) {
      this.pos += match[0].length
      return match[0]
    }
    return ''
  }

  isEOS () {
    return this.chars.length === this.pos
  }
}

function parseAttributeValue (ss, openingQuote) {
  // empty value
  if (ss.peek() === openingQuote) {
    ss.get() // advance cursor, and return ''
    return ''
  }
  const value = scanToBoundary(ss, openingQuote)
  if (value) {
    if (value.includes(Escape)) {
      return value.replaceAll(EscapedQuotes[openingQuote], openingQuote)
    }
    return value
  }
  // leading quote only
  return `${openingQuote}${scanToDelimiter(ss)}`
}

function scanToBoundary (ss, boundaryChar) {
  return ss.scan(BoundaryRx[boundaryChar])
}

function scanToDelimiter (ss) {
  return ss.scan(BoundaryRx[Delimiter])
}

function skipToDelimiter (ss) {
  ss.skip(ExceptDelimiterRx)
}

function parseAttribute (stringScanner, attrs) {
  stringScanner.skipBlank()
  const char = stringScanner.peek()
  let name, value, applySubs = false
  if (char === DoubleQuote || char === SingleQuote) {
    name = parseAttributeValue(stringScanner, stringScanner.get())
    if (char === SingleQuote) {
      applySubs = true
    }
    skipToDelimiter(stringScanner)
  } else {
    if (stringScanner.isEOS()) {
      name = null
    } else {
      const namedAttribute = stringScanner.scan(NameRx)
      if (namedAttribute) {
        name = namedAttribute.slice(0, -1).trim()
        stringScanner.skipBlank()
        const char = stringScanner.peek()
        if (char === DoubleQuote || char === SingleQuote) {
          value = parseAttributeValue(stringScanner, stringScanner.get())
          if (char === SingleQuote) {
            applySubs = true
          }
          skipToDelimiter(stringScanner)
        } else {
          value = scanToDelimiter(stringScanner).trim()
        }
      } else {
        const attributeName = scanToDelimiter(stringScanner).trim()
        if (attributeName) {
          name = attributeName.trim()
        } else {
          name = null
        }
      }
    }
  }
  if (value !== undefined) {
    if (name === 'options' || name === 'opts') {
      if (value.includes(',')) {
        value.split(',').forEach((opt) => {
          opt = opt.trim()
          if (opt.length > 0) {
            attrs[`${opt}-option`] = ''
          }
        })
      } else if (value.length > 0) {
        attrs[`${value}-option`] = ''
      }
    } else {
      if (name !== 'title' && name !== 'reftext' && applySubs) {
        // todo: apply block subs
        attrs[name] = value
      } else {
        attrs[name] = value
      }
    }
  } else {
    let positional
    if ('$positional' in attrs) {
      positional = attrs['$positional']
    } else {
      positional = {}
      attrs['$positional'] = positional
    }
    positional[Object.keys(positional).length + 1] = name
  }
  return true
}

export default function parse (text) {
  const attrs = {}
  const stringScanner = new StringScanner(text)
  while (parseAttribute(stringScanner, attrs)) {
    if (stringScanner.isEOS()) {
      break
    }
    // consume ','
    stringScanner.get()
  }
  return attrs
}
