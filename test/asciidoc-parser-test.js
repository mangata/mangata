'use strict'

import assert from 'assert'
import chai from 'chai'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import AsciiDocParser from '../lib/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
import AsciidoctorEngine from '../lib/engines/asciidoctor/index.js'
import TextlintEngine from '../lib/engines/textlint/index.js'
import ChevrotainEngine from '../lib/engines/chevrotain/index.js'

const engines = [
  {
    name: 'Asciidoctor',
    processor: new AsciidoctorEngine()
  },
  {
    name: 'Textlint',
    processor: new TextlintEngine()
  },
  {
    name: 'Chevrotain',
    processor: new ChevrotainEngine()
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
        it('should create DelimitedBlock for each sibling delimited block of different type', async () => {
          const result = parseFixture(await loadFixture('different-blocks.adoc'))
          assert.equal(result.children.length, 2)
          result.children.forEach((block) => {
            assert.equal(block.type, 'DelimitedBlock')
            assert.equal(block.children.length, 1)
            assert.equal(block.children[0].type, 'Paragraph')
          })
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


