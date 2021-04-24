/*
import { CstParser } from 'chevrotain'
import { SidebarBlockDelimiter, ExampleBlockDelimiter, SidebarBlockDelimiter, WhiteSpace } from './lexer.js'

const allTokens = [
  WhiteSpace,
  ExampleBlockDelimiter,
  SidebarBlockDelimiter
]

export default class SelectParser extends CstParser {
  constructor() {
    super(allTokens)

    const $ = this

    $.RULE('selectStatement', () => {
      $.SUBRULE($.selectClause)
      $.SUBRULE($.fromClause)
      $.OPTION(() => {
        $.SUBRULE($.whereClause)
      })
    })

    this.performSelfAnalysis()
  }
}
*/
