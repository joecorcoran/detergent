'use strict'
/* eslint no-template-curly-in-string: 0 */

const test = require('tape')
const he = require('he')
const detergent = require('./detergent.js')
const entityTest = require('./entity-test.json')
const util = require('./util')
const defaultsObj = util.defaultsObj
const obc = require('object-boolean-combinations')

const isLetter = util.isLetter
const isLowercaseLetter = util.isLowercaseLetter
const isUppercaseLetter = util.isUppercaseLetter

function mixer (ref) {
  return obc(defaultsObj, ref)
}

// ==============================
// 0. THROWS
// ==============================

test('00.01 - second argument is not a plain object', t => {
  t.throws(function () {
    detergent('zzz', 'zzz')
  })
  t.throws(function () {
    detergent('zzz', ['zzz'])
  })
  t.end()
})

test('00.02 - various situations in options object', t => {
  t.doesNotThrow(function () {
    detergent('zzz', {
      keepBoldEtc: 1 // 0/1 is acceptable
    })
  })
  t.throws(function () {
    detergent('zzz', {
      keepBoldEtc: 'true' // string as value - throw
    })
  })
  t.throws(function () {
    detergent('zzz', {
      keepBoldEtc: true,
      zzz: true // rogue key
    })
  })
  t.doesNotThrow(function () {
    detergent('zzz', {
      keepBoldEtc: true // valid key - fine
    })
  })
  t.doesNotThrow(function () {
    detergent('zzz', {}) // empty options object - fine
  })
  t.end()
})

test('00.03 - second argument object\'s values throw when set to non-Boolean', t => {
  t.throws(function () {
    detergent('zzz', {removeWidows: 'yyy'})
  })
  t.throws(function () {
    detergent('zzz', {convertEntities: 'yyy'})
  })
  t.throws(function () {
    detergent('zzz', {convertDashes: 'yyy'})
  })
  t.throws(function () {
    detergent('zzz', {convertApostrophes: 'yyy'})
  })
  t.throws(function () {
    detergent('zzz', {replaceLineBreaks: 'yyy'})
  })
  t.throws(function () {
    detergent('zzz', {removeLineBreaks: 'yyy'})
  })
  t.throws(function () {
    detergent('zzz', {useXHTML: 'yyy'})
  })
  t.throws(function () {
    detergent('zzz', {removeSoftHyphens: 'yyy'})
  })
  t.throws(function () {
    detergent('zzz', {dontEncodeNonLatin: 'yyy'})
  })
  t.throws(function () {
    detergent('zzz', {keepBoldEtc: 'yyy'})
  })
  t.end()
})

// ==============================
// 01. INVISIBLES
// ==============================

// var all settings combinations with removeWidows = true/false overrides
var allCombinations = mixer()

test('01.01 - invisibles', t => {
  t.is(detergent('\u0000\u0001\u0002\u0004\u0005\u0006\u0007\u0008\u000E\u000F\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017\u0018\u0019\u001A\u001B\u001C\u001D\u001E\u001F\u007F\u0080\u0081\u0082\u0083\u0084\u0086\u0087\u0088\u0089\u008A\u008B\u008C\u008D\u008E\u008F\u0090\u0091\u0092\u0093\u0094\u0095\u0096\u0097\u0098\u0099\u009A\u009B\u009C\u009D\u009E\u009F'),
  '',
  '01.01 - invisibles being removed')
  t.end()
})

test('01.02 - hairspace to space', function (t) {
  mixer({
    removeWidows: false,
    convertDotsToEllipsis: true,
    keepBoldEtc: true
  })
  .forEach(function (elem, i) {
    t.is(
      detergent('a&hairsp;a&VeryThinSpace;a&#x0200A;a&#8202;a\u200Aa', elem),
      'a a a a a a',
      '01.02.01 - hairspace changed to space'
    )
    t.is(
      detergent('a    &hairsp;  a  &VeryThinSpace;   a &#x0200A;     a              &#8202; a \u200A a    ', elem),
      'a a a a a a',
      '01.02.02 - hairspace changed to space (lots of spaces)'
    )
  })
  mixer({
    removeWidows: true,
    convertEntities: true,
    convertDotsToEllipsis: true,
    keepBoldEtc: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a&hairsp;a&VeryThinSpace;a&#x0200A;a&#8202;a\u200Aa', elem),
      'a a a a a&nbsp;a',
      '01.02.03 - hairspace changed to space: +widows+entities'
    )
  })
  t.end()
})

test('01.03 - invisible breaks', function (t) {
  mixer({
    replaceLineBreaks: false,
    removeLineBreaks: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a\u000Ab\u000Bc\u000C\u000D\u2028\u2029\u0003d', elem),
      'a\nb\nc\n\n\n\n\nd',
      '01.03.01'
    )
    t.is(
      detergent('a&#10;b&#11;c&#12;&#13;&#8232;&#8233;&#3;d', elem),
      'a\nb\nc\n\n\n\n\nd',
      '01.03.02'
    )
  })
  mixer({
    removeLineBreaks: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a\u000Bb\u000C\u000D\u0085c\u2028\u2029d', elem),
      'abcd',
      '01.03.03 - invisible breaks and remove all line breaks on'
    )
  })
  mixer({
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a\u000Ab\u000Bc\u000C\u000D\u0085\u2028\u2029d', elem),
      'a<br />\nb<br />\nc<br />\n<br />\n<br />\n<br />\n<br />\nd',
      '01.03.04 - replace breaks into XHTML BR\'s'
    )
  })
  mixer({
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a\u000Ab\u000Bc\u000C\u000D\u0085\u2028\u2029d', elem),
      'a<br>\nb<br>\nc<br>\n<br>\n<br>\n<br>\n<br>\nd',
      '01.03.05 - replace breaks into HTML BR\'s'
    )
  })
  t.end()
})

// ==============================
// 02. o.removeSoftHyphens
// ==============================

test('02.01 - soft hyphens', function (t) {
  mixer({
    removeSoftHyphens: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\u00ADbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', elem),
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      '02.01.01 - remove soft hyphens'
    )
  })
  mixer({
    convertEntities: false,
    removeSoftHyphens: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\u00ADbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', elem),
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\u00ADbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      '02.01.02 - don\'t remove soft hyphens, but don\'t encode either'
    )
  })
  mixer({
    convertEntities: true,
    removeSoftHyphens: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\u00ADbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', elem),
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&shy;bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      '02.01.03 - don\'t remove soft hyphens, encode into &shy'
    )
  })
  t.end()
})

// ==============================
// 03. strip the HTML
// ==============================

test('03.01 - strip HTML', function (t) {
  mixer({
    removeWidows: false,
    convertDotsToEllipsis: true,
    removeSoftHyphens: true,
    convertDashes: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('text <a>text</a> text', elem),
      'text text text',
      '03.01.01 - strip the HTML'
    )
    t.is(
      detergent('text <a>text<a> text', elem),
      'text text text',
      '03.01.02 - strip the HTML'
    )
    t.is(
      detergent('text <error>text<error> text', elem),
      'text text text',
      '03.01.03 - strip the HTML'
    )
    t.is(
      detergent('text <sldkfj asdasd="lekjrtt" lgkdjfld="lndllkjfg">text<hgjkd> text', elem),
      'text text text',
      '03.01.04 - strip the HTML'
    )
    t.is(
      detergent('text <a href="#" style="display: block;">text</a> text', elem),
      'text text text',
      '03.01.05 - strip the HTML'
    )
  })
  t.end()
})

// ==============================
// 04. o.convertEntities
// ==============================

test('04.01 - convert to entities - pound', function (t) {
  mixer({
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('\u00A3', elem),
      '&pound;',
      '04.01.01 - pound char converted into entity: +entities'
    )
  })
  mixer({
    convertEntities: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('\u00A3', elem),
      '\u00A3',
      '04.01.02 - pound char not converted into entity: -entities'
    )
  })
  t.end()
})

test('04.02 - convert to entities - m-dash', function (t) {
  mixer({
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('\u2014', elem),
      '&mdash;',
      '04.02.01 - M dash char encoded into entity: +entities'
    )
  })
  mixer({
    convertEntities: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('\u2014', elem),
      '\u2014',
      '04.02.02 - M dash char not converted into entity: -entities'
    )
  })
  t.end()
})

test('04.03 - hairspaces', function (t) {
  mixer({
    convertEntities: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('a\u200A&mdash;\u200Aa', elem),
      'a \u2014 a',
      '04.03.01 - hairspaces'
    )
  })
  mixer({
    convertEntities: true,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('HOORAY  \u2014  IT’S HERE \u200A', elem),
      'HOORAY &mdash; IT&rsquo;S HERE',
      '04.03.02 - hairspaces'
    )
  })
  mixer({
    convertEntities: true,
    removeWidows: false,
    convertDashes: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('HOORAY  -  IT’S HERE \u200A', elem),
      'HOORAY &mdash; IT&rsquo;S HERE',
      '04.03.03 - hairspaces'
    )
  })
  mixer({
    convertEntities: true,
    removeWidows: false,
    convertDashes: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('HOORAY  -  IT’S HERE \u200A', elem),
      'HOORAY - IT&rsquo;S HERE',
      '04.03.04 - hairspaces'
    )
  })
  mixer({
    convertEntities: true,
    removeWidows: true,
    convertDashes: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('HOORAY  -  IT’S HERE \u200A', elem),
      'HOORAY - IT&rsquo;S&nbsp;HERE',
      '04.03.05 - hairspaces'
    )
  })
  mixer({
    convertEntities: true,
    removeWidows: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('HOORAY  \u2014  IT’S HERE \u200A', elem),
      'HOORAY&nbsp;&mdash; IT&rsquo;S&nbsp;HERE',
      '04.03.06 - hairspaces'
    )
  })
  t.end()
})

// convertDashes: true

test('04.04 - dash tests', function (t) {
  // --- PART I ---
  mixer({
    convertDashes: true,
    convertEntities: true,
    removeWidows: true,
    convertDotsToEllipsis: true,
    removeSoftHyphens: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaaaaaaaaaa - aaaaaaaaaaaa', elem),
      'aaaaaaaaaaa&nbsp;&mdash; aaaaaaaaaaaa',
      '04.04.01 - nbsp, dash'
    )
  })
  mixer({
    convertDashes: false,
    convertDotsToEllipsis: true,
    removeSoftHyphens: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaaaaaaaaaa - aaaaaaaaaaaa', elem),
      'aaaaaaaaaaa - aaaaaaaaaaaa',
      '04.04.02 - no nbsp, dash'
    )
  })
  mixer({
    convertEntities: true,
    removeWidows: true,
    convertDotsToEllipsis: true,
    removeSoftHyphens: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaaaaaaaaaa \u2014 aaaaaaaaaaaa &mdash; aaaaaaaaaaaa', elem),
      'aaaaaaaaaaa&nbsp;&mdash; aaaaaaaaaaaa&nbsp;&mdash;&nbsp;aaaaaaaaaaaa',
      '04.04.03 - nbsp, dash'
    )
  })
  // --- PART II ---
  mixer({
    convertEntities: true,
    removeWidows: true,
    convertDotsToEllipsis: true,
    removeSoftHyphens: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a \u2014a', elem),
      'a&nbsp;&mdash; a',
      '04.04.05 - missing space after m-dash'
    )
  })
  mixer({
    convertEntities: true,
    removeWidows: false,
    convertDotsToEllipsis: true,
    removeSoftHyphens: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a \u2014a', elem),
      'a &mdash; a',
      '04.04.06 - missing space after m-dash'
    )
  })
  mixer({
    convertEntities: false,
    removeWidows: true,
    convertDotsToEllipsis: true,
    removeSoftHyphens: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a \u2014a', elem),
      'a\xa0\u2014 a',
      '04.04.07 - missing space after m-dash'
    )
  })
  mixer({
    convertEntities: false,
    removeWidows: false,
    convertDotsToEllipsis: true,
    removeSoftHyphens: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a \u2014a', elem),
      'a \u2014 a',
      '04.04.08 - missing space after m-dash'
    )
  })
  // --- PART III - hairlines mixed in ---
  mixer({
    convertEntities: true,
    removeWidows: true,
    convertDotsToEllipsis: true,
    removeSoftHyphens: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a\u200A\u2014a', elem),
      'a&nbsp;&mdash; a',
      '04.04.09 - hairline mdash'
    )
  })
  mixer({
    convertEntities: true,
    removeWidows: false,
    convertDotsToEllipsis: true,
    removeSoftHyphens: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a\u200A\u2014a', elem),
      'a &mdash; a',
      '04.04.10 - hairline mdash'
    )
  })
  mixer({
    convertEntities: false,
    removeWidows: true,
    convertDotsToEllipsis: true,
    removeSoftHyphens: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a\u200A\u2014a', elem),
      'a\xa0\u2014 a',
      '04.04.11 - hairline mdash'
    )
  })
  mixer({
    convertEntities: false,
    removeWidows: false,
    convertDotsToEllipsis: true,
    removeSoftHyphens: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a\u200A\u2014a', elem),
      'a \u2014 a',
      '04.04.12 - hairline mdash'
    )
  })
  // --- PART IV false positives---
  mixer({
    convertEntities: true,
    convertDotsToEllipsis: true,
    removeSoftHyphens: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('Discount: -£10.00', elem),
      'Discount: -&pound;10.00',
      '04.04.13'
    )
  })
  mixer({
    convertEntities: false,
    convertDotsToEllipsis: true,
    removeSoftHyphens: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('Discount: -£10.00', elem),
      'Discount: -£10.00',
      '04.04.14'
    )
  })
  allCombinations.forEach(function (elem) {
    t.is(
      detergent('Discount: -10.00', elem),
      'Discount: -10.00',
      '04.04.15'
    )
  })
  t.end()
})

