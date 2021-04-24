import { CstParser } from 'chevrotain'
import { SidebarBlockDelimiter, ExampleBlockDelimiter, WhiteSpace, Text } from './lexer.js'

const allTokens = [
  WhiteSpace,
  ExampleBlockDelimiter,
  SidebarBlockDelimiter,
  Text
]

export default class SelectParser extends CstParser {
  constructor() {
    super(allTokens)

    const $ = this

    $.RULE('delimitedBlockStatement', () => {
      $.CONSUME(ExampleBlockDelimiter)
      $.MANY(() => {
        $.CONSUME(Text)
      })
      $.CONSUME2(ExampleBlockDelimiter)
    })

    this.performSelfAnalysis()
  }
}
