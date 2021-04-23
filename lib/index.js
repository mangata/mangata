'use strict'

module.exports = class AsciiDocParser {
  constructor (engine) {
    this.engine = engine
  }

  parse (text) {
    return this.engine.parse(text)
  }
}