// more hairspaces protection:
test('04.05 - hairspace protection', function (t) {
  mixer({
    convertEntities: true,
    removeWidows: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a\u200Aa a a a a a a a a \u2014 a a a a ', elem),
      'a a a a a a a a a a&nbsp;&mdash; a a a&nbsp;a',
      '04.05.01'
    )
  })
  mixer({
    convertEntities: true,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a a a a a a\u200Aa a a a \u2014 a a a a ', elem),
      'a a a a a a a a a a &mdash; a a a a',
      '04.05.02'
    )
  })
  mixer({
    convertEntities: false,
    removeWidows: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a a a a a a a a a a \u2014 a a a a \u200A', elem),
      'a a a a a a a a a a\xa0\u2014 a a a\xa0a',
      '04.05.03'
    )
  })
  mixer({
    convertEntities: false,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a a a a a a a a a a \u2014 a a a a \u200A', elem),
      'a a a a a a a a a a \u2014 a a a a',
      '04.05.04'
    )
  })
  t.end()
})

test('04.06 - astral chars conversion', function (t) {
  mixer({
    convertEntities: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('\uD834\uDF06', elem),
      '&#x1D306;',
      '04.06.01 - trigram char converted into entity'
    )
  })
  mixer({
    convertEntities: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('\uD834\uDF06', elem),
      '\uD834\uDF06',
      '04.06.02 - trigram char not converted into entity'
    )
  })
  t.end()
})

test('04.07 - paired surrogate encoding', function (t) {
  mixer({
    convertEntities: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('\uD83D\uDE0A', elem),
      '&#x1F60A;',
      '04.07.01 - paired surrogate is kept and encoded'
    )
  })
  mixer({
    convertEntities: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('\uD83D\uDE0A', elem),
      '\uD83D\uDE0A',
      '04.07.02 - paired surrogate is kept and not encoded'
    )
  })
  t.end()
})

test('04.08 - stray low surrogates removed', function (t) {
  allCombinations.forEach(function (elem) {
    t.is(
      detergent('\uFFFDa\uD800a\uD83Da\uDBFF', elem),
      'aaa',
      '04.08.01 - stray low surrogates are deleted')
  })
  allCombinations.forEach(function (elem) {
    t.is(
      detergent('\uDC00a\uDE0Aa\uDFFF', elem),
      'aa',
      '04.08.02 - stray high surrogates are deleted')
  })
  allCombinations.forEach(function (elem) {
    t.is(
      detergent('\uD835', elem),
      '',
      '04.08.03 - stray low surrogate deleted, set #2 (𝟘)')
  })
  allCombinations.forEach(function (elem) {
    t.is(
      detergent('\uDFD8', elem),
      '',
      '04.08.04 - stray high surrogate deleted, set #2 (𝟘)')
  })
  t.end()
})

test('04.09 - German characters', function (t) {
  mixer({
    convertEntities: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('gr\u00F6\u00DFer', elem),
      'gr&ouml;&szlig;er',
      '04.09.01 - gr\u00F6\u00DFer encoded'
    )
  })
  mixer({
    convertEntities: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('gr\u00F6\u00DFer', elem),
      'gr\u00F6\u00DFer',
      '04.09.02 - gr\u00F6\u00DFer not encoded'
    )
  })
  t.end()
})

// ==============================
// 05. o.removeWidows
// ==============================

test('05.01 - widows', function (t) {
  mixer({
    removeWidows: true,
    convertEntities: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa bbb ccc ddd', elem),
      'aaa bbb ccc&nbsp;ddd',
      '05.01.01 - remove widows - entities, one line string no full stop'
    )
    t.is(
      detergent('aaa bbb ccc ddd.', elem),
      'aaa bbb ccc&nbsp;ddd.',
      '05.01.02 - remove widows - entities, one line string with full stop'
    )
  })
  t.end()
})

test('05.02 - more widows', function (t) {
  mixer({
    removeWidows: true,
    convertEntities: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa bbb ccc ddd', elem),
      'aaa bbb ccc\xa0ddd',
      '05.02.01 - remove widows - no entities, one line string no full stop'
    )
    t.is(
      detergent('aaa bbb ccc ddd.', elem),
      'aaa bbb ccc\xa0ddd.',
      '05.02.02 - remove widows - no entities, one line string with full stop'
    )
  })
  t.end()
})

test('05.03 - even more widows', function (t) {
  mixer({
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa bbb ccc ddd', elem),
      'aaa bbb ccc ddd',
      '05.03.01 - don\'t remove widows - no full stop'
    )
    t.is(
      detergent('aaa bbb ccc ddd.', elem),
      'aaa bbb ccc ddd.',
      '05.03.02 - don\'t remove widows - ending with full stop'
    )
  })
  t.end()
})

test('05.04 - and a little bit more widows', function (t) {
  mixer({
    removeWidows: true,
    convertEntities: true,
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa bbb ccc ddd\n\neee fff ggg hhh', elem),
      'aaa bbb ccc&nbsp;ddd<br />\n<br />\neee fff ggg&nbsp;hhh',
      '05.04 - remove widows - two line breaks with encoding BR in XHTML'
    )
  })
  t.end()
})

test('05.05 - furthermore widows', function (t) {
  mixer({
    removeWidows: true,
    convertEntities: true,
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa bbb ccc ddd\n\neee fff ggg hhh', elem),
      'aaa bbb ccc&nbsp;ddd<br>\n<br>\neee fff ggg&nbsp;hhh',
      '05.05 - two BR\'s, widows with NBSP and HTML BR'
    )
  })
  t.end()
})

test('05.06 - and some more widows', function (t) {
  mixer({
    removeWidows: true,
    convertEntities: true,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa bbb ccc ddd\n\neee fff ggg hhh', elem),
      'aaa bbb ccc&nbsp;ddd\n\neee fff ggg&nbsp;hhh',
      '05.06 - two BR\'s, widows replaced with &nbsp'
    )
  })
  t.end()
})

test('05.07 - double widows', function (t) {
  mixer({
    removeWidows: true,
    convertEntities: false,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa bbb ccc ddd\n\neee fff ggg hhh', elem),
      'aaa bbb ccc\u00A0ddd\n\neee fff ggg\u00A0hhh',
      '05.07 - two BR\'s, widows replaced with non-encoded NBSP'
    )
  })
  t.end()
})

test('05.08 - widows with line breaks', function (t) {
  mixer({
    removeWidows: true,
    convertEntities: true,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa bbb ccc ddd\neee fff ggg hhh.', elem),
      'aaa bbb ccc ddd\neee fff ggg&nbsp;hhh.',
      '05.08.01 - one line break, no full stop - no widow fix needed'
    )
    t.is(
      detergent('aaa bbb ccc ddd.\neee fff ggg hhh.', elem),
      'aaa bbb ccc&nbsp;ddd.\neee fff ggg&nbsp;hhh.',
      '05.08.02 - one line break, with full stop - widow fix needed'
    )
  })
  t.end()
})

test('05.09 - widows with trailing space', function (t) {
  mixer({
    removeWidows: true,
    convertEntities: true,
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa bbb ccc ddd. \n\neee fff ggg hhh', elem),
      'aaa bbb ccc&nbsp;ddd.<br>\n<br>\neee fff ggg&nbsp;hhh',
      '05.09 - remove widows - trailing space'
    )
  })
  t.end()
})

test('05.10 - glues UK postcodes', function (t) {
  mixer({
    removeWidows: true,
    convertEntities: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('Some text SW1A 1AA and some more text.', elem),
      'Some text SW1A&nbsp;1AA and some more&nbsp;text.',
      '05.10.01 - properly formatted UK postcode, in caps'
    )
    t.is(
      detergent('Some text SW1A 1AA and some more text SW1A 1AA and some more text.', elem),
      'Some text SW1A&nbsp;1AA and some more text SW1A&nbsp;1AA and some more&nbsp;text.',
      '05.10.02 - multiple properly formatted postcodes'
    )
    t.is(
      detergent('This very long line of text ends with a postcode SW1A 1AA.', elem),
      'This very long line of text ends with a postcode SW1A&nbsp;1AA.',
      '05.10.03 - line ends with a postcode (full stop)'
    )
    t.is(
      detergent('this very long line of text ends with a postcode SW1A 1AA', elem),
      'this very long line of text ends with a postcode SW1A&nbsp;1AA',
      '05.10.04 - line ends with a postcode (no full stop)'
    )
    t.is(
      detergent('🦄 some text text text SW1A 1AA more text text text 🦄 aaa', elem),
      '&#x1F984; some text text text SW1A&nbsp;1AA more text text text &#x1F984;&nbsp;aaa',
      '05.10.05 - properly formatted UK postcode, some emoji'
    )
    t.is(
      detergent('Some text SW1A 1Aa and some more text.', elem),
      'Some text SW1A 1Aa and some more&nbsp;text.',
      '05.10.06 - improperly formatted UK postcode'
    )
  })
  mixer({
    removeWidows: true,
    convertEntities: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('Some text SW1A 1AA and some more text.', elem),
      'Some text SW1A\u00A01AA and some more\u00A0text.',
      '05.10.07 - properly formatted UK postcode, in caps'
    )
    t.is(
      detergent('Some text SW1A 1AA and some more text SW1A 1AA and some more text.', elem),
      'Some text SW1A\u00A01AA and some more text SW1A\u00A01AA and some more\u00A0text.',
      '05.10.08 - multiple properly formatted postcodes'
    )
    t.is(
      detergent('This very long line of text ends with a postcode SW1A 1AA.', elem),
      'This very long line of text ends with a postcode SW1A\u00A01AA.',
      '05.10.09 - line ends with a postcode (full stop)'
    )
    t.is(
      detergent('this very long line of text ends with a postcode SW1A 1AA', elem),
      'this very long line of text ends with a postcode SW1A\u00A01AA',
      '05.10.10 - line ends with a postcode (no full stop)'
    )
    t.is(
      detergent('🦄 some text text text SW1A 1AA more text text text 🦄 aaa', elem),
      '🦄 some text text text SW1A\u00A01AA more text text text 🦄\u00A0aaa',
      '05.10.11 - properly formatted UK postcode, some emoji'
    )
    t.is(
      detergent('Some text SW1A 1Aa and some more text.', elem),
      'Some text SW1A 1Aa and some more\u00A0text.',
      '05.10.12 - improperly formatted UK postcode'
    )
  })
  mixer({
    removeWidows: false,
    convertEntities: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('Some text SW1A 1AA and some more text.', elem),
      'Some text SW1A 1AA and some more text.',
      '05.10.13 - properly formatted UK postcode, in caps'
    )
    t.is(
      detergent('Some text SW1A 1AA and some more text SW1A 1AA and some more text.', elem),
      'Some text SW1A 1AA and some more text SW1A 1AA and some more text.',
      '05.10.14 - multiple properly formatted postcodes'
    )
    t.is(
      detergent('This very long line of text ends with a postcode SW1A 1AA.', elem),
      'This very long line of text ends with a postcode SW1A 1AA.',
      '05.10.15 - line ends with a postcode (full stop)'
    )
    t.is(
      detergent('this very long line of text ends with a postcode SW1A 1AA', elem),
      'this very long line of text ends with a postcode SW1A 1AA',
      '05.10.16 - line ends with a postcode (no full stop)'
    )
    t.is(
      detergent('🦄 some text text text SW1A 1AA more text text text 🦄 aaa', elem),
      '🦄 some text text text SW1A 1AA more text text text 🦄 aaa',
      '05.10.17 - properly formatted UK postcode, some emoji'
    )
    t.is(
      detergent('Some text SW1A 1Aa and some more text.', elem),
      'Some text SW1A 1Aa and some more text.',
      '05.10.18 - improperly formatted UK postcode'
    )
  })
  t.end()
})

