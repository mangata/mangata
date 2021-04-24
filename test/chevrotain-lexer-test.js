'use strict'

import { Lexer } from 'chevrotain'
import { ExampleBlockDelimiter, SidebarBlockDelimiter, WhiteSpace, Text } from '../lib/engines/chevrotain/lexer.js'

describe('AsciiDocChevrotainLexer', () => {
  it('should lex', async () => {
    const lexer = new Lexer([
      WhiteSpace,
      ExampleBlockDelimiter,
      SidebarBlockDelimiter,
      Text
    ])
    let result = lexer.tokenize(`Here's 4 equals signs: ====
 ====`)
    console.log(result)
    result = lexer.tokenize(`====
This is an example.
====`)
    console.log(result)
  })
})



