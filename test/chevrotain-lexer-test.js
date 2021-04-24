'use strict'

import { Lexer } from 'chevrotain'
import assert from 'assert'
import { ExampleBlockDelimiter, SidebarBlockDelimiter, WhiteSpace, Text } from '../lib/engines/chevrotain/lexer.js'

describe('AsciiDocChevrotainLexer', () => {
  it('should tokenize unterminated example block', async () => {
    const lexer = new Lexer([
      WhiteSpace,
      ExampleBlockDelimiter,
      SidebarBlockDelimiter,
      Text
    ])
    const result = lexer.tokenize(`Here's 4 equals signs: ====
 ====`)
    assert.equal(result.tokens.length, 2)
    assert.equal(result.tokens[0].image, `Here's 4 equals signs: ====`)
    assert.equal(result.tokens[1].image, `====`)
  })
  it('should tokenize example block', async () => {
    const lexer = new Lexer([
      WhiteSpace,
      ExampleBlockDelimiter,
      SidebarBlockDelimiter,
      Text
    ])
    const result = lexer.tokenize(`====
This is an example.
====`)
    assert.equal(result.tokens.length, 3)
    assert.equal(result.tokens[0].image, `====`)
    assert.equal(result.tokens[1].image, `This is an example.`)
    assert.equal(result.tokens[2].image, `====`)
  })
})