test('05.11 - nbsp\'s not added within hidden HTML tags', function (t) {
  allCombinations.forEach(function (elem) {
    t.is(
      detergent('aaaaaaaaaaaaaaaaaaaaaaaaaaa@@@1br /@@@2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@@@1br /@@@2aaaaaaaaaaaaaaaaaaaaaaaaaaaa@@@1br /@@@2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@@@1br /@@@2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', elem),
      'aaaaaaaaaaaaaaaaaaaaaaaaaaa@@@1br /@@@2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@@@1br /@@@2aaaaaaaaaaaaaaaaaaaaaaaaaaaa@@@1br /@@@2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@@@1br /@@@2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      '05.11.01 - there\'s right slash following them'
    )
  })
  allCombinations.forEach(function (elem) {
    t.is(
      detergent('aaaaaaaaaaaaaaaaaaaaaaaaaaa@@@1br @@@2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@@@1br @@@2aaaaaaaaaaaaaaaaaaaaaaaaaaaa@@@1br @@@2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@@@1br @@@2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', elem),
      'aaaaaaaaaaaaaaaaaaaaaaaaaaa@@@1br @@@2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@@@1br @@@2aaaaaaaaaaaaaaaaaaaaaaaaaaaa@@@1br @@@2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@@@1br @@@2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      '05.11.02 - there\'s a known tag before them'
    )
  })
  allCombinations.forEach(function (elem) {
    t.is(
      detergent('aaaaaaaaaaaaaaaaaaaaaaaaaaa@@@1hr /@@@2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@@@1hr /@@@2aaaaaaaaaaaaaaaaaaaaaaaaaaaa@@@1hr /@@@2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@@@1hr /@@@2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', elem),
      'aaaaaaaaaaaaaaaaaaaaaaaaaaa@@@1hr /@@@2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@@@1hr /@@@2aaaaaaaaaaaaaaaaaaaaaaaaaaaa@@@1hr /@@@2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@@@1hr /@@@2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      '05.11.03 - hr tag, xhtml style'
    )
  })
  allCombinations.forEach(function (elem) {
    t.is(
      detergent('aaaaaaaaaaaaaaaaaaaaaaaaaaa@@@1hr @@@2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@@@1hr @@@2aaaaaaaaaaaaaaaaaaaaaaaaaaaa@@@1hr @@@2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@@@1hr @@@2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', elem),
      'aaaaaaaaaaaaaaaaaaaaaaaaaaa@@@1hr @@@2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@@@1hr @@@2aaaaaaaaaaaaaaaaaaaaaaaaaaaa@@@1hr @@@2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@@@1hr @@@2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      '05.11.04 - hr tag, html style'
    )
  })
  t.end()
})

// ==============================
// 06. testing defaults
// ==============================

test('06.01 - testing defaults', function (t) {
  t.is(
      detergent('aaa\n\nbbb\n\nccc'),
    'aaa<br />\n<br />\nbbb<br />\n<br />\nccc',
    '06.01.01 - default set - \\n replacement with BR'
  )
  t.is(
      detergent('aaa<br>bbb<br>ccc'),
    'aaa<br />\nbbb<br />\nccc',
    '06.01.02 - default set - HTML BR replacement with XHTML BR'
  )
  t.is(
      detergent('aaa<BR />< BR>bbb< BR ><BR>ccc< br >< Br>ddd'),
    'aaa<br />\n<br />\nbbb<br />\n<br />\nccc<br />\n<br />\nddd',
    '06.01.03 - default set - dirty BRs'
  )
  t.end()
})

// ==============================
// 07. testing rubbish removal
// ==============================

test('07.01 - rubbish removal', function (t) {
  allCombinations.forEach(function (elem) {
    t.is(
      detergent('\n\n \t     aaaaaa   \n\t\t  ', elem),
      'aaaaaa')
  })
  t.end()
}, '07.01 - front & back spaces stripped')

test('07.02 - excessive whitespace', function (t) {
  allCombinations.forEach(function (elem) {
    t.is(detergent('aaaaaa     bbbbbb', elem), 'aaaaaa bbbbbb')
  })
  t.end()
}, '07.02 - redundant space between words')

test('07.03 - trailing/leading whitespace', function (t) {
  mixer({
    convertEntities: true,
    convertDotsToEllipsis: true,
    removeSoftHyphens: true,
    dontEncodeNonLatin: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('&nbsp; a b', elem),
      '&nbsp; a b',
      '07.03.01 - leading nbsp'
    )
    t.is(
      detergent('a b &nbsp;', elem),
      'a b &nbsp;',
      '07.03.02 - leading nbsp'
    )
    t.is(
      detergent('&nbsp; a &nbsp;', elem),
      '&nbsp; a &nbsp;',
      '07.03.03 - surrounded with nbsp'
    )
    t.is(
      detergent('    \xa0     a     \xa0      ', elem),
      '&nbsp; a &nbsp;',
      '07.03.04 - surrounded with nbsp'
    )
    t.is(
      detergent('&nbsp;&nbsp;&nbsp; a &nbsp;&nbsp;&nbsp;', elem),
      '&nbsp;&nbsp;&nbsp; a &nbsp;&nbsp;&nbsp;',
      '07.03.05 - surrounded with nbsp'
    )
    t.is(
      detergent(' &nbsp;&nbsp;&nbsp; a &nbsp;&nbsp;&nbsp; ', elem),
      '&nbsp;&nbsp;&nbsp; a &nbsp;&nbsp;&nbsp;',
      '07.03.06 - surrounded with nbsp'
    )
  })
  mixer({
    convertEntities: false,
    convertDotsToEllipsis: true,
    removeSoftHyphens: true,
    dontEncodeNonLatin: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('&nbsp; a b', elem),
      '\xa0 a b',
      '07.03.07 - trailing nbsp'
    )
    t.is(
      detergent('a b &nbsp;', elem),
      'a b \xa0',
      '07.03.08 - trailing nbsp'
    )
    t.is(
      detergent('    &nbsp; a &nbsp;     ', elem),
      '\xa0 a \xa0',
      '07.03.09 - surrounded with nbsp'
    )
    t.is(
      detergent('    \xa0     a     \xa0           ', elem),
      '\xa0 a \xa0',
      '07.03.10 - surrounded with nbsp'
    )
    t.is(
      detergent('\xa0\xa0\xa0 a \xa0\xa0\xa0', elem),
      '\xa0\xa0\xa0 a \xa0\xa0\xa0',
      '07.03.11 - surrounded with nbsp'
    )
    t.is(
      detergent(' \xa0\xa0\xa0 a \xa0\xa0\xa0 ', elem),
      '\xa0\xa0\xa0 a \xa0\xa0\xa0',
      '07.03.12 - surrounded with nbsp'
    )
  })
  t.end()
})

// ==============================
// 08. testing ETX removal
// ==============================

test('08.01 - ETX', function (t) {
  mixer({
    removeLineBreaks: false,
    replaceLineBreaks: true,
    useXHTML: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('first\u0003second', elem),
      'first<br />\nsecond',
      '08.01.01 - replaces ETX with XHTML BR'
    )
  })
  mixer({
    removeLineBreaks: false,
    replaceLineBreaks: true,
    useXHTML: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('first\u0003second', elem),
      'first<br>\nsecond',
      '08.01.02 - replaces ETX with HTML BR'
    )
  })
  mixer({
    removeLineBreaks: false,
    replaceLineBreaks: false,
    useXHTML: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('first\u0003second', elem),
      'first\nsecond',
      '08.01.03 - replaces ETX with \\n'
    )
  })
  t.end()
})

// ==============================
// 09. o.keepBoldEtc
// ==============================

test('09.01 - retaining b tags', function (t) {
  mixer({
    keepBoldEtc: true,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('test text is being <b class="test" id="br">set in bold</b> here', elem),
      'test text is being <b>set in bold</b> here',
      '09.01.01 - B tag is retained - clean'
    )
    t.is(
      detergent('test text is being < b tralala >set in bold< /  b > here', elem),
      'test text is being <b>set in bold</b> here',
      '09.01.02 - B tag is retained - with spaces'
    )
    t.is(
      detergent('test text is being < B >set in bold< B /> here', elem),
      'test text is being <b>set in bold</b> here',
      '09.01.03 - B tag is retained - capitalised + wrong slash'
    )
  })
  mixer({
    keepBoldEtc: false,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('test text is being <b>set in bold</b> here', elem),
      'test text is being set in bold here',
      '09.01.04 - B tag is removed - clean'
    )
    t.is(
      detergent('test text is being < b >set in bold< /  b > here', elem),
      'test text is being set in bold here',
      '09.01.05 - B tag is removed - with spaces'
    )
    t.is(
      detergent('test text is being < B >set in bold<   B / > here', elem),
      'test text is being set in bold here',
      '09.01.06 - B tag is removed - capitalised + wrong slash'
    )
  })
  t.end()
})

test('09.02 - retaining i tags', function (t) {
  mixer({
    keepBoldEtc: true,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('test text is being <i>set in italic</i> here', elem),
      'test text is being <i>set in italic</i> here',
      '09.02.01 - i tag is retained - clean'
    )
    t.is(
      detergent('test text is being < i >set in italic< /  i > here', elem),
      'test text is being <i>set in italic</i> here',
      '09.02.02 - i tag is retained - with spaces'
    )
    t.is(
      detergent('test text is being < I >set in italic<   I /> here', elem),
      'test text is being <i>set in italic</i> here',
      '09.02.03 - i tag is retained - capitalised + wrong slash'
    )
  })
  mixer({
    keepBoldEtc: false,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('test text is being <i>set in italic</i> here', elem),
      'test text is being set in italic here',
      '09.02.04 - i tag is removed - clean'
    )
    t.is(
      detergent('test text is being < i >set in italic< /  i > here', elem),
      'test text is being set in italic here',
      '09.02.05 - i tag is removed - with spaces'
    )
    t.is(
      detergent('test text is being < I >set in italic<  I /> here', elem),
      'test text is being set in italic here',
      '09.02.06 - i tag is removed - capitalised + wrong slash'
    )
  })
  t.end()
})

test('09.03 - retaining STRONG tags', function (t) {
  mixer({
    keepBoldEtc: true,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('test text is being <strong id="main">set in bold</ strong> here', elem),
      'test text is being <strong>set in bold</strong> here',
      '09.03.01 - STRONG tag is retained - clean'
    )
    t.is(
      detergent('test text is being <strong id="main">set in bold<strong/> here', elem),
      'test text is being <strong>set in bold</strong> here',
      '09.03.02 - STRONG tag is retained - wrong closing slash'
    )
    t.is(
      detergent('test text is being < StRoNg >set in bold<StRoNg class="wrong1" / > here', elem),
      'test text is being <strong>set in bold</strong> here',
      '09.03.03 - STRONG tag is retained - dirty capitalisation + wrong slash'
    )
  })
  mixer({
    keepBoldEtc: false,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('test text is being <strong id="main">set in bold</ strong> here', elem),
      'test text is being set in bold here',
      '09.03.04 - STRONG tag is removed - clean'
    )
    t.is(
      detergent('test text is being <strong id="main">set in bold<strong/> here', elem),
      'test text is being set in bold here',
      '09.03.05 - STRONG tag is removed - wrong closing slash'
    )
    t.is(
      detergent('test text is being < StRoNg >set in bold<StRoNg class="wrong1" / > here', elem),
      'test text is being set in bold here',
      '09.03.06 - STRONG tag is removed - dirty capitalisation + wrong slash'
    )
  })
  t.end()
})

test('09.04 - retaining EM tags', function (t) {
  mixer({
    keepBoldEtc: true,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('test text is being <em>set in emphasis</em> here', elem),
      'test text is being <em>set in emphasis</em> here',
      '09.04.01 - EM tag is retained - clean'
    )
    t.is(
      detergent('test text is being <em id="main">set in emphasis<em/> here', elem),
      'test text is being <em>set in emphasis</em> here',
      '09.04.02 - EM tag is retained - wrong closing slash + some attributes'
    )
    t.is(
      detergent('test text is being < eM >set in emphasis<  Em  / > here', elem),
      'test text is being <em>set in emphasis</em> here',
      '09.04.03 - EM tag is retained - dirty capitalisation + wrong slash'
    )
  })
  mixer({
    keepBoldEtc: false,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('test text is being <em>set in emphasis</em> here', elem),
      'test text is being set in emphasis here',
      '09.04.04 - EM tag is removed - clean'
    )
    t.is(
      detergent('test text is being <em id="main">set in emphasis<em/> here', elem),
      'test text is being set in emphasis here',
      '09.04.05 - EM tag is removed - wrong closing slash + some attributes'
    )
    t.is(
      detergent('test text is being < eM >set in emphasis<  Em  / > here', elem),
      'test text is being set in emphasis here',
      '09.04.06 - EM tag is removed - dirty capitalisation + wrong closing slash'
    )
  })
  t.end()
})

