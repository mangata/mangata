import Asciidoctor from '@asciidoctor/core'

const asciidoctor = Asciidoctor()

function toDocumentObjectModel(doc, text) {
  const children = doc.getBlocks().map((block) => toNode(block))
  const result = {
    type: 'Document',
    raw: text,
    children: children
  }
  return result
}

function toNode (block) {
  let type
  if (block.getNodeName() === 'sidebar' || block.getNodeName() === 'example') {
    type = 'DelimitedBlock'
  } else if (block.getNodeName() === 'paragraph') {
    type = 'Paragraph'
  } else {
    type = 'Block'
  }
  return {
    type,
    raw: '',
    children: block.getBlocks().map((block) => toNode(block))
  }
}

export default class AsciidoctorParser {
  parse (text) {
    const doc = asciidoctor.load(text)
    // fixme: transform doc into a generic DOM
    return toDocumentObjectModel(doc, text)
  }
}
