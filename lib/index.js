'use strict'

export default class AsciiDocParser {
  constructor (engine) {
    this.engine = engine
  }

  parse (text) {
    return this.engine.parse(text)
  }
}