// ==============================
// 10. o.convertDashes
// ==============================

test('10.01 - convert dashes into M dashes', function (t) {
  mixer({
    convertDashes: true,
    removeWidows: false,
    convertEntities: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('some text - some more text', elem),
      'some text &mdash; some more text',
      '10.01.01 - converts M dashes with encoding entities: +dashes-widows+entities'
    )
  })
  mixer({
    convertDashes: true,
    removeWidows: false,
    convertEntities: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('some text - some more text', elem),
      'some text \u2014 some more text',
      '10.01.02 - converts M dashes without encoding entities: +dashes-widows-entities'
    )
  })
  mixer({
    convertDashes: false,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('some text - some more text', elem),
      'some text - some more text',
      '10.01.03 - does not convert M dashes: -dashes-widows'
    )
  })
  t.end()
})

// ==============================
// 11. o.replaceLineBreaks
// ==============================

test('11.01 - replace \\n line breaks with BR', function (t) {
  mixer({
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: true,
    convertEntities: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('\n\n\ntralala\ntralala2\n\ntralala3\n\n\ntralala4\n\n\n', elem),
      'tralala<br />\ntralala2<br />\n<br />\ntralala3<br />\n<br />\n<br />\ntralala4',
      '11.01.01 - converts line breaks into XHTML BR\'s'
    )
  })
  mixer({
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: false,
    convertEntities: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('\n\ntralala\ntralala2\n\ntralala3\n\n\ntralala4\n\n\n\n', elem),
      'tralala<br>\ntralala2<br>\n<br>\ntralala3<br>\n<br>\n<br>\ntralala4',
      '11.01.02 - converts line breaks into HTML BR\'s'
    )
  })
  t.end()
})

// ==============================
// 12. o.removeLineBreaks
// ==============================

test('12    - remove \\n line breaks', function (t) {
  mixer({
    removeLineBreaks: true,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('\n\n\ntralala\ntralala2\ntralala3\n<   bR />\n\ntralala4\n\n\n', elem),
      'tralala tralala2 tralala3 tralala4',
      '12 - strips all line breaks'
    )
  })
  t.end()
})

// ==============================
// 13. o.convertApostrophes
// ==============================

test('13.01 - convert apostrophes into fancy ones', function (t) {
  mixer({
    convertApostrophes: true,
    convertEntities: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('test\'s', elem),
      'test&rsquo;s',
      '13.01.01 - converts single apostrophes - with entities'
    )
  })
  mixer({
    convertApostrophes: true,
    convertEntities: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('test\'s', elem),
      'test\u2019s',
      '13.01.02 - converts single apostrophes - no entities'
    )
  })
  mixer({
    convertApostrophes: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('test\'s', elem),
      'test\'s',
      '13.01.03 - doesn\'t convert single apostrophes'
    )
  })
  t.end()
})

test('13.02 - convert double quotes into fancy ones', function (t) {
  mixer({
    convertApostrophes: true,
    convertEntities: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('this is "citation"', elem),
      'this is &ldquo;citation&rdquo;',
      '13.02.01 - converts quotation marks into fancy ones: +entities'
    )
  })
  mixer({
    convertApostrophes: true,
    convertEntities: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('this is "citation"', elem),
      'this is \u201Ccitation\u201D',
      '13.02.02 - converts quotation marks into fancy ones: -entities'
    )
  })
  mixer({
    convertApostrophes: false,
    convertEntities: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('this is "citation"', elem),
      'this is "citation"',
      '13.02.03 - doesn\'t convert quotation marks: -apostrophes-entities'
    )
  })
  t.end()
})

// ==============================
// 14. o.convertDashes
// ==============================

// following tests are according to the Butterick's practical typography
// http://practicaltypography.com/hyphens-and-dashes.html

// N dash - use case #1
test('14.01 - converts dashes', function (t) {
  mixer({
    convertDashes: true,
    convertEntities: true,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('1880-1912, pages 330-39', elem),
      '1880&ndash;1912, pages 330&ndash;39',
      '14.01.01 - converts dashes into N dashes: +dashes+entities-widows'
    )
  })
  mixer({
    convertDashes: true,
    convertEntities: false,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('1880-1912, pages 330-39', elem),
      '1880\u20131912, pages 330\u201339',
      '14.01.02 - converts dashes into N dashes: +dashes-entities-widows'
    )
  })
  mixer({
    convertDashes: false,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('1880-1912, pages 330-39', elem),
      '1880-1912, pages 330-39',
      '14.01.03 - doesn\'t convert N dashes when is not asked to: -dashes-widows'
    )
  })
  t.end()
})

// ==============================
// 15. o.dontEncodeNonLatin
// ==============================

test('15    - doesn\'t encode non-Latin', function (t) {
  mixer({
    dontEncodeNonLatin: true,
    convertEntities: true,
    removeWidows: false,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('Greek: \u03A1\u03CC\u03B9\u03C3\u03C4\u03BF\u03BD \u03AE\u03C4\u03B1\u03BD \u03B5\u03B4\u03CE\nRussian: \u0420\u043E\u0438\u0441\u0442\u043E\u043D\nJapanese: \u30ED\u30A4\u30B9\u30C8\u30F3\nChinese: \u7F85\u4F0A\u65AF\u9813\nHebrew: \u05E8\u05D5\u05D9\u05E1\u05D8\u05D5\u05DF\nArabic: \u0631\u0648\u064A\u0633\u062A\u0648\u0646', elem),
      'Greek: \u03A1\u03CC\u03B9\u03C3\u03C4\u03BF\u03BD \u03AE\u03C4\u03B1\u03BD \u03B5\u03B4\u03CE\nRussian: \u0420\u043E\u0438\u0441\u0442\u043E\u043D\nJapanese: \u30ED\u30A4\u30B9\u30C8\u30F3\nChinese: \u7F85\u4F0A\u65AF\u9813\nHebrew: \u05E8\u05D5\u05D9\u05E1\u05D8\u05D5\u05DF\nArabic: \u0631\u0648\u064A\u0633\u062A\u0648\u0646',
      '15 - doesn\'t convert non-latin characters'
    )
  })
  t.end()
})

// ==============================
// 16. checking all numeric entities encoded in hyphens-and-dashes
// such as, for example, &#118; or &#39; - range 0-255
// ==============================

test('16    - numeric entities', function (t) {
  t.is(
      detergent('aaaaaaa aaaaaaaaa aaaaaaaaaa&#160;bbbb'),
    'aaaaaaa aaaaaaaaa aaaaaaaaaa&nbsp;bbbb',
    '16.01 - numeric entities'
  )
  t.is(
      detergent('aaaaaaa aaaaaaaaa aaaaaaaaaa&nbsp;bbbb'),
    'aaaaaaa aaaaaaaaa aaaaaaaaaa&nbsp;bbbb',
    '16.02 - named entities'
  )
  t.is(
      detergent('aaaaaaa aaaaaaaaa aaaaaaaaa\xa0bbbb'),
    'aaaaaaa aaaaaaaaa aaaaaaaaa&nbsp;bbbb',
    '16.03 - non-encoded entities'
  )
  t.end()
})

// ==============================
// 17. detecting partially-named entities
// ==============================

// taster
test('17.01 - potentially clashing incomplete named entities', function (t) {
  t.is(
    detergent('aaa&fnof;aaa'),
    'aaa&fnof;aaa',
    '17.01.01 precaution &fnof; (\\u0192)')
  t.is(
    detergent('aaa&thinsp;aaa'),
    'aaa&thinsp;aaa',
    '17.01.02 precaution &thinsp;')
  t.is(
    detergent('aaa&zwnjaaa'),
    'aaa&zwnj;aaa',
    '17.01.03 precaution &zwnj')
  t.is(
    detergent('aaa&pi&piv&pi&pivaaa'),
    he.decode('aaa&pi;&piv;&pi;&piv;aaa'),
    '17.01.04 precaution &pi/&piv')
  t.is(
    detergent('aaa&sub&sube&sub&subeaaa'),
    'aaa&sub;&sube;&sub;&sube;aaa',
    '17.01.05 precaution &sub;/&sube;')
  t.is(
    detergent('aaa&sup&sup1&sup&sup2&sup&sup3&sup&supeaaa'),
    'aaa&sup;&sup1;&sup;&sup2;&sup;&sup3;&sup;&supe;aaa',
    '43.6 precaution &sup;/&sup1/&sup2/&sup3;/&supe')
  t.is(
    detergent('aaa&theta&thetasym&theta&thetasymaaa'),
    he.decode('aaa&theta;&thetasym;&theta;&thetasym;aaa'),
    '17.01.07 precaution &theta;/&thetasym;')
  t.is(
    detergent('aaa&ang&angst&ang&angstaaa'),
    'aaa&ang;&#xC5;&ang;&#xC5;aaa',
    '17.01.08 precaution &ang;/&angst;')
  t.end()
})

  // check if Detergent doesn't mess with named entities
  // no mixer - Detergent on default settings
  // The character has to be surrounded by non-empty characters, otherwise
  // the trim might erase it.
test('17.02 - checking if entity references are left intact', function (t) {
  entityTest.forEach(function (elem, i) {
    t.is(
      detergent('aaa' + Object.keys(elem)[0] + 'bbb'),
      'aaa' + elem[Object.keys(elem)[0]] + 'bbb',
      '17.02.' + i + ' ' + elem
    )
  })
  t.end()
})

test('17.03 - precaution against false positives', function (t) {
  mixer({
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('Zzz times; Zzzz or; Zzzzzz real; Zzzz alpha; Zzzzz exist; Zzzzz euro;', elem),
      'Zzz times; Zzzz or; Zzzzzz real; Zzzz alpha; Zzzzz exist; Zzzzz euro;',
      '17.03.01 - false positives'
    )
  })
  mixer({
    convertEntities: true,
    removeWidows: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('Zzz times; Zzzz or; Zzzzzz real; Zzzz alpha; Zzzzz exist; Zzzzz euro;', elem),
      'Zzz times; Zzzz or; Zzzzzz real; Zzzz alpha; Zzzzz exist; Zzzzz&nbsp;euro;',
      '17.03.02 - false positives'
    )
  })
  mixer({
    convertEntities: false,
    removeWidows: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('Zzz times; Zzzz or; Zzzzzz real; Zzzz alpha; Zzzzz exist; Zzzzz euro;', elem),
      'Zzz times; Zzzz or; Zzzzzz real; Zzzz alpha; Zzzzz exist; Zzzzz\xa0euro;',
      '17.03.03 - false positives'
    )
  })
  t.end()
})

// ==============================
// 18. Clearly errors
// ==============================

