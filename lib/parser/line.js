'use strict'

import Position from './position.js'

const TrailingNewlineRx = /\r?\n?$/

export default class Line {
  constructor(rawText, lineNumber = 1, offset = 0) {
    this.rawText = rawText
    const chompedText = rawText.replace(TrailingNewlineRx, '')
    const chompedLength = chompedText.length
    if (chompedLength === 0) {
      //this.eol = rawText
    } else {
      this.text = chompedText
      //this.eol = rawText.slice(chompedLength)
    }
    this.range = [offset, offset + (this.length = rawText.length)]
    this.end = (this.start = new Position(lineNumber)).move(this.length)
  }

  // define loc property for compatibility w/ AST nodes
  get loc() {
    return { start: this.start, end: this.end }
  }

  isBlank() {
    return !this.text
  }

  getTextLength() {
    return this.text ? this.text.length : 0
  }

  matches(other) {
    return this.text === other.text
  }

  toString() {
    return this.text || ''
  }
}
