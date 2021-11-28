import Asciidoctor from '@asciidoctor/core'

const asciidoctor = Asciidoctor()

function toDocumentObjectModel(doc, text) {
  const children = doc.getBlocks().map((block) => toNode(block))
  return {
    body: children
  }
}

function toNode(block) {
  let type
  if (block.getNodeName() === 'sidebar') {
    type = 'Sidebar'
  } else if (block.getNodeName() === 'example') {
    type = 'Example'
  } else if (block.getNodeName() === 'paragraph') {
    type = 'Paragraph'
  } else if (block.getNodeName() === 'listing') {
    type = 'Listing'
  } else if (block.getNodeName() === 'section') {
    type = 'Section'
  } else {
    type = 'Block'
  }
  if (block.getNodeName() === 'paragraph') {
    return {
      type,
      value: block.getContent().replace('&#8217;', '\'')
    }
  }
  if (block.getNodeName() === 'section') {
    return {
      type,
      title: block.getTitle(),
      level: block.getLevel(),
      children: block.getBlocks().map((block) => toNode(block))
    }
  }
  if (block.getNodeName() === 'listing') {
    return {
      type,
      children: [
        {
          type: 'Str',
          value: block.lines.join('\n')
        }
      ]
    }
  }
  return {
    type,
    children: block.getBlocks().map((block) => toNode(block))
  }
}

export default class AsciidoctorParser {
  parse(text) {
    const doc = asciidoctor.load(text)
    // fixme: transform doc into a generic DOM
    const result = toDocumentObjectModel(doc, text)
    return result
  }
}