test('18.01 - fixes: space + full stop combinations', function (t) {
  mixer({
    removeWidows: false,
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('\u000a Very long line, long-enough to trigger widow removal . \u000a\n Text . ', elem),
      'Very long line, long-enough to trigger widow removal.<br />\n<br />\nText.',
      '18.01.01 - space - full stop'
    )
  })
  mixer({
    removeWidows: true,
    convertEntities: true,
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('\u000a Very long line, long-enough to trigger widow removal . \u000a\n Text . ', elem),
      'Very long line, long-enough to trigger widow&nbsp;removal.<br />\n<br />\nText.',
      '18.01.02 - space - full stop'
    )
  })
  mixer({
    removeWidows: true,
    convertEntities: false,
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('\u000a Very long line, long-enough to trigger widow removal . \u000a\n Text . ', elem),
      'Very long line, long-enough to trigger widow\xa0removal.<br />\n<br />\nText.',
      '18.01.03 - space - full stop'
    )
  })
  mixer({
    removeWidows: false,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    useXHTML: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('\u000a Very long line, long-enough to trigger widow removal . \u000a\n Text . ', elem),
      'Very long line, long-enough to trigger widow removal.\n\nText.',
      '18.01.04 - space - full stop'
    )
  })
  mixer({
    removeWidows: true,
    convertEntities: true,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    useXHTML: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('\u000a Very long line, long-enough to trigger widow removal . \u000a\n Text . ', elem),
      'Very long line, long-enough to trigger widow&nbsp;removal.\n\nText.',
      '18.01.05 - space - full stop'
    )
  })
  mixer({
    removeWidows: true,
    convertEntities: false,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    useXHTML: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('\u000a Very long line, long-enough to trigger widow removal . \u000a\n Text . ', elem),
      'Very long line, long-enough to trigger widow\xa0removal.\n\nText.',
      '18.01.06 - space - full stop'
    )
  })
  mixer({
    removeWidows: false,
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('\u000a Very long line, long-enough to trigger widow removal . \u000a\n Text . ', elem),
      'Very long line, long-enough to trigger widow removal.<br>\n<br>\nText.',
      '18.01.07 - space - full stop'
    )
  })
  mixer({
    removeWidows: true,
    convertEntities: true,
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('\u000a Very long line, long-enough to trigger widow removal . \u000a\n Text . ', elem),
      'Very long line, long-enough to trigger widow&nbsp;removal.<br>\n<br>\nText.',
      '18.01.08 - space - full stop'
    )
  })
  mixer({
    removeWidows: true,
    convertEntities: false,
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('\u000a Very long line, long-enough to trigger widow removal . \u000a\n Text . ', elem),
      'Very long line, long-enough to trigger widow\xa0removal.<br>\n<br>\nText.',
      '18.01.09 - space - full stop'
    )
  })
  mixer({
    removeWidows: false,
    removeLineBreaks: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent(' \u000a    Very long line, long-enough to trigger widow removal   \n\n. \u000a\n Text text text text . ', elem),
      'Very long line, long-enough to trigger widow removal. Text text text text.',
      '18.01.10 - space - full stop'
    )
  })
  mixer({
    removeWidows: true,
    convertEntities: true,
    removeLineBreaks: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent(' \u000a    Very long line, long-enough to trigger widow removal .  \n \n \u000a\n Text text text text . ', elem),
      'Very long line, long-enough to trigger widow removal. Text text text&nbsp;text.',
      '18.01.11 - space - full stop'
    )
  })
  mixer({
    removeWidows: true,
    convertEntities: false,
    removeLineBreaks: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent(' \u000a   Very long line, long-enough to trigger widow removal .  \n \n  \u000a\n Text text text text . ', elem),
      'Very long line, long-enough to trigger widow removal. Text text text\xa0text.',
      '18.01.12 - space - full stop'
    )
  })
  t.end()
})

test('18.02 - fixes: full stop + space + line break combinations', function (t) {
  t.is(
      detergent('a. \na'),
    'a.<br />\na',
    '18.02.01 - full stop - space - line break'
  )
  t.is(
      detergent('a . \na'),
    'a.<br />\na',
    '18.02.02 - space - full stop - space - line break'
  )
  t.is(
      detergent('a , \na'),
    'a,<br />\na',
    '18.02.03 - space - comma - space - line break'
  )
  t.end()
})

// ==============================
// 19. multiple spaces before comma or full stop
// ==============================

test('19.01 - multiple spaces before comma/full stop - pt.1', function (t) {
  // mixer no.1 - no widows removal, with missing spaces
  mixer({
    removeWidows: false,
    addMissingSpaces: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    // comma
    t.is(
      detergent('some text text text text            ,text  ', elem),
      'some text text text text, text',
      '19.01.01 - multiple spaces, comma, no space, text, spaces'
    )
    t.is(
      detergent('some text text text text            ,text', elem),
      'some text text text text, text',
      '19.01.02 - multiple spaces, comma, no space, text, no spaces'
    )
    t.is(
      detergent('some text text text text            ,', elem),
      'some text text text text,',
      '19.01.03 - multiple spaces, comma, string\'s end'
    )
    t.is(
      detergent('lots of text to trigger widow removal 2,5 here', elem),
      'lots of text to trigger widow removal 2,5 here',
      '19.01.04 - alternative decimal notation'
    )
    // full stop
    t.is(
      detergent('Some text text text text            .Text  ', elem),
      'Some text text text text. Text',
      '19.01.05 - multiple spaces, comma, no space, text, spaces'
    )
    t.is(
      detergent('Some text text text text            .Text', elem),
      'Some text text text text. Text',
      '19.01.06 - multiple spaces, comma, no space, text, no spaces'
    )
    t.is(
      detergent('some text text text text            .', elem),
      'some text text text text.',
      '19.01.07 - multiple spaces, comma, string\'s end'
    )
    t.is(
      detergent('lots of text to trigger widow removal 2.5 here', elem),
      'lots of text to trigger widow removal 2.5 here',
      '19.01.08 - alternative decimal notation'
    )
  })
  t.end()
})

test('19.02 - multiple spaces before comma/full stop - pt.2', function (t) {
  // mixer no.2 - widows removal, with missing spaces
  mixer({
    removeWidows: true,
    convertEntities: true,
    addMissingSpaces: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    // comma
    t.is(
      detergent('some text text text text            ,text  ', elem),
      'some text text text text,&nbsp;text',
      '19.02.01 - multiple spaces, comma, no space, text, spaces'
    )
    t.is(
      detergent('some text text text text            ,text', elem),
      'some text text text text,&nbsp;text',
      '19.02.02 - multiple spaces, comma, no space, text, no spaces'
    )
    t.is(
      detergent('some text text text text            ,', elem),
      'some text text text&nbsp;text,',
      '19.02.03 - multiple spaces, comma, string\'s end'
    )
    t.is(
      detergent('lots of text to trigger widow removal 2,5 here', elem),
      'lots of text to trigger widow removal 2,5&nbsp;here',
      '19.02.04 - alternative decimal notation'
    )
    // full stop
    t.is(
      detergent('Some text text text text            .Text  ', elem),
      'Some text text text text.&nbsp;Text',
      '19.02.05 - multiple spaces, comma, no space, text, spaces'
    )
    t.is(
      detergent('Some text text text text            .Text', elem),
      'Some text text text text.&nbsp;Text',
      '19.02.06 - multiple spaces, comma, no space, text, no spaces'
    )
    t.is(
      detergent('Some text text text text            .', elem),
      'Some text text text&nbsp;text.',
      '19.02.07 - multiple spaces, comma, string\'s end'
    )
    t.is(
      detergent('lots of text to trigger widow removal 2.5 here', elem),
      'lots of text to trigger widow removal 2.5&nbsp;here',
      '19.02.08 - alternative decimal notation'
    )
  })
  t.end()
})

test('19.03 - multiple spaces before comma/full stop - pt.3', function (t) {
  // mixer no.3 - no widows removal, without missing spaces
  mixer({
    removeWidows: false,
    addMissingSpaces: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    // comma
    t.is(
      detergent('some text text text text            ,text  ', elem),
      'some text text text text,text',
      '19.03.01 - multiple spaces, comma, no space, text, spaces'
    )
    t.is(
      detergent('some text text text text            ,text', elem),
      'some text text text text,text',
      '19.03.02 - multiple spaces, comma, no space, text, no spaces'
    )
    t.is(
      detergent('some text text text text            ,', elem),
      'some text text text text,',
      '19.03.03 - multiple spaces, comma, string\'s end'
    )
    t.is(
      detergent('lots of text to trigger widow removal 2,5 here', elem),
      'lots of text to trigger widow removal 2,5 here',
      '19.03.04 - alternative decimal notation'
    )
    // full stop
    t.is(
      detergent('Some text text text text            .Text  ', elem),
      'Some text text text text.Text',
      '19.03.05 - multiple spaces, comma, no space, text, spaces'
    )
    t.is(
      detergent('Some text text text text            .Text', elem),
      'Some text text text text.Text',
      '19.03.06 - multiple spaces, comma, no space, text, no spaces'
    )
    t.is(
      detergent('some text text text text            .', elem),
      'some text text text text.',
      '19.03.07 - multiple spaces, comma, string\'s end'
    )
    t.is(
      detergent('lots of text to trigger widow removal 2.5 here', elem),
      'lots of text to trigger widow removal 2.5 here',
      '19.03.08 - alternative decimal notation'
    )
  })
  t.end()
})

test('19.04 - multiple spaces before comma/full stop - pt.4', function (t) {
  // mixer no.4 - widows removal, without missing spaces
  mixer({
    removeWidows: true,
    convertEntities: true,
    addMissingSpaces: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    // comma
    t.is(
      detergent('some text text text text            ,text  ', elem),
      'some text text text&nbsp;text,text',
      '19.04.01 - multiple spaces, comma, no space, text, spaces'
    )
    t.is(
      detergent('some text text text text            ,text', elem),
      'some text text text&nbsp;text,text',
      '19.04.02 - multiple spaces, comma, no space, text, no spaces'
    )
    t.is(
      detergent('some text text text text            ,', elem),
      'some text text text&nbsp;text,',
      '19.04.03 - multiple spaces, comma, string\'s end'
    )
    t.is(
      detergent('lots of text to trigger widow removal 2,5 here', elem),
      'lots of text to trigger widow removal 2,5&nbsp;here',
      '19.04.04 - alternative decimal notation'
    )
    // full stop
    t.is(
      detergent('Some text text text text            .Text  ', elem),
      'Some text text text&nbsp;text.Text',
      '19.04.05 - multiple spaces, comma, no space, text, spaces'
    )
    t.is(
      detergent('Some text text text text            .Text', elem),
      'Some text text text&nbsp;text.Text',
      '19.04.06 - multiple spaces, comma, no space, text, no spaces'
    )
    t.is(
      detergent('Some text text text text            .', elem),
      'Some text text text&nbsp;text.',
      '19.04.07 - multiple spaces, comma, string\'s end'
    )
    t.is(
      detergent('lots of text to trigger widow removal 2.5 here', elem),
      'lots of text to trigger widow removal 2.5&nbsp;here',
      '19.04.08 - alternative decimal notation'
    )
  })
  t.end()
})

// ==============================
// 20. m dash sanity check
// ==============================

test('20.01 - m dash sanity check', function (t) {
  mixer({
    convertEntities: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('m\u2014m', elem),
      'm\u2014m',
      '20.01.01 - leaves the m dashes alone'
    )
    t.is(
      detergent('m-m', elem),
      'm-m',
      '20.01.02 - leaves minuses alone'
    )
  })
  mixer({
    convertEntities: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('m\u2014m', elem),
      'm&mdash;m',
      '20.01.03 - leaves the m dashes alone'
    )
    t.is(
      detergent('m-m', elem),
      'm-m',
      '20.01.04 - leaves minuses alone'
    )
  })
  t.end()
})

test('20.02 - minus and number, too short to widow removal', function (t) {
  mixer({
    convertEntities: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('Temperatures of -20°C', elem),
      'Temperatures of -20°C',
      '20.02.01'
    )
    t.is(
      detergent('-20°C', elem),
      '-20°C',
      '20.02.01'
    )
  })
  mixer({
    convertEntities: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('Temperatures of -20°C', elem),
      'Temperatures of -20&deg;C',
      '20.02.02'
    )
    t.is(
      detergent('-20°C', elem),
      '-20&deg;C',
      '20.02.02'
    )
  })
  t.end()
})

test('20.03 - minus and number, clashing with widow removal', function (t) {
  mixer({
    convertEntities: true,
    removeWidows: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('The records show that there were temperatures as low as -20°C', elem),
      'The records show that there were temperatures as low as&nbsp;-20&deg;C',
      '20.03.01'
    )
  })
  mixer({
    convertEntities: true,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('The records show that there were temperatures as low as -20°C', elem),
      'The records show that there were temperatures as low as -20&deg;C',
      '20.03.02'
    )
  })
  mixer({
    convertEntities: false,
    removeWidows: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('The records show that there were temperatures as low as -20°C', elem),
      'The records show that there were temperatures as low as\xa0-20°C',
      '20.03.03'
    )
  })
  mixer({
    convertEntities: false,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('The records show that there were temperatures as low as -20°C', elem),
      'The records show that there were temperatures as low as -20°C',
      '20.03.04'
    )
  })
  t.end()
})

test('20.04 - dashes between words, no spaces', function (t) {
  allCombinations.forEach(function (elem) {
    t.is(
      detergent('Stratford-upon-Avon', elem),
      'Stratford-upon-Avon',
      '20.04.01'
    )
  })
  mixer({
    convertEntities: true,
    removeWidows: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('One day we should visit Stratford-upon-Avon', elem),
      'One day we should visit&nbsp;Stratford-upon-Avon',
      '20.04.02'
    )
  })
  mixer({
    convertEntities: true,
    removeWidows: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('One day we should visit Stratford-upon-Avon.', elem),
      'One day we should visit&nbsp;Stratford-upon-Avon.',
      '20.04.03'
    )
  })
  mixer({
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('One day we should visit Stratford-upon-Avon', elem),
      'One day we should visit Stratford-upon-Avon',
      '20.04.04'
    )
  })
  mixer({
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('One day we should visit Stratford-upon-Avon.', elem),
      'One day we should visit Stratford-upon-Avon.',
      '20.04.05'
    )
  })
  t.end()
})

// ==============================
// 21. (horizontal) ellipsis sanity check
// ==============================

