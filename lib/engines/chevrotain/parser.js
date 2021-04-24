import { CstParser } from 'chevrotain'
import { ExampleBlockDelimiter, SidebarBlockDelimiter, Text, WhiteSpace } from './lexer.js'

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

    $.RULE("document", () => {
      $.MANY(() => {
        $.SUBRULE($.blocks)
      })
    })

    $.RULE('blocks', () => {
      $.OR([
        {
          ALT: () => {
            $.SUBRULE($.exampleBlock)
          }
        },
        {
          ALT: () => {
            $.SUBRULE($.sidebarBlock)
          }
        }
      ])
    })

    $.RULE('exampleBlock', () => {
      $.CONSUME1(ExampleBlockDelimiter)
      $.CONSUME2(Text)
      $.CONSUME3(ExampleBlockDelimiter)
    })

    $.RULE('sidebarBlock', () => {
      $.CONSUME4(SidebarBlockDelimiter)
      $.CONSUME5(Text)
      $.CONSUME6(SidebarBlockDelimiter)
    })

    this.performSelfAnalysis()
  }
}
