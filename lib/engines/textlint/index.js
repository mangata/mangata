'use strict'

const AsciiDocParser = require('./asciidoc-parser')

module.exports = class TextlintParser {
  parse (text) {
    const doc = new AsciiDocParser(text).parse()
    // fixme: transform doc into a generic DOM
    return doc
  }
}
