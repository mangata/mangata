'use strict'

import AsciiDocParser from './asciidoc-parser.js'

function toDocumentObjectModel(doc, text) {
  let headerNode
  if (doc.children.length && doc.children[0].type === 'HeaderNode') {
    headerNode = doc.children.splice(0, 1)[0]
  }
  const children = doc.children.filter((block) => block.type !== 'Comment').map((block) => toNode(block))
  const result = {
    ...(headerNode && {
      header: {
        title: headerNode.children[0].children[0].value,
      },
    }),
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
    return 'Literal'
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
      result.push({
        type: 'Str',
        lines: agg.map((block) => block.value),
      })
      agg = []
    } else {
      result.push(node)
    }
  }
  if (agg.length > 0) {
    result.push({
      type: 'Str',
      lines: agg.map((block) => block.value),
    })
  }
  return result
}

function toNode(block) {
  if (block.type === 'Str') {
    return block
  }
  if (block.type === 'UnorderedList') {
    return block
  }
  if (block.type === 'Paragraph' || block.type === 'Quote') {
    if (block.type === 'Quote' && block.attributes) {
      delete block.attributes.style
    }
    return {
      type: block.type,
      ...(block.attributes && { attributes: block.attributes }),
      lines: [(block.children || []).map((block) => block.value).join(' ')],
    }
  }
  if (block.type === 'CodeBlock') {
    const type = toBlockType(block.enclosureType)
    const lines = (block.children || []).map((block) => block.value)
    const children = [
      {
        type: 'Str',
        lines,
      },
    ]
    return {
      type,
      ...('style' in block && { style: block.style }),
      ...(block.attributes && { attributes: block.attributes }),
      children,
    }
  }
  if (block.type === 'DelimitedBlock') {
    const type = toBlockType(block.enclosureType)
    if (block.attributes) {
      // fixme: style is wrong :(
      delete block.attributes.style
    }
    return {
      type,
      ...(block.attributes && { attributes: block.attributes }),
      children: aggregateContiguousStr(block.children || []).map((block) => toNode(block)),
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
      children,
    }
  }
  return {
    type: block.type,
    children: (block.children || []).map((block) => toNode(block)),
  }
}

export default class MangataParser {
  parse(text) {
    const doc = new AsciiDocParser(text).parse()
    // fixme: transform doc into a generic DOM
    return toDocumentObjectModel(doc, text)
  }
}