test('21.01 - horizontal ellipsis sanity check', function (t) {
  mixer({
    convertEntities: false // o.convertDotsToEllipsis does not matter as there are no dots here
  })
  .forEach(function (elem) {
    t.is(
      detergent('\u2026', elem),
      '\u2026',
      '21.01.01 - leaves the ellipsis alone when it has to (unencoded)'
    )
    t.is(
      detergent('&hellip;', elem),
      '\u2026',
      '21.01.02 - leaves the ellipsis alone when it has to (hellip)'
    )
    t.is(
      detergent('&mldr;', elem),
      '\u2026',
      '21.01.03 - leaves the ellipsis alone when it has to (mldr)'
    )
  })
  mixer({
    convertEntities: true // o.convertDotsToEllipsis does not matter as there are no dots here
  })
  .forEach(function (elem) {
    t.is(
      detergent('\u2026', elem),
      '&hellip;',
      '21.01.04 - encodes the ellipsis when it has to (unencoded)'
    )
    t.is(
      detergent('&hellip;', elem),
      '&hellip;',
      '21.01.05 - encodes the ellipsis when it has to (hellip)'
    )
    t.is(
      detergent('&mldr;', elem),
      '&hellip;',
      '21.01.06 - encodes the ellipsis when it has to (mldr)'
    )
  })
  t.end()
})

// =======================================
// 22. three dots converted (or not) to an ellipsis symbol
// =======================================

test('22.01 - ellipsis', function (t) {
  mixer({
    convertEntities: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('...', elem),
      '\u2026',
      '22.01.01 - converts three full stops to unencoded ellipsis'
    )
  })
  mixer({
    convertEntities: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('...', elem),
      '&hellip;',
      '22.01.02 - converts three full stops to encoded ellipsis'
    )
  })
  mixer({
    convertDotsToEllipsis: false // `o.convertEntities` does not matter - dots must not be touched
  })
  .forEach(function (elem) {
    t.is(
      detergent('...', elem),
      '...',
      '22.01.03 - does not touch the dots when asked not to'
    )
    t.is(
      detergent('aaaaa...', elem),
      'aaaaa...',
      '22.01.04 - some letters as well'
    )
  })
  t.end()
})

// ============================================================================
// 23. some HTML entitities can't be sent in named entities format, only in numeric
// ============================================================================

test('23.01 - numeric entities', function (t) {
  mixer({
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('&Breve;&Backslash;&Cacute;&CircleDot;&DD;&Diamond;&DownArrow;&LT;&RightArrow;&SmallCircle;&Uarr;&Verbar;&angst;&zdot;', elem),
      '&#x2D8;&#x2216;&#x106;&#x2299;&#x2145;&#x22C4;&darr;&lt;&rarr;&#x2218;&#x219F;&#x2016;&#xC5;&#x17C;',
      '23.01 - HTML entities'
    )
  })
  t.end()
})

test('24    - wrong named entity QUOT into quot', function (t) {
  mixer({
    convertEntities: true,
    convertApostrophes: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('&QUOT;', elem),
      '&quot;',
      '24 - HTML entity - QUOT'
    )
  })
  t.end()
})

// ============================================================================
// 25. ndash
// ============================================================================

test('25.01 - missing space after ndash added (nbsp + ndash)', function (t) {
  mixer({
    convertEntities: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('10am&nbsp;&ndash;11am', elem),
      '10am&nbsp;&ndash; 11am',
      '25.01.01 - missing space after ndash added'
    )
    t.is(
      detergent('10am&ndash;11am', elem),
      '10am&ndash;11am',
      '25.01.02 - space after ndash not added where not needed'
    )
  })
  mixer({
    convertEntities: false,
    replaceLineBreaks: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('10am&nbsp;&ndash;11am', elem),
      '10am\xa0\u2013 11am',
      '25.01.03 - missing space after ndash added'
    )
    t.is(
      detergent('10am&ndash;11am', elem),
      '10am\u201311am',
      '25.01.04 - space after ndash not added where not needed'
    )
  })
  t.end()
})

test('25.02 - missing space after ndash added (space + ndash)', function (t) {
  mixer({
    convertEntities: true,
    removeWidows: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('10am &ndash;11am', elem),
      '10am&nbsp;&ndash; 11am',
      '25.02.01 - missing space after ndash added'
    )
  })
  mixer({
    convertEntities: true,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('10am &ndash;11am', elem),
      '10am &ndash; 11am',
      '25.02.02 - missing space after ndash added'
    )
  })
  t.end()
})

// ============================================================================
// 26. nnbsp, NBSP and nbs
// ============================================================================

// repetitions

test('26.01 - broken nbsp - repetitions - nnnbbbsssp', function (t) {
  mixer({
    convertEntities: true,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa &&&&nnnbbbspp;;;; aaa\naaa nnnbbbsssp aaaa\naaaa&nnnnbbbssssppp;aaa\naaannnbbbsssp;aaaa\naaa&nnnbbbssspaaaa\naaa&nnbsp;aaaa\naaannbsp;aaaa\naaa&nnbspaaaa\naaa &nnbsp; aaaa\naaa nnbsp; aaaa\naaa &nnbsp aaaa', elem),
      'aaa &nbsp; aaa\naaa &nbsp; aaaa\naaaa&nbsp;aaa\naaa&nbsp;aaaa\naaa&nbsp;aaaa\naaa&nbsp;aaaa\naaa&nbsp;aaaa\naaa&nbsp;aaaa\naaa &nbsp; aaaa\naaa &nbsp; aaaa\naaa &nbsp; aaaa',
      '26.01.01'
    )
  })
  mixer({
    convertEntities: false,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa &&&&nnnbbbspp;;;; aaa\naaa nnnbbbsssp aaaa\naaaa&nnnnbbbssssppp;aaa\naaannnbbbsssp;aaaa\naaa&nnnbbbssspaaaa\naaa&nnbsp;aaaa\naaannbsp;aaaa\naaa&nnbspaaaa\naaa &nnbsp; aaaa\naaa nnbsp; aaaa\naaa &nnbsp aaaa', elem),
      'aaa \xa0 aaa\naaa \xa0 aaaa\naaaa\xa0aaa\naaa\xa0aaaa\naaa\xa0aaaa\naaa\xa0aaaa\naaa\xa0aaaa\naaa\xa0aaaa\naaa \xa0 aaaa\naaa \xa0 aaaa\naaa \xa0 aaaa',
      '26.01.02'
    )
  })
  mixer({
    convertEntities: true,
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: true,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa &&&&nnnbbbspp;;;; aaa\naaa nnnbbbsssp aaaa\naaaa&nnnnbbbssssppp;aaa\naaannnbbbsssp;aaaa\naaa&nnnbbbssspaaaa\naaa&nnbsp;aaaa\naaannbsp;aaaa\naaa&nnbspaaaa\naaa &nnbsp; aaaa\naaa nnbsp; aaaa\naaa &nnbsp aaaa', elem),
      'aaa &nbsp; aaa<br />\naaa &nbsp; aaaa<br />\naaaa&nbsp;aaa<br />\naaa&nbsp;aaaa<br />\naaa&nbsp;aaaa<br />\naaa&nbsp;aaaa<br />\naaa&nbsp;aaaa<br />\naaa&nbsp;aaaa<br />\naaa &nbsp; aaaa<br />\naaa &nbsp; aaaa<br />\naaa &nbsp; aaaa',
      '26.01.03'
    )
  })
  mixer({
    convertEntities: true,
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: false,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa &&&&nnnbbbspp;;;; aaa\naaa nnnbbbsssp aaaa\naaaa&nnnnbbbssssppp;aaa\naaannnbbbsssp;aaaa\naaa&nnnbbbssspaaaa\naaa&nnbsp;aaaa\naaannbsp;aaaa\naaa&nnbspaaaa\naaa &nnbsp; aaaa\naaa nnbsp; aaaa\naaa &nnbsp aaaa', elem),
      'aaa &nbsp; aaa<br>\naaa &nbsp; aaaa<br>\naaaa&nbsp;aaa<br>\naaa&nbsp;aaaa<br>\naaa&nbsp;aaaa<br>\naaa&nbsp;aaaa<br>\naaa&nbsp;aaaa<br>\naaa&nbsp;aaaa<br>\naaa &nbsp; aaaa<br>\naaa &nbsp; aaaa<br>\naaa &nbsp; aaaa',
      '26.01.04'
    )
  })
  mixer({
    convertEntities: true,
    removeLineBreaks: true,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa &&&&nnnbbbspp;;;; aaa\naaa nnnbbbsssp aaaa\naaaa&nnnnbbbssssppp;aaa\naaannnbbbsssp;aaaa\naaa&nnnbbbssspaaaa\naaa&nnbsp;aaaa\naaannbsp;aaaa\naaa&nnbspaaaa\naaa &nnbsp; aaaa\naaa nnbsp; aaaa\naaa &nnbsp aaaa', elem),
      'aaa &nbsp; aaa aaa &nbsp; aaaa aaaa&nbsp;aaa aaa&nbsp;aaaa aaa&nbsp;aaaa aaa&nbsp;aaaa aaa&nbsp;aaaa aaa&nbsp;aaaa aaa &nbsp; aaaa aaa &nbsp; aaaa aaa &nbsp; aaaa',
      '26.01.05'
    )
  })
  mixer({
    convertEntities: false,
    removeLineBreaks: true,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa &&&&nnnbbbspp;;;; aaa\naaa nnnbbbsssp aaaa\naaaa&nnnnbbbssssppp;aaa\naaannnbbbsssp;aaaa\naaa&nnnbbbssspaaaa\naaa&nnbsp;aaaa\naaannbsp;aaaa\naaa&nnbspaaaa\naaa &nnbsp; aaaa\naaa nnbsp; aaaa\naaa &nnbsp aaaa', elem),
      'aaa \xa0 aaa aaa \xa0 aaaa aaaa\xa0aaa aaa\xa0aaaa aaa\xa0aaaa aaa\xa0aaaa aaa\xa0aaaa aaa\xa0aaaa aaa \xa0 aaaa aaa \xa0 aaaa aaa \xa0 aaaa',
      '26.01.06'
    )
  })
  t.end()
})

test('26.02 - nbSp with no semicol', function (t) {
  mixer({
    convertEntities: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a nbbSp a', elem),
      'a &nbsp; a',
      '26.02.01 - missing semicol/ampers and wrong capitalisation and repetitions'
    )
  })
  mixer({
    convertEntities: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a nbbSppp; a', elem),
      'a &nbsp; a',
      '26.02.02 - missing amp and wrong capitalisation and repetition on P'
    )
  })
  t.end()
})

// NBSP missing letters AMPERSAND OBLIGATORY, SEMICOL - NOT:

test('26.03 - broken nbsp - &nbsp (no semicol)', function (t) {
  mixer({
    convertEntities: true,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa&nbs;aaaa\naaa&nbsaaaa\naaa &nbs; aaaa\naaa &nbs aaaa\naaa &nbs\naaa &nbs', elem),
      'aaa&nbsp;aaaa\naaa&nbsp;aaaa\naaa &nbsp; aaaa\naaa &nbsp; aaaa\naaa &nbsp;\naaa &nbsp;',
      '26.03.01 - &nbsp missing p'
    )
  })
  mixer({
    convertEntities: true,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa&nbp;aaaa\naaa&nbpaaaa\naaa &nbp; aaaa\naaa &nbp aaaa\naaa &nbp\naaa &nbp', elem),
      'aaa&nbsp;aaaa\naaa&nbsp;aaaa\naaa &nbsp; aaaa\naaa &nbsp; aaaa\naaa &nbsp;\naaa &nbsp;',
      '26.03.02 - &nbsp missing s'
    )
  })
  mixer({
    convertEntities: true,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa&nsp;aaaa\naaa&nspaaaa\naaa &nsp; aaaa\naaa &nsp aaaa\naaa &nsp\naaa &nsp', elem),
      'aaa&nbsp;aaaa\naaa&nbsp;aaaa\naaa &nbsp; aaaa\naaa &nbsp; aaaa\naaa &nbsp;\naaa &nbsp;',
      '26.03.03 - &nbsp missing b'
    )
  })
  mixer({
    convertEntities: true,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa&bsp;aaaa\naaa&bspaaaa\naaa &bsp; aaaa\naaa &bsp aaaa\naaa &bsp\naaa &bsp', elem),
      'aaa&nbsp;aaaa\naaa&nbsp;aaaa\naaa &nbsp; aaaa\naaa &nbsp; aaaa\naaa &nbsp;\naaa &nbsp;',
      '26.03.04 - &nbsp missing n'
    )
  })
  t.end()
})

// NBSP missing letters SEMICOL OBLIGATORY, AMPERSAND - NOT:

