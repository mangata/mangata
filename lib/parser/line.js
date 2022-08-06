'use strict'

import Position from './position.js'

const _partition = Symbol()
const TrailingNewlineRx = /\r?\n?$/

export default class Line {
  constructor (rawText, lineNumber = 1, offset = 0) {
    [this.text, this.eol] = this[_partition]((this.rawText = rawText))
    this.range = [offset, offset + (this.length = rawText.length)]
    this.end = (this.start = new Position(lineNumber)).move(this.length)
  }

  // define loc property for compatibility w/ AST nodes
  get loc () {
    return { start: this.start, end: this.end }
  }

  isBlank () {
    return this.text ? false : true
  }

  getTextLength () {
    return this.text ? this.text.length : 0
  }

  matches (other) {
    return this.text === other.text
  }

  toString () {
    return this.text || ''
  }

  [_partition] (rawText) {
    const length = rawText.length,
        chompedText = rawText.replace(TrailingNewlineRx, ''),
        chompedLength = chompedText.length
    return chompedLength === 0 ? [undefined, rawText] : [chompedText, rawText.slice(chompedLength)]
  }
}
