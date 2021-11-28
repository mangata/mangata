'use strict'

import 'mocha'
import assert from 'assert'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import AsciiDocParser from '../lib/index.js'
import AsciidoctorEngine from '../lib/engines/asciidoctor/index.js'
import TextlintEngine from '../lib/engines/textlint/index.js'

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
  }
]
for (const engine of engines) {
  describe(`Engine ${engine.name}`, () => {
    describe('AsciiDocParser', () => {
      describe('Blocks', () => {
        it('should create sparse DocumentNode from empty document', async () => {
          return assertDeepEqual('empty')
        })
        it('should create DelimitedBlock for each sibling delimited block of different type', async () => {
          return assertDeepEqual('different-blocks')
        })
        it('should create listing blocks', async () => {
          return assertDeepEqual('listing-block')
        })
        it('should create nested blocks', async () => {
          return assertDeepEqual('nested-blocks')
        })
        it('should create a single line paragraph block', async () => {
          return assertDeepEqual('paragraph-single-line')
        })
        it('should create a section block', async () => {
          return assertDeepEqual('section')
        })
      })

      const assertDeepEqual = async (fixtureName) => {
        const input = await loadFixture(`${fixtureName}.adoc`)
        const expected = JSON.parse((await loadFixture(`${fixtureName}.expected.asg.json`)).contents)
        const result = parseFixture(input)
        assert.deepEqual(result, expected)
      }

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


