'use strict'
import { createToken, Lexer } from 'chevrotain'

export const WhiteSpace = createToken({
  name: 'WhiteSpace',
  pattern: /\s+/,
  group: Lexer.SKIPPED
})

export const Text = createToken({
  name: 'Text',
  pattern: /\S+/
})

const newLineCharCode = '\n'.charCodeAt()
const equalsCharCode = '='.charCodeAt()
const starCharCode = '*'.charCodeAt()

function matchDelimitedBlock(delimiterCharCode, text, startOffset) {
  let endOffset = startOffset
  let charCode = text.charCodeAt(endOffset)

  if (endOffset === 0 || text.charCodeAt(endOffset - 1) === newLineCharCode) {
    // continue
  } else {
    return null
  }

  while (charCode === delimiterCharCode) {
    endOffset++
    charCode = text.charCodeAt(endOffset)
  }

  // No match, must return null to conform with the RegExp.prototype.exec signature
  if (endOffset === startOffset) {
    return null
  } else {
    if (endOffset - startOffset >= 4) {
      let matchedString = text.substring(startOffset, endOffset)
      // according to the RegExp.prototype.exec API the first item in the returned array must be the whole matched string.
      return [matchedString]
    }
    return null
  }
}

export const ExampleBlockDelimiter = createToken({
  name: "ExampleBlockDelimiter",
  pattern: { exec: (text, startOffset) => matchDelimitedBlock(equalsCharCode, text, startOffset) },

  // Optional property that will enable optimizations in the lexer
  // See: https://chevrotain.io/documentation/9_0_1/interfaces/itokenconfig.html#start_chars_hint
  start_chars_hint: [equalsCharCode],
  line_breaks: false
})

export const SidebarBlockDelimiter = createToken({
  name: "ExampleBlockDelimiter",
  pattern: { exec: (text, startOffset) => matchDelimitedBlock(starCharCode, text, startOffset) },

  // Optional property that will enable optimizations in the lexer
  // See: https://chevrotain.io/documentation/9_0_1/interfaces/itokenconfig.html#start_chars_hint
  start_chars_hint: [starCharCode],
  line_breaks: false
})