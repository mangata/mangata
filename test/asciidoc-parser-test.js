'use strict'

const assert = require('assert')
const chai = require('chai')
const fs = require('fs').promises
const path = require('path')
const AsciiDocParser = require('../lib')

const AsciidoctorEngine = require('../lib/engines/asciidoctor')
const TextlintEngine = require('../lib/engines/textlint')

const engines = [
  {
    name: 'Asciidoctor',
    processor: new AsciidoctorEngine()
  },
  {
    name: 'Textlint',
    processor: new TextlintEngine()
  }
]
for (const engine of engines) {
  describe(`Engine ${engine.name}`, () => {
    describe('AsciiDocParser', () => {
      context('DocumentNode', () => {
        it('should create sparse DocumentNode from empty document', async () => {
          const result = parseFixture(await loadFixture('empty.adoc'))
          assert.equal(result.type, 'Document')
          assert.equal(result.raw, '')
          assert.deepEqual(result.children, [])
        })
      })

      const parseFixture = (fixture) => new AsciiDocParser(engine.processor).parse(fixture.contents)

      const loadFixture = async (filename) => {
        const fixturePath = path.join(__dirname, 'fixtures', filename)
        const fixtureContents = await fs.readFile(fixturePath, 'UTF-8')
        return { path: fixturePath, contents: fixtureContents }
      }
      const getSource = (node, documentNode) => documentNode.raw.slice(node.range)
    })
  })
}


