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
  if (enclosureType === 'listing') {
    return 'Listing'
  }
  if (enclosureType === 'literal') {
    return 'Verbatim'
  }
  return enclosureType
}

function aggregateContiguousStr(nodes) {
  let agg = []
  const result = []
  for (const node of nodes) {
    if (node.type === 'Str') {
      agg.push(node)
    } else if (agg.length > 0) {
      agg.map((block) => block.value).join('')
        // remove trailing \n
        .slice(0, -1)
      result.push({
        type: 'Str',
        value
      })
      agg = []
    } else {
      result.push(node)
    }
  }
  if (agg.length > 0) {
    const value = agg.map((block) => block.value).join('')
      // remove trailing \n
      .slice(0, -1)
    result.push({
      type: 'Str',
      value
    })
  }
  return result
}

function toNode(block) {
  if (block.type === 'Str') {
    return block
  }
  if (block.type === 'Paragraph') {
    return {
      type: block.type,
      value: (block.children || []).map((block) => block.value).join('').slice(0, -1)
    }
  }
  if (block.type === 'CodeBlock') {
    const type = toBlockType(block.enclosureType)
    const value = (block.children || []).map((block) => block.value).join('')
      // remove trailing \n
      .slice(0, -1)
    const children = [{
      type: 'Str',
      value
    }]
    return {
      type,
      children
    }
  }
  if (block.type === 'DelimitedBlock') {
    const type = toBlockType(block.enclosureType)
    return {
      type,
      children: aggregateContiguousStr(block.children || []).map((block) => toNode(block))
    }
  }
  if (block.type === 'SectionNode') {
    const title = block.children[0].children[0].value
    const level = block.children[0].depth - 1
    const children = block.children.slice(1).map((block) => toNode(block))
    return {
      type: 'Section',
      title,
      level,
      children
    }
  }
  return {
    type: block.type,
    children: (block.children || []).map((block) => toNode(block))
  }
}

export default class MangataParser {
  parse(text) {
    const doc = new AsciiDocParser(text).parse()
    // fixme: transform doc into a generic DOM
    return toDocumentObjectModel(doc, text)
  }
}
