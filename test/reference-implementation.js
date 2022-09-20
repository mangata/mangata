import Asciidoctor from '@asciidoctor/core'

const asciidoctor = Asciidoctor()

function toDocumentObjectModel(doc, text) {
  const children = doc.getBlocks().map((block) => toNode(block))
  return {
    ...(doc.hasHeader() && {
      header: {
        title: doc.getDocumentTitle(),
      },
    }),
    body: children,
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
  } else if (block.getNodeName() === 'literal') {
    type = 'Literal'
  } else if (block.getNodeName() === 'section') {
    type = 'Section'
  } else if (block.getNodeName() === 'ulist') {
    type = 'UnorderedList'
  } else if (block.getNodeName() === 'quote') {
    type = 'Quote'
  } else {
    type = 'Block'
  }
  if (block['$content_model']() === 'simple') {
    const attributes = {}
    const id = block.getId()
    if (id) {
      attributes.id = id
    }
    const subs = block.subs.filter((sub) => sub !== 'replacements')
    return {
      type,
      ...(Object.keys(attributes).length > 0 && { attributes }),
      lines: [block.lines.map((l) => block.applySubstitutions(l, subs)).join(' ')],
    }
  }
  if (block.getNodeName() === 'paragraph') {
    const subs = block.subs.filter((sub) => sub !== 'replacements')
    return {
      type,
      lines: [block.lines.map((l) => block.applySubstitutions(l, subs)).join(' ')],
    }
  }
  if (block.getNodeName() === 'section') {
    return {
      type,
      title: block.getTitle(),
      level: block.getLevel(),
      children: block.getBlocks().map((block) => toNode(block)),
    }
  }
  if (block.getNodeName() === 'listing' || block.getNodeName() === 'literal') {
    const attributes = block.getAttributes()
    let style = block.getStyle()
    if (style === block.getNodeName()) {
      delete attributes.style
    }
    //const title = block.getTitle()
    delete attributes['$positional']
    return {
      type,
      ...(Object.keys(attributes).length > 0 && { attributes }),
      children: [
        {
          type: 'Str',
          lines: block.lines,
        },
      ],
    }
  }
  if (block.getNodeName() === 'list_item') {
    const blocks = block.getBlocks()
    return {
      type: 'ListItem',
      lines: [block.getText()],
      ...(blocks.length > 0 ? { children: blocks.map((block) => toNode(block)) } : {}),
    }
  }
  if (block.getNodeName() === 'ulist') {
    return {
      type,
      children: block.getBlocks().map((block) => toNode(block)),
    }
  }
  const attributes = {}
  const id = block.getId()
  if (id) {
    attributes.id = id
  }
  return {
    type,
    ...(Object.keys(attributes).length > 0 && { attributes }),
    children: block.getBlocks().map((block) => toNode(block)),
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
