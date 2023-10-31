'use strict'

import { promises as fs } from 'node:fs'
import assert from 'node:assert'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import util from 'node:util'
import { describe, it } from 'node:test'

import MangataParser from '../lib/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
util.inspect.defaultOptions.depth = null

const engines = [
  {
    name: 'Mangata',
    processor: new MangataParser(),
  },
]
describe('AsciiDocParser', () => {
  for (const engine of engines) {
    describe(`Engine ${engine.name}`, () => {
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
        it('should create section blocks', async () => {
          return assertDeepEqual('sections')
        })
        it('should create a verbatim block', async () => {
          return assertDeepEqual('verbatim-block')
        })
        it('should create an example block', async () => {
          return assertDeepEqual('example-block')
        })
        it('should create example blocks', async () => {
          return assertDeepEqual('example-blocks')
        })
        it('should create a multiline paragraph block', async () => {
          return assertDeepEqual('paragraph-multiline')
        })
        it('should create a unordered list block', async () => {
          return assertDeepEqual('unordered-list')
        })
        it('should create a nested unordered list', async () => {
          return assertDeepEqual('unordered-list-nested')
        })
        it('should create a nested unordered list (depth of 5)', async () => {
          return assertDeepEqual('unordered-list-nested-depth5')
        })
        it('should create a nested unordered list (depth of 10)', async () => {
          return assertDeepEqual('unordered-list-nested-depth10')
        })
        it('should create a nested unordered and list (non-contiguous)', async () => {
          return assertDeepEqual('unordered-list-nested-non-contiguous')
        })
      })
      describe('Document', () => {
        it('should create a sample document', async () => {
          return assertDeepEqual('sample')
        })
      })
      describe('Attribute References Substitution', () => {
        it('should substitute attribute reference', async () => {
          return assertDeepEqual('attribute-references-substitution')
        })
        it('should not substitute when the value is escaped', async () => {
          return assertDeepEqual('attribute-references-substitution-escape')
        })
        it('should substitute with the latest value', async () => {
          return assertDeepEqual('attribute-references-substitution-redefinition')
        })
        it('should not substitute when subs is empty', async () => {
          return assertDeepEqual('attribute-references-substitution-subs-empty')
        })
        it('should not substitute when subs is none', async () => {
          return assertDeepEqual('attribute-references-substitution-subs-none')
        })
        it('should not substitute attributes when "attributes" is removed from subs', async () => {
          return assertDeepEqual('attribute-references-substitution-subs-remove-attributes')
        })
        it('should not substitute when the value is unset', async () => {
          return assertDeepEqual('attribute-references-substitution-unset')
        })
      })

      const assertDeepEqual = async (fixtureName) => {
        const input = await loadFixture(`${fixtureName}.adoc`)
        const expected = JSON.parse((await loadFixture(`${fixtureName}.expected.asg.json`)).contents)
        const result = parseFixture(input)
        assert.deepStrictEqual(result, expected)
      }

      const parseFixture = (fixture) => engine.processor.parse(fixture.contents)

      const loadFixture = async (filename) => {
        const fixturePath = path.join(__dirname, 'fixtures', filename)
        const fixtureContents = await fs.readFile(fixturePath, 'UTF-8')
        return { path: fixturePath, contents: fixtureContents }
      }
    })
  }
})
