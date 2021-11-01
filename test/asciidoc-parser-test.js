'use strict'

import assert from 'assert'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import AsciiDocParser from '../lib/index.js'
import AsciidoctorEngine from '../lib/engines/asciidoctor/index.js'
import TextlintEngine from '../lib/engines/textlint/index.js'
import ChevrotainEngine from '../lib/engines/chevrotain/index.js'

import util from 'util'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
util.inspect.defaultOptions.depth = null

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
          assert.deepEqual(result, {
            body: []
          })
        })
        it('should create DelimitedBlock for each sibling delimited block of different type', async () => {
          const result = parseFixture(await loadFixture('different-blocks.adoc'))
          assert.deepEqual(result, {
            body: [
              {
                type: 'Example',
                children: [
                  {
                    type: 'Paragraph',
                    value: 'Let me show you the way.'
                  }
                ]
              },
              {
                type: 'Sidebar',
                children: [
                  {
                    type: 'Paragraph',
                    value: 'Let\'s go on a little trip.'
                  }
                ]
              }
            ]
          })
        })
        it('should create listing blocks', async () => {
          //const result = parseFixture(await loadFixture('listing-block.adoc'))
          // fixme: write assertions
        })
        it('should create nested blocks', async () => {
          //const result = parseFixture(await loadFixture('nested-blocks.adoc'))
          // fixme: write assertions
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


