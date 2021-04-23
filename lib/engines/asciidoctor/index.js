const asciidoctor = require('@asciidoctor/core')()

module.exports = class AsciidoctorParser {
  parse (text) {
    const doc = asciidoctor.load(text)
    // fixme: transform doc into a generic DOM
    const result = {
      type: 'Document',
      raw: text,
      children: doc.getBlocks()
    }
    return result
  }
}
