import SelectParser from './parser.js'
import { Lexer } from 'chevrotain'
import { SidebarBlockDelimiter, ExampleBlockDelimiter, WhiteSpace, Text } from './lexer.js'

const allTokens = [
  WhiteSpace,
  ExampleBlockDelimiter,
  SidebarBlockDelimiter,
  Text
]

const parser = new SelectParser()
const SelectLexer = new Lexer(allTokens)

export default class ChevrotainParser {
  parse (text) {
    const lexingResult = SelectLexer.tokenize(text)
    // "input" is a setter which will reset the parser's state.
    parser.input = lexingResult.tokens
    const result = parser.delimitedBlockStatement()
    console.log(parser.errors)
    /*
    if (parser.errors.length > 0) {
      throw new Error("sad sad panda, Parsing errors detected")
    }
    */
    // fixme: transform result into a generic DOM
    console.log(result)
    return {
      type: 'Document',
      raw: text,
      children: []
    }
  }
}
