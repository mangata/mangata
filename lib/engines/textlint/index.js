'use strict'

import AsciiDocParser from './asciidoc-parser.js'

export default class TextlintParser {
  parse (text) {
    const doc = new AsciiDocParser(text).parse()
    // fixme: transform doc into a generic DOM
    return doc
  }
}
