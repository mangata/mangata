'use strict'

import 'mocha'
import assert from 'assert'
import parse from '../lib/parser/attribute-list.js'


describe('Attribute list', () => {
  it('collect unnamed attribute', () => {
    const result = parse('quote')
    assert.deepEqual(result, { $positional: { '1': 'quote' } })
  })
  it('collect unnamed attribute double-quoted', () => {
    const result = parse('"quote"')
    assert.deepEqual(result, { $positional: { '1': 'quote' } })
  })
  it('collect empty unnamed attribute double-quoted', () => {
    const result = parse('""')
    assert.deepEqual(result, { $positional: { '1': '' } })
  })
  it('collect named attribute', () => {
    const result = parse('foo=bar')
    assert.deepEqual(result, { foo: 'bar' })
  })
  it('collect unnamed attribute double-quoted containing escaped quote', () => {
    const result = parse('"ba\\"zaar"')
    assert.deepEqual(result, { $positional: { '1': 'ba"zaar' } })
  })
  it('collect unnamed attribute single-quoted containing escaped quote', () => {
    const result = parse('\'ba\\\'zaar\'')
    assert.deepEqual(result, { $positional: { '1': 'ba\'zaar' } })
  })
  it('collect unnamed attribute single-quoted', () => {
    const result = parse('\'quote\'')
    assert.deepEqual(result, { $positional: { '1': 'quote' } })
  })
  it('collect empty unnamed attribute single-quoted', () => {
    const result = parse('\'\'')
    assert.deepEqual(result, { $positional: { '1': '' } })
  })
  it('collect isolated single quote positional attribute', () => {
    const result = parse('\'')
    assert.deepEqual(result, { $positional: { '1': '\'' } })
  })
  it('collect isolated single quote attribute value', () => {
    const result = parse('name=\'')
    assert.deepEqual(result, { name: '\'' })
  })
  it('collect unnamed attribute with dangling delimiter', () => {
    const result = parse('quote , ')
    assert.deepEqual(result, { $positional: { '1': 'quote', '2': null } })
  })
  it('collect unnamed attribute in second position after empty attribute', () => {
    const result = parse(', John Smith')
    assert.deepEqual(result, { $positional: { '1': null, '2': 'John Smith' } })
  })
  it('collect unnamed attributes', () => {
    const result = parse('first, second one, third')
    assert.deepEqual(result, { $positional: { '1': 'first', '2': 'second one', '3': 'third' } })
  })
  it('collect blank unnamed attributes', () => {
    const result = parse('first,,third,')
    assert.deepEqual(result, { $positional: { '1': 'first', '2': null, '3': 'third', '4': null } })
  })
  it('collect unnamed attribute enclosed in equal signs', () => {
    const result = parse('=foo=')
    assert.deepEqual(result, { $positional: { '1': '=foo=' } })
  })
  it('collect named attribute double-quoted', () => {
    const result = parse('foo="bar"')
    assert.deepEqual(result, { foo: 'bar' })
  })
  it('collect named attribute with double-quoted empty value', () => {
    const result = parse('height=100,caption="",link="images/octocat.png"')
    assert.deepEqual(result, { height: '100', caption: '', link: 'images/octocat.png' })
  })
  it('collect named attribute single-quoted', () => {
    const result = parse('foo=\'bar\'')
    assert.deepEqual(result, { foo: 'bar' })
  })
  it('collect named attribute with single-quoted empty value', () => {
    const result = parse('height=100,caption=\'\',link=\'images/octocat.png\'')
    assert.deepEqual(result, { height: '100', caption: '', link: 'images/octocat.png' })
  })
  it('collect single named attribute with empty value', () => {
    const result = parse('foo=')
    assert.deepEqual(result, { foo: '' })
  })
  it('collect single named attribute with empty value', () => {
    const result = parse('foo=,bar=baz')
    assert.deepEqual(result, { foo: '', bar: 'baz' })
  })
  it('collect named attributes unquoted', () => {
    const result = parse('first=value, second=two, third=3')
    assert.deepEqual(result, { first: 'value', second: 'two', third: '3' })
  })
  it('collect named attributes quoted', () => {
    const result = parse('first=\'value\', second=\"value two\", third=three')
    assert.deepEqual(result, { first: 'value', second: 'value two', third: 'three' })
  })
  it('collect named attributes quoted containing non-semantic spaces', () => {
    const result = parse('     first    =     \'value\', second     ="value two"     , third=       three      ')
    assert.deepEqual(result, { first: 'value', second: 'value two', third: 'three' })
  })
  it('collect mixed named and unnamed attributes', () => {
    const result = parse('first, second="value two", third=three, Sherlock Holmes')
    assert.deepEqual(result, { second: 'value two', third: 'three', $positional: { '1': 'first', '2': 'Sherlock Holmes' } })
  })
  it('collect mixed empty named and blank unnamed attributes', () => {
    const result = parse('first,,third=,,fifth=five')
    assert.deepEqual(result, { third: '', fifth: 'five', $positional: { '1': 'first', '2': null, '3': null } })
  })
  it('collect options attribute', () => {
    const result = parse('quote, options=\'opt1,,opt2 , opt3\'')
    assert.deepEqual(result, { 'opt1-option': '', 'opt2-option': '', 'opt3-option': '', $positional: { '1': 'quote' } })
  })
  it('collect opts attribute as options', () => {
    const result = parse('quote, opts=\'opt1,,opt2 , opt3\'')
    assert.deepEqual(result, { 'opt1-option': '', 'opt2-option': '', 'opt3-option': '', $positional: { '1': 'quote' } })
  })
  it('ignore options attribute if empty', () => {
    const result = parse('quote, opts=')
    assert.deepEqual(result, { $positional: { '1': 'quote' } })
  })
})
