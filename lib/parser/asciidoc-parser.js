'use strict'

import LineReader from './line-reader.js'
import applySubstitution, { NORMAL_SUBS } from './substitutors.js'
import parseAttrList, { inferMetadataFromFirstPositionalAttribute } from './attribute-list.js'

const BlockTitleRx = /^\.(\.?[^ \t.][^\n]*)$/
const LiteralParagraphRx = /^([ \t]+[^\n]+)$/
const DoctitleRx = /^= \S/
const AuthorLineRx = /^\w[A-Za-z\d_\-'.]*(?: +[A-Za-z[A-Za-z\d_\-'.]*)?(?: +\w[A-Za-z\d_\-'.]*)?(?: +<([^>]+)>)?$/
const RevisionLineRx = /^(?:\D*.*?,)? *(?!:).*?(?: *(?!^): *.*)?$/
const SectionTitleRx = /^=(={0,5}) \S/
const AttributeEntryRx = /^:([^:\s]+):(?:[ \t]+(.+))?$/
const BlockAttributeLineRx = /^\[(?:|[A-Za-z\d_.#%{,"'].*|\[(?:|[A-Za-z_:][A-Za-z\d_:.-]*(?:, *.+)?)])]$/
const BlockMacroRx = /^\w+::(?:|\S|\S.*?\S)\[.*]$/
// FIXME DelimiterInfo should probably be a type managed by DelimiterRegistry
// delimiter
// - name
// - repeatable delimiter symbol
// - supports block children?
const BlockDelimiterMap = {
  '--': ['open', undefined, true],
  '----': ['listing', '-', false],
  '```': ['listing', '`', false],
  '....': ['literal', '.', false],
  '====': ['example', '=', true],
  '|===': ['table', '=', true],
  '!===': ['table', '=', true],
  '////': ['comment', '/', false],
  '****': ['sidebar', '*', true],
  ____: ['quote', '_', true],
  '++++': ['pass', '+', false],
}

class InvalidSyntaxError extends Error {
  constructor(message) {
    super(message)
  }
}

export default class AsciiDocParser {
  constructor(text) {
    this.rawText = text
    this.lines = new LineReader(text).readLines()
    this.attrs = {}
  }

  // QUESTION should parse accept source text/lines as argument?
  parse() {
    const doc = {
      type: 'Document',
      raw: this.rawText,
      range: [0, this.rawText.length],
      loc: {
        start: this.lines[0].start,
        end: this.lines[this.lines.length - 1].end,
      },
      children: [],
    }
    const header = this.readHeader()
    if (header) doc.children.push(header)
    let block
    while (
      (block = this.readBlock(this.readInterveningLines(doc), {
        sections: true,
      }))
    ) {
      doc.children.push(block)
    }
    return doc
  }

  readHeader() {
    // TODO add call to readInterveningLines()
    let nextLine, nextLineText
    if ((nextLine = this.peekLine()) && !nextLine.isBlank() && (nextLineText = nextLine.text).startsWith('=') && DoctitleRx.test(nextLineText)) {
      const titleLine = this.readLine()
      const headerText = nextLine.rawText.replace(/^=+\s+/, '').replace('\n', '')
      const depth = nextLineText.length - nextLineText.replace(/^=+/, '').length
      const header = {
        type: 'HeaderNode',
        depth,
        loc: {
          start: nextLine.start,
        },
        // QUESTION should we store doctitle as TitleNode instead? or titleLine property?
        children: [
          {
            type: 'Header',
            raw: nextLine.rawText.replace('\n', ''),
            range: nextLine.range,
            loc: nextLine.loc,
            children: [
              {
                type: 'Str',
                value: headerText,
                raw: headerText,
                range: nextLine.range,
                loc: nextLine.loc,
              },
            ],
          },
        ],
        raw: nextLineText,
      }
      let authorLine, revisionLine
      while ((nextLine = this.peekLine()) && !nextLine.isBlank()) {
        try {
          const attributeEntry = this.readAttributeEntry(nextLine)
          if (attributeEntry) {
            header.children.push(attributeEntry)
          }
        } catch (err) {
          if (err instanceof InvalidSyntaxError) {
            break
          } else {
            throw err
          }
        }
        if (this.isLineComment(nextLine)) {
          this.readLine()
        } else if (!authorLine) {
          const m = nextLineText.match(AuthorLineRx)
          if (m) {
            authorLine = this.readLine()
            header.children.push({
              type: 'LineNode',
              raw: nextLine.rawText,
              range: nextLine.range,
              loc: nextLine.loc,
            })
          } else {
            break
          }
        } else if (!revisionLine) {
          const m = nextLineText.match(RevisionLineRx)
          if (m) {
            revisionLine = this.readLine()
            header.children.push({
              type: 'LineNode',
              raw: nextLine.rawText,
              range: nextLine.range,
              loc: nextLine.loc,
            })
          } else {
            break
          }
        } else {
          break
        }
      }
      this.endBlock(header, titleLine, header.children[header.children.length - 1] || titleLine)
      return header
    }
  }

  readBlock(dataLines, opts = {}) {
    let nextLine = this.peekLine(),
      block,
      sectionLevel
    if (nextLine) {
      if (opts.sections && (sectionLevel = this.isSectionTitle(nextLine))) {
        if (sectionLevel > (opts.sectionLevel || -1)) {
          block = this.readSection(sectionLevel, dataLines)
        }
      } else if (this.isBlockDelimiter(nextLine)) {
        // catch case when a block prematurely terminates at an enclosing delimiter
        // QUESTION can we move this logic into readDelimitedBlock?
        if ((opts.enclosures || []).length > 1 && opts.enclosures.slice(1).findIndex((candidate) => nextLine.matches(candidate)) >= 0) return
        // QUESTION should we pass value of this.readLine() to method?
        block = this.readDelimitedBlock(dataLines, opts)
      } else if (this.isBlockMacro(nextLine)) {
        block = this.readBlockMacro(dataLines)
      } else if (nextLine.text.startsWith('.')) {
        const m = nextLine.text.match(BlockTitleRx)
        if (m) {
          // TODO avoid recursive call
          this.readLine()
          block = this.readBlock(dataLines, { ...opts, blockTitle: m[0] })
        }
      } else if (this.isLineComment(nextLine)) {
        block = this.readComment()
      } else if (nextLine.text.startsWith('[')) {
        const m = nextLine.text.match(BlockAttributeLineRx)
        if (m) {
          let [blockAttributesLine] = m
          blockAttributesLine = blockAttributesLine.substring(1, blockAttributesLine.length - 1)
          const blockAttributes = parseAttrList(blockAttributesLine)
          // TODO avoid recursive call
          this.readLine()
          block = this.readBlock(dataLines, { ...opts, blockAttributes })
        }
      } else if (this.isListItem(nextLine)) {
        block = this.readList(opts)
      } else {
        block = this.readParagraph(dataLines, opts)
      }
    }
    return block
  }

  readSection(level, dataLines) {
    const titleLine = this.readLine(),
      // QUESTION should we store titleLine as entry in SectionNode?
      headerText = titleLine.rawText.replace(/^=+\s+/, '').replace('\n', ''),
      sectionTitle = {
        type: 'Header',
        depth: level + 1,
        loc: {
          start: titleLine.start,
        },
        range: titleLine.range,
        children: [
          {
            type: 'Str',
            value: headerText,
            raw: headerText,
            range: titleLine.range,
            loc: titleLine.loc,
          },
        ],
        raw: titleLine.rawText,
      },
      section = {
        type: 'SectionNode',
        data: dataLines,
        loc: {
          // QUESTION should we include dataLines when defining start?
          start: titleLine.start,
        },
        // QUESTION should we store section title as TitleNode? or titleLine property?
        children: [],
      }
    let block
    // read blocks until next sibling or parent section
    // FIXME restore intervening lines if reached end of section
    while (
      (block = this.readBlock(this.readInterveningLines(section), {
        sections: true,
        sectionLevel: level,
      }))
    ) {
      section.children.push(block)
    }
    this.endBlock(section, titleLine, section.children[section.children.length - 1] || titleLine)
    section.children.unshift(sectionTitle)
    return section
  }

  // TODO consider style override when determining how to parse (i.e., composition type)
  readDelimitedBlock(dataLines, opts = {}) {
    const startDelimiterLine = this.readLine(),
      delimiterText = startDelimiterLine.text,
      delimiterStem = delimiterText === '--' ? delimiterText : delimiterText.slice(0, 4),
      delimiterInfo = BlockDelimiterMap[delimiterStem],
      supportsBlockChildren = delimiterInfo[2],
      blockType = delimiterInfo[0] === 'listing' ? 'CodeBlock' : 'DelimitedBlock',
      block = {
        type: blockType,
        delimiterLines: [this.createLineNode(startDelimiterLine)],
        enclosureType: delimiterInfo[0],
        //compositionType: (explicit style or enclosureType)
        data: dataLines,
        loc: {
          // QUESTION should we include dataLines when defining start?
          start: startDelimiterLine.start,
        },
        children: [],
      }
    let nextLine, prevLine, lastNode
    if (supportsBlockChildren) {
      let childBlock,
        dataLines = this.readInterveningLines(block),
        childOpts = {
          enclosures: [startDelimiterLine].concat(opts.enclosures || []),
        }
      while ((nextLine = this.peekLine())) {
        if (nextLine.matches(startDelimiterLine)) {
          block.delimiterLines.push(this.createLineNode((prevLine = this.readLine())))
          break
        } else if ((childBlock = this.readBlock(dataLines, childOpts))) {
          block.children.push(childBlock)
          dataLines = this.readInterveningLines(block)
        } else {
          // HACK we assume block was prematurely terminated, so move cursor to last child
          childBlock = block.children[block.children.length - 1]
          // QUESTION should we distinguish between false (early termination) and undefined (no block to read)?
          break
        }
      }
      // FIXME store orphaned data lines on block so we know they are lingering
      lastNode = prevLine || childBlock || startDelimiterLine
    } else {
      while ((nextLine = this.readLine())) {
        prevLine = nextLine
        if (nextLine.matches(startDelimiterLine)) {
          block.delimiterLines.push(this.createLineNode(nextLine, block))
          break
        }
        block.children.push(this.createLineNode(nextLine, block))
      }
      lastNode = prevLine || startDelimiterLine
    }
    this.endBlock(block, startDelimiterLine, lastNode)
    return block
  }

  readBlockMacro(dataLines) {
    const macroLine = this.readLine()
    return {
      type: 'BlockMacroNode',
      data: dataLines,
      raw: macroLine.rawText,
      range: macroLine.range,
      // QUESTION should we include dataLines when defining start?
      loc: macroLine.loc,
    }
  }

  readComment() {
    let block, nextLine
    while ((nextLine = this.peekLine())) {
      if (block) {
        if (!this.isLineComment(nextLine)) {
          break
        }
        // FIXME: update loc and range
        const line = this.readLine()
        block.raw += line.rawText
        block.value += line.rawText
      } else {
        const line = this.readLine()
        block = {
          type: 'Comment',
          value: line.rawText,
          raw: line.rawText,
          range: line.range,
          loc: line.loc,
        }
      }
    }
    return block
  }

  readList(opts) {
    let parent,
      nextLine,
      currentList,
      currentListItem,
      currentMarkup,
      nestedLists = {}
    while ((nextLine = this.peekLine())) {
      if (nextLine.isBlank()) {
        break
      }
      // TODO simplify
      const [_, markup, text] = nextLine.text.match(/^\s*(\*+)\s+(.*)/)
      if (parent) {
        if (currentMarkup === markup) {
          const block = {
            type: 'ListItem',
            value: text,
          }
          if (currentList.children) {
            currentList.children.push(block)
          } else {
            currentList.children = [block]
          }
          currentListItem = block
        } else {
          const list = nestedLists[markup]
          if (list) {
            currentListItem = {
              type: 'ListItem',
              value: text,
            }
            if (list.children) {
              list.children.push(currentListItem)
            } else {
              list.children = [currentListItem]
            }
          } else {
            const nestedListItem = {
              type: 'ListItem',
              value: text,
            }
            const nestedList = {
              type: 'UnorderedList',
              children: [nestedListItem],
            }
            nestedLists[markup] = nestedList
            if (currentListItem.children) {
              currentListItem.children.push(nestedList)
            } else {
              currentListItem.children = [nestedList]
            }
            currentListItem = nestedListItem
            currentList = nestedList
          }
        }
      } else {
        currentListItem = {
          type: 'ListItem',
          value: text,
        }
        currentList = {
          type: 'UnorderedList',
          children: [currentListItem],
        }
        nestedLists[markup] = currentList
        parent = currentList
      }
      currentMarkup = markup
      this.readLine()
    }
    return parent
  }

  readParagraph(dataLines, opts) {
    let block, nextLine
    while ((nextLine = this.peekLine())) {
      if (block) {
        if (nextLine.isBlank() || this.isStartOfBlock(nextLine)) {
          break
        }
      } else {
        if (LiteralParagraphRx.test(nextLine.text)) {
          block = {
            type: 'CodeBlock',
            enclosureType: 'literal',
            data: dataLines,
            loc: {
              // QUESTION should we include dataLines when defining start?
              start: nextLine.start,
            },
            children: [],
          }
        } else {
          let subs
          if ('blockAttributes' in opts) {
            subs = opts.blockAttributes.subs
          }
          block = {
            type: 'Paragraph',
            data: dataLines,
            subs,
            loc: {
              // QUESTION should we include dataLines when defining start?
              start: nextLine.start,
            },
            children: [],
          }
        }
      }
      // QUESTION should we store line comments in node?
      //if (!this.isLineComment(this.readLine()))
      this.readLine()
      block.children.push(this.createLineNode(nextLine, block))
    }

    if (block && block.children.length > 0) {
      // QUESTION should we store line comments in the value of raw?
      this.endBlock(block, block.children[0], block.children[block.children.length - 1])
      return block
    }
  }

  readInterveningLines(_) {
    const dataLines = []
    let nextLine
    while ((nextLine = this.peekLine())) {
      if (nextLine.isBlank()) {
        this.readLine()
      }
      try {
        const attributeEntry = this.readAttributeEntry(nextLine)
        if (attributeEntry) {
          continue
        }
      } catch (err) {
        if (err instanceof InvalidSyntaxError) {
          break
        } else {
          throw err
        }
      }
      const nextLineText = nextLine.text
      if (nextLineText && nextLineText.startsWith('[')) {
        if (nextLineText.endsWith(']') && BlockAttributeLineRx.test(nextLineText)) {
          // FIXME create proper node objects
          const line = this.readLine()
          const m = line.text.match(BlockAttributeLineRx)
          if (m) {
            let [blockAttributesLine] = m
            blockAttributesLine = blockAttributesLine.substring(1, blockAttributesLine.length - 1)
            const blockAttributes = parseAttrList(blockAttributesLine)
            inferMetadataFromFirstPositionalAttribute(blockAttributes)
            dataLines.push(blockAttributes)
          }
        } else {
          break
        }
      } else {
        // QUESTION what about line comments?
        break
      }
    }
    return dataLines
  }

  peekLine() {
    return this.lines[0]
  }

  readLine() {
    return this.lines.shift()
  }

  isStartOfBlock(line) {
    return this.isBlockMetadata(line) || this.isBlockDelimiter(line)
  }

  isBlockMetadata(line) {
    const { text } = line
    return text.startsWith('[') && BlockAttributeLineRx.test(text)
  }

  isBlockDelimiter(line) {
    if (line.isBlank()) return
    let lineText, lineTextLength, delimiterInfo
    if ((lineText = line.text) === '--') {
      return true
    }
    // FIXME need to rtrim lineText to match behavior of Asciidoctor
    else if (
      (lineTextLength = lineText.length) > 3 &&
      (delimiterInfo = BlockDelimiterMap[lineText.slice(0, 4)]) &&
      lineText.slice(1) === delimiterInfo[1].repeat(lineTextLength - 1)
    ) {
      return true
    }
    // special case for fenced code blocks
    else if (
      (lineTextLength = lineText.length) === 3 &&
      (delimiterInfo = BlockDelimiterMap[lineText.slice(0, 3)]) &&
      lineText.slice(1) === delimiterInfo[1].repeat(lineTextLength - 1)
    ) {
      return true
    }
  }

  isSectionTitle(line) {
    let lineText, m
    return !line.isBlank() && (lineText = line.text).startsWith('=') && (m = lineText.match(SectionTitleRx)) && m[1].length
  }

  isBlockMacro(line) {
    let lineText
    return !line.isBlank() && (lineText = line.text).includes('::') && BlockMacroRx.test(lineText)
  }

  isLineComment(line) {
    let lineText
    return !line.isBlank() && (lineText = line.text).startsWith('//') && !lineText.startsWith('///')
  }

  isListItem(line) {
    return !line.isBlank() && line.text.match(/^\s*\*+\s+\S/)
  }

  createLineNode(line, parent) {
    let value = line.rawText
    let subs = parent && parent.subs
    if (subs === undefined) {
      subs = NORMAL_SUBS
    }
    value = applySubstitution(value, this.attrs, subs)
    return {
      type: 'Str',
      value,
      raw: line.rawText,
      range: line.range,
      loc: line.loc,
    }
  }

  endBlock(containerNode, startNode, lastNode) {
    const range = (containerNode.range = [startNode.range[0], lastNode.range[1]])
    containerNode.raw = this.rawText.slice(range[0], range[1])
    containerNode.loc.end = lastNode.loc.end
  }

  readAttributeEntry(line) {
    const { text } = line
    if (text && text.startsWith(':')) {
      const m = text.match(AttributeEntryRx)
      // TODO read continuation lines
      if (m) {
        this.readLine()
        let [_, name, value] = m
        if (name.startsWith('!')) {
          name = name.substring(1, name.length)
        }
        if (name.endsWith('!')) {
          name = name.substring(0, name.length - 1)
        }
        if (value === undefined) {
          delete this.attrs[name]
        } else {
          this.attrs[name] = value
        }
        return {
          type: 'AttributeEntryNode',
          raw: line.rawText,
          name,
          value,
          range: line.range,
          loc: line.loc,
        }
      } else {
        throw new InvalidSyntaxError('Line is not a valid attribute entry despite starting with ":"')
      }
    }
  }
}
