'use strict'

import AsciiDocParser from './asciidoc-parser.js'

function toDocumentObjectModel(doc, text) {
  const children = doc.children.map((block) => toNode(block))
  const result = {
    body: children,
  }
  return result
}

function toBlockType(enclosureType) {
  if (enclosureType === 'example') {
    return 'Example'
  }
  if (enclosureType === 'sidebar') {
    return 'Sidebar'
  }
  return enclosureType
}

function toNode(block) {
  if (block.type === 'Paragraph') {
    return {
      type: block.type,
      value: block.children[0].value.slice(0, -1)
    }
  }
  if (block.type === 'DelimitedBlock') {
    return {
      type: toBlockType(block.enclosureType),
      children: (block.children || []).map((block) => toNode(block))
    }
  }
  return {
    type: block.type,
    children: (block.children || []).map((block) => toNode(block))
  }
}

export default class TextlintParser {
  parse(text) {
    const doc = new AsciiDocParser(text).parse()
    // fixme: transform doc into a generic DOM
    return toDocumentObjectModel(doc, text)
  }
}