test('26.04 - broken nbsp - nbsp; (no ampersand)', function (t) {
  mixer({
    convertEntities: true,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa&nbs;aaaa\naaanbs;aaaa\naaa &nbs; aaaa\naaa nbs; aaaa\nnbs; aaaa\nnbs; aaaa', elem),
      'aaa&nbsp;aaaa\naaa&nbsp;aaaa\naaa &nbsp; aaaa\naaa &nbsp; aaaa\n&nbsp; aaaa\n&nbsp; aaaa',
      '26.04.01 - missing p'
    )
  })
  mixer({
    convertEntities: true,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa&nbp;aaaa\naaanbp;aaaa\naaa &nbp; aaaa\naaa nbp; aaaa\nnbp; aaaa\nnbp; aaaa', elem),
      'aaa&nbsp;aaaa\naaa&nbsp;aaaa\naaa &nbsp; aaaa\naaa &nbsp; aaaa\n&nbsp; aaaa\n&nbsp; aaaa',
      '26.04.02 - missing s'
    )
  })
  mixer({
    convertEntities: true,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa&nsp;aaaa\naaansp;aaaa\naaa &nsp; aaaa\naaa nsp; aaaa\nnsp; aaaa\nnsp; aaaa', elem),
      'aaa&nbsp;aaaa\naaa&nbsp;aaaa\naaa &nbsp; aaaa\naaa &nbsp; aaaa\n&nbsp; aaaa\n&nbsp; aaaa',
      '26.04.03 - missing b'
    )
  })
  mixer({
    convertEntities: true,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa&bsp;aaaa\naaabsp;aaaa\naaa &bsp; aaaa\naaa bsp; aaaa\nbsp; aaaa\nbsp; aaaa', elem),
      'aaa&nbsp;aaaa\naaa&nbsp;aaaa\naaa &nbsp; aaaa\naaa &nbsp; aaaa\n&nbsp; aaaa\n&nbsp; aaaa',
      '26.04.04 - missing n'
    )
  })
  t.end()
})

// NBSP missing letters AMPERSAND OBLIGATORY, SEMICOL - NOT:
// [' ', '.', ',', ';', '\xa0', '?', '!']
test('26.05 - broken nbsp - ?!.,nbsp (no semicol)', function (t) {
  mixer({
    convertEntities: true,
    removeWidows: false,
    addMissingSpaces: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa nbspaaa.nbspaaa,nbspaaa;nbspaaa\xa0nbspaaa?nbspaaa!nbspaaa', elem),
      'aaa &nbsp;aaa.&nbsp;aaa, &nbsp;aaa;&nbsp;aaa&nbsp;&nbsp;aaa?&nbsp;aaa!&nbsp;aaa',
      '26.05.01 - nbsp missing semicol and amp'
    )
    t.is(
      detergent('prop nbspprop.nbspprop,nbspprop;nbspprop\xa0nbspprop?nbspprop!nbspprop', elem),
      'prop &nbsp;prop.&nbsp;prop, &nbsp;prop;&nbsp;prop&nbsp;&nbsp;prop?&nbsp;prop!&nbsp;prop',
      '26.05.02 - nbsp missing semicol and amp - sneaky p\'s'
    )
  })

  mixer({
    convertEntities: true,
    removeWidows: false,
    addMissingSpaces: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa nbspaaa.nbspaaa,nbspaaa;nbspaaa\xa0nbspaaa?nbspaaa!nbspaaa', elem),
      'aaa &nbsp;aaa.&nbsp;aaa,&nbsp;aaa;&nbsp;aaa&nbsp;&nbsp;aaa?&nbsp;aaa!&nbsp;aaa',
      '26.05.03 - nbsp missing semicol and amp'
    )
    t.is(
      detergent('prop nbspprop.nbspprop,nbspprop;nbspprop\xa0nbspprop?nbspprop!nbspprop', elem),
      'prop &nbsp;prop.&nbsp;prop,&nbsp;prop;&nbsp;prop&nbsp;&nbsp;prop?&nbsp;prop!&nbsp;prop',
      '26.05.04 - nbsp missing semicol and amp - sneaky p\'s'
    )
  })
  t.end()
})

// ==============================
// 27. COPING WITH MULTIPLE ENCODING
// ==============================

test('27.01 - recursive entity de-coding', function (t) {
  mixer({
    convertEntities: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('&amp;nbsp;', elem),
      '\xa0',
      '27.01.01 - double-encoded nbsp'
    )
    t.is(
      detergent('&amp;pound;', elem),
      '£',
      '27.01.02 - double-encoded pound'
    )
    t.is(
      detergent('&amp;amp;amp;amp;pound;', elem),
      '£',
      '27.01.03 - five times encoded pound'
    )
    t.is(
      detergent('&#x26;#xA9;', elem),
      '\u00A9',
      '27.01.04 - twice encoded using numeric entities'
    )
  })
  mixer({
    convertEntities: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('&amp;nbsp;', elem),
      '&nbsp;',
      '27.01.05 - double-encoded nbsp'
    )
    t.is(
      detergent('&amp;pound;', elem),
      '&pound;',
      '27.01.06 - double-encoded pound'
    )
    t.is(
      detergent('&amp;amp;amp;amp;pound;', elem),
      '&pound;',
      '27.01.07 - five times encoded pound'
    )
    t.is(
      detergent('&#x26;#xA9;', elem),
      '&copy;',
      '27.01.08 - twice encoded using numeric entities'
    )
  })
  t.end()
})

// =================================
// 28. Enforcing spaces after semicolons
// =================================

test('28.01 - spaces after semicolons', function (t) {
  mixer({
    addMissingSpaces: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa;aaa', elem),
      'aaa; aaa',
      '28.01.01 - semicol between letters'
    )
  })
  mixer({
    addMissingSpaces: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa;aaa', elem),
      'aaa;aaa',
      '28.01.02 - semicol between letters'
    )
  })

  mixer({
    addMissingSpaces: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa;aaa;', elem),
      'aaa; aaa;',
      '28.01.03 - semicol between letters, ends with semicol'
    )
  })
  mixer({
    addMissingSpaces: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa;aaa;', elem),
      'aaa;aaa;',
      '28.01.04 - semicol between letters, ends with semicol'
    )
  })

  mixer({
    convertEntities: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa&nbsp;aaa', elem),
      'aaa&nbsp;aaa',
      '28.01.05 - semicol fixes must not affect HTML entities'
    )
  })
  t.end()
})

// ==============================
// 29. DOESN'T MANGLE URLS
// ==============================

test('29.01 - doesn\'t add spaces within simple URL\'s', function (t) {
  // usual:
  allCombinations.forEach(function (elem) {
    t.is(
      detergent('http://detergent.io', elem),
      'http://detergent.io',
      '29.01.01 - url only'
    )
    t.is(
      detergent('http://detergent.io ', elem),
      'http://detergent.io',
      '29.01.02 - url + space only (checks trimming impact)'
    )
  })
  t.end()
})

test('29.02 - doesn\'t add spaces within urls', function (t) {
  mixer({
    removeWidows: false,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    addMissingSpaces: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('http://detergent.io is cool', elem),
      'http://detergent.io is cool',
      '29.02.01 - url + space + text'
    )
    t.is(
      detergent('http://detergent.io.\nThis is cool', elem),
      'http://detergent.io.\nThis is cool',
      '29.02.02 - adds space before capital letter (line break)'
    )
    t.is(
      detergent('http://detergent.io. \nThis is cool', elem),
      'http://detergent.io.\nThis is cool',
      '29.02.03 - adds space before capital letter (line break)'
    )
    t.is(
      detergent('Aaaaa.Aaaa www.detergent.io bbbbb.Bbbbb', elem),
      'Aaaaa. Aaaa www.detergent.io bbbbb. Bbbbb',
      '29.02.04 - no :// but www instead'
    )
  })
  mixer({
    removeWidows: false,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    addMissingSpaces: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('http://detergent.io is cool', elem),
      'http://detergent.io is cool',
      '29.02.05 - url + space + text'
    )
    t.is(
      detergent('http://detergent.io.\nThis is cool', elem),
      'http://detergent.io.\nThis is cool',
      '29.02.06 - address + full stop + line break'
    )
    t.is(
      detergent('http://detergent.io. \nThis is cool', elem),
      'http://detergent.io.\nThis is cool',
      '29.02.07 - address + full stop + space + line break'
    )
    t.is(
      detergent('Aaaaa.Aaaa www.detergent.io bbbbb.Bbbbb', elem),
      'Aaaaa.Aaaa www.detergent.io bbbbb.Bbbbb',
      '29.02.08 - no :// but www instead'
    )
  })
  t.end()
})

test('29.03 - adds space after semicolon, but not in URLs', function (t) {
  mixer({
    removeWidows: false,
    addMissingSpaces: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('This is http://detergent.io.This is cool.', elem),
      'This is http://detergent.io. This is cool.',
      '29.03.01'
    )
    t.is(
      detergent('This is http://detergent.io.', elem),
      'This is http://detergent.io.',
      '29.03.02'
    )
  })
  mixer({
    removeWidows: true,
    convertEntities: true,
    addMissingSpaces: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('This is http://detergent.io.This is cool.', elem),
      'This is http://detergent.io. This is&nbsp;cool.',
      '29.03.03'
    )
    t.is(
      detergent('This is http://detergent.io.', elem),
      'This is http://detergent.io.',
      '29.03.04'
    )
  })
  mixer({
    removeWidows: true,
    convertEntities: false,
    addMissingSpaces: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('This is http://detergent.io.This is cool.', elem),
      'This is http://detergent.io. This is\xa0cool.',
      '29.03.05'
    )
    t.is(
      detergent('This is http://detergent.io.', elem),
      'This is http://detergent.io.',
      '29.03.06'
    )
  })
  mixer({
    removeWidows: false,
    addMissingSpaces: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('This is http://detergent.io.This is cool.', elem),
      'This is http://detergent.io.This is cool.',
      '29.03.07'
    )
    t.is(
      detergent('This is http://detergent.io.', elem),
      'This is http://detergent.io.',
      '29.03.08'
    )
  })
  mixer({
    removeWidows: true,
    convertEntities: true,
    addMissingSpaces: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('This is http://detergent.io.This is cool.', elem),
      'This is http://detergent.io.This is&nbsp;cool.',
      '29.03.09'
    )
    t.is(
      detergent('This is http://detergent.io.', elem),
      'This is http://detergent.io.',
      '29.03.10'
    )
  })
  mixer({
    removeWidows: true,
    convertEntities: false,
    addMissingSpaces: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('This is http://detergent.io.This is cool.', elem),
      'This is http://detergent.io.This is\xa0cool.',
      '29.03.11'
    )
    t.is(
      detergent('This is http://detergent.io.', elem),
      'This is http://detergent.io.',
      '29.03.12'
    )
  })
  t.end()
})

test('29.04 - doesn\'t add spaces within urls, considering emoji and line breaks', function (t) {
  mixer({
    removeWidows: false,
    convertEntities: false,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    addMissingSpaces: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('Aaaa🦄.bbbbb http://detergent.whatever.a.bd.re.qwe.gf.asdew.v.df.g.er.re ZZZ.🦄YYY', elem),
      'Aaaa🦄.bbbbb http://detergent.whatever.a.bd.re.qwe.gf.asdew.v.df.g.er.re ZZZ.🦄YYY',
      '29.04.01'
    )
    t.is(
      detergent('Aaaa.Bbbbb http://detergent.whatever.a.bd.re.qwe.\ngf.Asdew.V.Df,g;er.Re ZZZ.🦄YYY sfhksdf fgkjhk jhfgkh.', elem),
      'Aaaa. Bbbbb http://detergent.whatever.a.bd.re.qwe.\ngf. Asdew. V. Df, g; er. Re ZZZ.🦄YYY sfhksdf fgkjhk jhfgkh.',
      '29.04.02'
    )
  })
  mixer({
    removeWidows: false,
    convertEntities: false,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    addMissingSpaces: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('Aaaa🦄.bbbbb http://detergent.whatever.a.bd.re.qwe.gf.asdew.v.df.g.er.re ZZZ.🦄YYY', elem),
      'Aaaa🦄.bbbbb http://detergent.whatever.a.bd.re.qwe.gf.asdew.v.df.g.er.re ZZZ.🦄YYY',
      '29.04.03'
    )
    t.is(
      detergent('Aaaa.Bbbbb http://detergent.whatever.a.bd.re.qwe.\ngf.Asdew.V.Df,g;er.Re ZZZ.🦄YYY sfhksdf fgkjhk jhfgkh.', elem),
      'Aaaa.Bbbbb http://detergent.whatever.a.bd.re.qwe.\ngf.Asdew.V.Df,g;er.Re ZZZ.🦄YYY sfhksdf fgkjhk jhfgkh.',
      '29.04.04'
    )
  })
  t.end()
})

