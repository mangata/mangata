'use strict'

import Line from './line.js'

const NewlineSplitterRx = /(\r?\n|\r)/
const TrailingNewlineRx = /(\r?\n?)$/

export default class LineReader {
  constructor (text) {
    this.text = text
  }

  readLines () {
    const [chompedText, trailingNewline] = this.text.split(TrailingNewlineRx)
    const lines = chompedText ? chompedText.split(NewlineSplitterRx).reduce((accum, curr, idx) => {
      if (idx % 2 === 0) {
        accum[accum.length] = curr
      }
      else {
        accum[accum.length - 1] += curr
      }
      return accum
    }, []) : ['']
    if (trailingNewline) lines[lines.length - 1] += trailingNewline
    let offset = 0
    return lines.map((rawText, idx) => new Line(rawText, idx + 1, (offset += rawText.length) - rawText.length))
  }
}
