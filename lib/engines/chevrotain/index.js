//import SelectParser from './parser.js'
//const parser = new SelectParser()
import { Lexer } from 'chevrotain'
import { SidebarBlockDelimiter, ExampleBlockDelimiter, WhiteSpace } from './lexer.js'

const allTokens = [
  WhiteSpace,
  ExampleBlockDelimiter,
  SidebarBlockDelimiter
]

const SelectLexer = new Lexer(allTokens)

export default class ChevrotainParser {
  parse (text) {
    const lexingResult = SelectLexer.tokenize(text)
    // console.log(lexingResult)
    /*
    if (lexingResult.errors.length > 0) {
      throw Error("Sad Sad Panda, lexing errors detected")
    }
    */
    // fixme: transform doc into a generic DOM
    const result = {
      type: 'Document',
      raw: text,
      children: []
    }
    return result
  }
}