test('29.05 - being on the safe side - not adding spaces around detected URLs', function (t) {
  mixer({
    addMissingSpaces: true,
    convertDotsToEllipsis: true,
    dontEncodeNonLatin: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('http://detergent.io;is cool.', elem),
      'http://detergent.io;is cool.',
      '29.05.01'
    )
    t.is(
      detergent('aaa;bbb', elem),
      'aaa; bbb',
      '29.05.02'
    )
    t.is(
      detergent('http://detergent.io,is cool.', elem),
      'http://detergent.io,is cool.',
      '29.05.03'
    )
    t.is(
      detergent('aaa,bbb', elem),
      'aaa, bbb',
      '29.05.04'
    )
    t.is(
      detergent('http://detergent.io.Cool!', elem),
      'http://detergent.io. Cool!',
      '29.05.05 - added space because first letter is uppercase, following-one is lowercase'
    )
    t.is(
      detergent('http://detergent.io.IS COOL.', elem),
      'http://detergent.io.IS COOL.',
      '29.05.06 - all caps will prevent space added'
    )
    t.is(
      detergent('http://detergent.io.is cool.', elem),
      'http://detergent.io.is cool.',
      '29.05.07 - small caps will prevent space added'
    )
    t.is(
      detergent('aaa.bbb', elem),
      'aaa.bbb',
      '29.05.08 - letter after full stop has to be uppercase'
    )
    t.is(
      detergent('Aaa.Bbb', elem),
      'Aaa. Bbb',
      '29.05.09 - letter after full stop has to be uppercase'
    )
  })
  t.end()
})

test('29.06 - non-Latin character after URL', function (t) {
  mixer({
    removeWidows: false,
    dontEncodeNonLatin: true,
    addMissingSpaces: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('This is http://detergent.io.Это хорошо.', elem),
      'This is http://detergent.io. Это хорошо.',
      '29.06.01'
    )
    t.is(
      detergent('This is http://detergent.io,Это хорошо.', elem),
      'This is http://detergent.io,Это хорошо.',
      '29.06.02'
    )
    t.is(
      detergent('This is http://detergent.io;Это хорошо.', elem),
      'This is http://detergent.io;Это хорошо.',
      '29.06.03'
    )
  })

  // not adding the missing spaces

  mixer({
    removeWidows: false,
    dontEncodeNonLatin: true,
    addMissingSpaces: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('This is http://detergent.io.Это хорошо.', elem),
      'This is http://detergent.io.Это хорошо.',
      '29.06.01'
    )
    t.is(
      detergent('This is http://detergent.io,Это хорошо.', elem),
      'This is http://detergent.io,Это хорошо.',
      '29.06.02'
    )
    t.is(
      detergent('This is http://detergent.io;Это хорошо.', elem),
      'This is http://detergent.io;Это хорошо.',
      '29.06.03'
    )
  })
  t.end()
})

test('29.07 - sanity checks', function (t) {
  mixer({
    convertEntities: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('Semicolon;\xa0is cool.', elem),
      'Semicolon;\xa0is cool.',
      '29.07.01'
    )
    t.is(
      detergent('Semicolon;&is cool.', elem),
      'Semicolon;&is cool.',
      '29.07.02'
    )
  })
  allCombinations.forEach(function (elem) {
    t.is(
      detergent('${responseObject.storeName}', elem),
      '${responseObject.storeName}',
      '29.07.03'
    )
  })
  t.end()
})

test('29.08 - leaves file names intact', function (t) {
  allCombinations.forEach(function (elem) {
    t.is(
      detergent('image.jpg', elem),
      'image.jpg',
      '29.08.01'
    )
    t.is(
      detergent('image.JPG', elem),
      'image.JPG',
      '29.08.02'
    )
    t.is(
      detergent('image.jpeg', elem),
      'image.jpeg',
      '29.08.03'
    )
    t.is(
      detergent('image.JPEG', elem),
      'image.JPEG',
      '29.08.04'
    )
    t.is(
      detergent('image.png', elem),
      'image.png',
      '29.08.05'
    )
    t.is(
      detergent('image.PNG', elem),
      'image.PNG',
      '29.08.06'
    )
    t.is(
      detergent('image.gif', elem),
      'image.gif',
      '29.08.07'
    )
    t.is(
      detergent('image.GIF', elem),
      'image.GIF',
      '29.08.08'
    )
    t.is(
      detergent('image.svg', elem),
      'image.svg',
      '29.08.09'
    )
    t.is(
      detergent('image.SVG', elem),
      'image.SVG',
      '29.08.10'
    )
    t.is(
      detergent('image.json', elem),
      'image.json',
      '29.08.11'
    )
    t.is(
      detergent('image.JSON', elem),
      'image.JSON',
      '29.08.12'
    )
    t.is(
      detergent('image.html', elem),
      'image.html',
      '29.08.13'
    )
    t.is(
      detergent('image.HTML', elem),
      'image.HTML',
      '29.08.14'
    )
    t.is(
      detergent('image.htm', elem),
      'image.htm',
      '29.08.15'
    )
    t.is(
      detergent('image.HTM', elem),
      'image.HTM',
      '29.08.16'
    )
  })
  t.end()
})

test('29.09 - long sentences with file names with extensions', function (t) {
  t.is(
    detergent('Some text .gitignore'),
    'Some text .gitignore',
    '29.09.01'
  )
  mixer({
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('When you will download header.PNG, file fix.jpg and the dotfiles named .gitignore, check them.', elem),
      'When you will download header.PNG, file fix.jpg and the dotfiles named .gitignore, check them.',
      '29.09.02'
    )
  })
  t.end()
})

// ==============================
// 30. BOM
// ==============================

test('30.01 - strips UTF8 BOM', function (t) {
  allCombinations.forEach(function (elem) {
    t.is(
      detergent('\uFEFFunicorn', elem),
      'unicorn',
      '30.01.01 - UTF8 BOM at the beginning of a string')
    t.is(
      detergent('unicorn\uFEFF', elem),
      'unicorn',
      '30.01.02 - UTF8 BOM at the end of a string')
    t.is(
      detergent('unicorn\uFEFFzzz', elem),
      'unicornzzz',
      '30.01.03 - UTF8 BOM in the middle of a string')
  })
  t.end()
})

// ==============================
// 31. o.addMissingSpaces
// ==============================

test('31.01 - missing spaces addition can be turned off - full stop', function (t) {
  mixer({
    addMissingSpaces: true,
    dontEncodeNonLatin: true,
    useXHTML: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('Text.More text.', elem),
      'Text. More text.',
      '31.01.01'
    )
  })
  mixer({
    addMissingSpaces: false,
    dontEncodeNonLatin: true,
    useXHTML: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('Text.More text.', elem),
      'Text.More text.',
      '31.01.02'
    )
  })
  t.end()
})

test('31.02 - missing spaces addition can be turned off - comma', function (t) {
  mixer({
    addMissingSpaces: true,
    dontEncodeNonLatin: true,
    useXHTML: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('Text,more text.', elem),
      'Text, more text.',
      '31.02.01'
    )
    t.is(
      detergent('Text,more text,', elem),
      'Text, more text,',
      '31.02.02'
    )
  })
  mixer({
    addMissingSpaces: false,
    dontEncodeNonLatin: true,
    useXHTML: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('Text,more text.', elem),
      'Text,more text.',
      '31.02.03'
    )
    t.is(
      detergent('Text,more text,', elem),
      'Text,more text,',
      '31.02.04'
    )
  })
  t.end()
})

test('31.03 - missing spaces addition can be turned off - semicol', function (t) {
  mixer({
    addMissingSpaces: true,
    dontEncodeNonLatin: true,
    useXHTML: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('Text;more text.', elem),
      'Text; more text.',
      '31.03.01'
    )
    t.is(
      detergent('text;more text.', elem),
      'text; more text.',
      '31.03.02'
    )
    t.is(
      detergent('Text;more text', elem),
      'Text; more text',
      '31.03.03'
    )
    t.is(
      detergent('text;more text', elem),
      'text; more text',
      '31.03.04'
    )
  })
  mixer({
    addMissingSpaces: false,
    dontEncodeNonLatin: true,
    useXHTML: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('Text;more text.', elem),
      'Text;more text.',
      '31.03.05'
    )
    t.is(
      detergent('text;more text.', elem),
      'text;more text.',
      '31.03.06'
    )
    t.is(
      detergent('Text;more text', elem),
      'Text;more text',
      '31.03.07'
    )
    t.is(
      detergent('text;more text', elem),
      'text;more text',
      '31.03.08'
    )
  })
  t.end()
})

// ==============================
// 32. UL/LI TAGS
// ==============================

test('32.01 - adds missing spaces after stripping UL & LI tags', function (t) {
  mixer({
    removeLineBreaks: true,
    removeWidows: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('Text <ul><li>First point</li><li>Second point</li><li>Third point</li></ul>Text straight after', elem),
      'Text First point Second point Third point Text straight after',
      '32.01.01'
    )
  })
  mixer({
    removeLineBreaks: false,
    removeWidows: false,
    replaceLineBreaks: false,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('Text <ul><li>First point</li><li>Second point</li><li>Third point</li></ul>Text straight after', elem),
      'Text\nFirst point\nSecond point\nThird point\nText straight after',
      '32.01.02'
    )
  })
  mixer({
    removeLineBreaks: false,
    removeWidows: false,
    replaceLineBreaks: true,
    useXHTML: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('Text <ul><li>First point</li><li>Second point</li><li>Third point</li></ul>Text straight after', elem),
      'Text<br />\nFirst point<br />\nSecond point<br />\nThird point<br />\nText straight after',
      '32.01.03'
    )
  })
  t.end()
})

// ==============================
// 33. Stripping script tags with their contents
// ==============================

test('33.01 - strips <script> tags with contents between opening and closing tag', function (t) {
  mixer({
    removeLineBreaks: false,
    removeWidows: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a<script>var i = 0;</script>b', elem),
      'ab',
      '33.01.01 - tightly surrounded by letters'
    )
    t.is(
      detergent('<script>var i = 0;</script>b', elem),
      'b',
      '33.01.02'
    )
    t.is(
      detergent('a<script>var i = 0;</script>', elem),
      'a',
      '33.01.03'
    )
    t.is(
      detergent('<script>var i = 0;</script>', elem),
      '',
      '33.01.04 - total wipeout'
    )
  })
  t.end()
})

test('33.02 - strips <script> tags with whitespace within closing tags', function (t) {
  mixer({
    removeLineBreaks: false,
    removeWidows: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a<script>var i = 0;</script        >b', elem),
      'ab',
      '33.02'
    )
  })
  t.end()
})

test('33.03 - sneaky case', function (t) {
  mixer({
    removeLineBreaks: false,
    removeWidows: true,
    convertDotsToEllipsis: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a<script>var i = 0;</script        ', elem),
      'a',
      '33.03.01'
    )
    t.is(
      detergent('a<script>var i = 0;</script', elem),
      'a',
      '33.03.02'
    )
  })
  t.end()
})

// ==============================
// 99. UTIL
// ==============================

test('99.01 - UTIL - isLowercaseLetter() - detects the case of the given character', function (t) {
  t.is(
    isLowercaseLetter('a'),
    true,
    '99.01.01'
  )
  t.is(
    isLowercaseLetter('A'),
    false,
    '99.01.02'
  )
  t.is(
    isLowercaseLetter('1'),
    false,
    '99.01.03'
  )
  t.is(
    isLowercaseLetter('Д'),
    false,
    '99.01.04'
  )
  t.is(
    isLowercaseLetter('ж'),
    true,
    '99.01.05'
  )
  t.end()
})

test('99.02 - UTIL - isUppercaseLetter() - detects the case of the given character', function (t) {
  t.is(
    isUppercaseLetter('a'),
    false,
    '99.02.01'
  )
  t.is(
    isUppercaseLetter('A'),
    true,
    '99.02.02'
  )
  t.is(
    isUppercaseLetter('1'),
    false,
    '99.02.03'
  )
  t.is(
    isUppercaseLetter('Д'),
    true,
    '99.02.04'
  )
  t.is(
    isUppercaseLetter('ж'),
    false,
    '99.02.05'
  )
  t.end()
})

test('99.03 - detects is the character a letter', function (t) {
  t.is(
    isLetter('a'),
    true,
    '99.03.01'
  )
  t.is(
    isLetter('A'),
    true,
    '99.03.02'
  )
  t.is(
    isLetter(' '),
    false,
    '99.03.03'
  )
  t.is(
    isLetter(''),
    false,
    '99.03.04'
  )
  t.is(
    isLetter(1),
    false,
    '99.03.05'
  )
  t.end()
})
