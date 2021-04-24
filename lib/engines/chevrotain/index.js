import util from 'util'
import { Lexer } from 'chevrotain'
import SelectParser from './parser.js'
import { ExampleBlockDelimiter, SidebarBlockDelimiter, Text } from './lexer.js'

const allTokens = [
  /*WhiteSpace,*/
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
    const result = parser.document()
    // fixme: transform result into a generic DOM
    let children = []
    if (result.children && result.children.blocks) {
      children = result.children.blocks.map((block) => {
        let content
        let enclosureType
        if ('exampleBlock' in block.children) {
          content = block.children.exampleBlock[0].children.Text
          enclosureType = 'Example'
        } else if ('sidebarBlock' in block.children) {
          content = block.children.sidebarBlock[0].children.Text
          enclosureType = 'Sidebar'
        }
        return {
          type: 'DelimitedBlock',
          enclosureType,
          children: [
            {
              type: 'Paragraph',
              data: content
            }
          ]
        }
      })
    }
    /*
    if (parser.errors.length > 0) {
      throw new Error("sad sad panda, Parsing errors detected")
    }
    */

    return {
      type: 'Document',
      raw: text,
      children
    }
  }
}
