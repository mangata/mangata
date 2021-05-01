import { CstParser } from 'chevrotain'
import { ExampleBlockDelimiter, ListingBlockDelimiter, LiteralBlockDelimiter, SidebarBlockDelimiter, Text, WhiteSpace } from './lexer.js'

const allTokens = [
  WhiteSpace,
  ExampleBlockDelimiter,
  SidebarBlockDelimiter,
  ListingBlockDelimiter,
  LiteralBlockDelimiter
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
        },
        {
          ALT: () => {
            $.SUBRULE($.listingBlock)
          }
        },
        {
          ALT: () => {
            $.SUBRULE($.literalBlock)
          }
        },
        {
          ALT: () => {
            $.SUBRULE($.paragraphBlock)
          }
        }
      ])
    })

    $.RULE('paragraphBlock', () => {
      $.CONSUME1(Text)
    })

    $.RULE('exampleBlock', () => {
      $.CONSUME1(ExampleBlockDelimiter)
      $.MANY(() => {
        // every blocks except example block!
        $.OR([
          {
            ALT: () => {
              $.SUBRULE($.sidebarBlock)
            }
          },
          {
            ALT: () => {
              $.SUBRULE($.listingBlock)
            }
          },
          {
            ALT: () => {
              $.SUBRULE($.literalBlock)
            }
          },
          {
            ALT: () => {
              $.SUBRULE($.paragraphBlock)
            }
          }
        ])
      })
      $.CONSUME2(ExampleBlockDelimiter)
    })

    $.RULE('sidebarBlock', () => {
      $.CONSUME3(SidebarBlockDelimiter)
      $.MANY(() => {
        // every blocks except sidebar block!
        $.OR([
          {
            ALT: () => {
              $.SUBRULE($.exampleBlock)
            }
          },
          {
            ALT: () => {
              $.SUBRULE($.listingBlock)
            }
          },
          {
            ALT: () => {
              $.SUBRULE($.literalBlock)
            }
          },
          {
            ALT: () => {
              $.SUBRULE($.paragraphBlock)
            }
          }
        ])
      })
      $.CONSUME4(SidebarBlockDelimiter)
    })

    $.RULE('listingBlock', () => {
      $.CONSUME1(ListingBlockDelimiter)
      $.MANY(() => {
        $.OR([
          {
            ALT: () => {
              $.CONSUME(ExampleBlockDelimiter)
            }
          },
          {
            ALT: () => {
              $.CONSUME(Text)
            }
          },
          {
            ALT: () => {
              $.CONSUME(SidebarBlockDelimiter)
            }
          }
        ])
      })
      $.CONSUME3(ListingBlockDelimiter)
    })

    $.RULE('literalBlock', () => {
      $.CONSUME4(LiteralBlockDelimiter)
      $.MANY(() => {
        $.CONSUME5(Text)
      })
      $.CONSUME6(LiteralBlockDelimiter)
    })

    this.performSelfAnalysis()
  }
}
