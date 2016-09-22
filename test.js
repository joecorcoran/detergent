'use strict'

var he = require('he')
var detergent = require('./detergent.js')
var mixer = require('object-boolean-combinations')
var entityTest = require('./entity-test.json')

import test from 'ava'

// ==============================
// A REFERENCE TEST OBJECT TO GET THE OBJECT KEYS
// ==============================

var sampleObj = {
  removeWidows: true,
  convertEntities: true,
  convertDashes: true,
  replaceLineBreaks: true,
  removeLineBreaks: false,
  useXHTML: true,
  convertApostrophes: true,
  removeSoftHyphens: true,
  dontEncodeNonLatin: true,
  keepBoldEtc: true
}

// ==============================
// INVISIBLES
// ==============================

// var all settings combinations with removeWidows=true/false overrides
var allCombinations = mixer(sampleObj)
// console.log('\n\n all combinations'+allCombinations+'\n\n')

test('01 - invisibles', t => {
  t.is(detergent('\u0000\u0001\u0002\u0004\u0005\u0006\u0007\u0008\u000E\u000F\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017\u0018\u0019\u001A\u001B\u001C\u001D\u001E\u001F\u007F\u0080\u0081\u0082\u0083\u0084\u0086\u0087\u0088\u0089\u008A\u008B\u008C\u008D\u008E\u008F\u0090\u0091\u0092\u0093\u0094\u0095\u0096\u0097\u0098\u0099\u009A\u009B\u009C\u009D\u009E\u009F'), '', '01 - invisibles being removed')
})

test('02 - hairspace to space', function (t) {
  mixer(sampleObj, {
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('a&hairsp;a&VeryThinSpace;a&#x0200A;a&#8202;a\u200Aa', elem),
      'a a a a a a',
      '02.1 - hairspace changed to space'
    )
    t.is(
      detergent('a    &hairsp;  a  &VeryThinSpace;   a &#x0200A;     a              &#8202; a \u200A a    ', elem),
      'a a a a a a',
      '02.2 - hairspace changed to space (lots of spaces)'
    )
  })
  mixer(sampleObj, {
    removeWidows: true,
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a&hairsp;a&VeryThinSpace;a&#x0200A;a&#8202;a\u200Aa', elem),
      'a a a a a&nbsp;a',
      '02.3 - hairspace changed to space: +widows+entities'
    )
  })
})

test('03 - invisible breaks', function (t) {
  mixer(sampleObj, {
    replaceLineBreaks: false,
    removeLineBreaks: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('a\u000Ab\u000Bc\u000C\u000D\u2028\u2029\u0003d', elem),
      'a\nb\nc\n\n\n\n\nd',
      '03.1 - unencoded invisible breaks into \\n\'s'
    )
    t.is(
      detergent('a&#10;b&#11;c&#12;&#13;&#8232;&#8233;&#3;d', elem),
      'a\nb\nc\n\n\n\n\nd',
      '03.2 - encoded invisible breaks into \\n\'s'
    )
  })
  mixer(sampleObj, {
    removeLineBreaks: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a\u000Bb\u000C\u000D\u0085c\u2028\u2029d', elem),
      'abcd',
      '03.3 - invisible breaks and remove all line breaks on'
    )
  })
  mixer(sampleObj, {
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a\u000Ab\u000Bc\u000C\u000D\u0085\u2028\u2029d', elem),
      'a<br />\nb<br />\nc<br />\n<br />\n<br />\n<br />\n<br />\nd',
      '03.4 - replace breaks into XHTML BR\'s'
    )
  })
  mixer(sampleObj, {
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('a\u000Ab\u000Bc\u000C\u000D\u0085\u2028\u2029d', elem),
      'a<br>\nb<br>\nc<br>\n<br>\n<br>\n<br>\n<br>\nd',
      '03.5 - replace breaks into HTML BR\'s'
    )
  })
})

// ==============================
// o.removeSoftHyphens
// ==============================

test('04 - soft hyphens', function (t) {
  mixer(sampleObj, {
    removeSoftHyphens: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\u00ADbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', elem),
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      '04.1 - remove soft hyphens'
    )
  })
  mixer(sampleObj, {
    convertEntities: false,
    removeSoftHyphens: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\u00ADbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', elem),
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\u00ADbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      '04.2 - don\'t remove soft hyphens, but don\'t encode either'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    removeSoftHyphens: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\u00ADbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', elem),
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&shy;bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      '04.3 - don\'t remove soft hyphens, encode into &shy'
    )
  })
})

// ==============================
// strip the HTML
// ==============================

test('05 - strip HTML', function (t) {
  mixer(sampleObj, {
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('text <a>text</a> text', elem),
      'text text text',
      '05.1 - strip the HTML'
    )
    t.is(
      detergent('text <a>text<a> text', elem),
      'text text text',
      '05.2 - strip the HTML'
    )
    t.is(
      detergent('text <error>text<error> text', elem),
      'text text text',
      '05.3 - strip the HTML'
    )
    t.is(
      detergent('text <sldkfj asdasd="lekjrtt" lgkdjfld="lndllkjfg">text<hgjkd> text', elem),
      'text text text',
      '05.4 - strip the HTML'
    )
    t.is(
      detergent('text <a href="#" style="display: block;">text</a> text', elem),
      'text text text',
      '05.5 - strip the HTML'
    )
  })
})

// ==============================
// o.convertEntities
// ==============================

test('06 - convert to entities - pound', function (t) {
  mixer(sampleObj, {
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('\u00A3', elem),
      '&pound;',
      '06.1 - pound char converted into entity: +entities'
    )
  })
  mixer(sampleObj, {
    convertEntities: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('\u00A3', elem),
      '\u00A3',
      '06.2 - pound char not converted into entity: -entities'
    )
  })
})

test('07 - convert to entities - m-dash', function (t) {
  mixer(sampleObj, {
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('\u2014', elem),
      '&mdash;',
      '07.1 - M dash char encoded into entity: +entities'
    )
  })
  mixer(sampleObj, {
    convertEntities: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('\u2014', elem),
      '\u2014',
      '07.2 - M dash char not converted into entity: -entities'
    )
  })
})

test('08 - hairspaces', function (t) {
  mixer(sampleObj, {
    convertEntities: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('a\u200A&mdash;\u200Aa', elem),
      'a \u2014 a',
      '08.1 - hairspaces'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('HOORAY  \u2014  IT’S HERE \u200A', elem),
      'HOORAY &mdash; IT&rsquo;S HERE',
      '08.2 - hairspaces'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    removeWidows: false,
    convertDashes: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('HOORAY  -  IT’S HERE \u200A', elem),
      'HOORAY &mdash; IT&rsquo;S HERE',
      '08.3 - hairspaces'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    removeWidows: false,
    convertDashes: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('HOORAY  -  IT’S HERE \u200A', elem),
      'HOORAY - IT&rsquo;S HERE',
      '08.4 - hairspaces'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    removeWidows: true,
    convertDashes: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('HOORAY  -  IT’S HERE \u200A', elem),
      'HOORAY - IT&rsquo;S&nbsp;HERE',
      '08.5 - hairspaces'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    removeWidows: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('HOORAY  —  IT’S HERE \u200A', elem),
      'HOORAY&nbsp;&mdash; IT&rsquo;S&nbsp;HERE',
      '08.6 - hairspaces'
    )
  })
})

// convertDashes: true

// more dashes tests:
test('09 - dash tests', function (t) {
  mixer(sampleObj, {
    convertDashes: true,
    convertEntities: true,
    removeWidows: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaaaaaaaaaa - aaaaaaaaaaaa', elem),
      'aaaaaaaaaaa&nbsp;&mdash; aaaaaaaaaaaa',
      '09.1 - nbsp, dash'
    )
  })
  mixer(sampleObj, {
    convertDashes: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaaaaaaaaaa - aaaaaaaaaaaa', elem),
      'aaaaaaaaaaa - aaaaaaaaaaaa',
      '09.2 - no nbsp, dash'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    removeWidows: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaaaaaaaaaa \u2014 aaaaaaaaaaaa', elem),
      'aaaaaaaaaaa&nbsp;&mdash; aaaaaaaaaaaa',
      '09.3 - nbsp, dash'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    removeWidows: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaaaaaaaaaa &mdash; aaaaaaaaaaaa', elem),
      'aaaaaaaaaaa&nbsp;&mdash; aaaaaaaaaaaa',
      '09.4 - nbsp, dash'
    )
  }) // --- PART II ---
  mixer(sampleObj, {
    convertEntities: true,
    removeWidows: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a \u2014a', elem),
      'a&nbsp;&mdash; a',
      '09.5 - missing space after m-dash'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('a \u2014a', elem),
      'a &mdash; a',
      '09.6 - missing space after m-dash'
    )
  })
  mixer(sampleObj, {
    convertEntities: false,
    removeWidows: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a \u2014a', elem),
      'a\xa0\u2014 a',
      '09.7 - missing space after m-dash'
    )
  })
  mixer(sampleObj, {
    convertEntities: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('a \u2014a', elem),
      'a \u2014 a',
      '09.8 - missing space after m-dash'
    )
  })// --- PART III - hairlines mixed in ---
  mixer(sampleObj, {
    convertEntities: true,
    removeWidows: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a\u200A\u2014a', elem),
      'a&nbsp;&mdash; a',
      '09.9 - hairline mdash'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('a\u200A\u2014a', elem),
      'a &mdash; a',
      '09.10 - hairline mdash'
    )
  })
  mixer(sampleObj, {
    convertEntities: false,
    removeWidows: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a\u200A\u2014a', elem),
      'a\xa0\u2014 a',
      '09.11 - hairline mdash'
    )
  })
  mixer(sampleObj, {
    convertEntities: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('a\u200A\u2014a', elem),
      'a \u2014 a',
      '09.12 - hairline mdash'
    )
  })
})

// more hairspaces protection:
test('10 - hairspace protection', function (t) {
  mixer(sampleObj, {
    convertEntities: true,
    removeWidows: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a\u200Aa a a a a a a a a \u2014 a a a a ', elem),
      'a a a a a a a a a a&nbsp;&mdash; a a a&nbsp;a',
      '10.1'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('a a a a a a\u200Aa a a a \u2014 a a a a ', elem),
      'a a a a a a a a a a &mdash; a a a a',
      '10.2'
    )
  })
  mixer(sampleObj, {
    convertEntities: false,
    removeWidows: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a a a a a a a a a a \u2014 a a a a \u200A', elem),
      'a a a a a a a a a a\xa0\u2014 a a a\xa0a',
      '10.3'
    )
  })
  mixer(sampleObj, {
    convertEntities: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('a a a a a a a a a a \u2014 a a a a \u200A', elem),
      'a a a a a a a a a a \u2014 a a a a',
      '10.4'
    )
  })
})

test('11 - astral chars conversion', function (t) {
  mixer(sampleObj, {
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('\uD834\uDF06', elem),
      '&#x1D306;',
      '11.1 - trigram char converted into entity'
    )
  })
  mixer(sampleObj, {
    convertEntities: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('\uD834\uDF06', elem),
      '\uD834\uDF06',
      '11.2 - trigram char not converted into entity'
    )
  })
})

test('12 - paired surrogate encoding', function (t) {
  mixer(sampleObj, {
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('\uD83D\uDE0A', elem),
      '&#x1F60A;',
      '12.1 - paired surrogate is kept and encoded'
    )
  })
  mixer(sampleObj, {
    convertEntities: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('\uD83D\uDE0A', elem),
      '\uD83D\uDE0A',
      '12.2 - paired surrogate is kept and not encoded'
    )
  })
})

test('13 - stray low surrogates removed', function (t) {
  allCombinations.forEach(function (elem) {
    t.is(
      detergent('\uFFFDa\uD800a\uD83Da\uDBFF', elem),
      'aaa',
      '13.1 - stray low surrogates are deleted')
  })
  allCombinations.forEach(function (elem) {
    t.is(
      detergent('\uDC00a\uDE0Aa\uDFFF', elem),
      'aa',
      '13.2 - stray high surrogates are deleted')
  })
})

test('14 - German characters', function (t) {
  mixer(sampleObj, {
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('gr\u00F6\u00DFer', elem),
      'gr&ouml;&szlig;er',
      '14.1 - gr\u00F6\u00DFer encoded'
    )
  })
  mixer(sampleObj, {
    convertEntities: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('gr\u00F6\u00DFer', elem),
      'gr\u00F6\u00DFer',
      '14.2 - gr\u00F6\u00DFer not encoded'
    )
  })
})

// ==============================
// o.removeWidows
// ==============================

test('15 - widows', function (t) {
  mixer(sampleObj, {
    removeWidows: true,
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa bbb ccc ddd', elem),
      'aaa bbb ccc&nbsp;ddd',
      '15.1 - remove widows - entities, one line string no full stop'
    )
    t.is(
      detergent('aaa bbb ccc ddd.', elem),
      'aaa bbb ccc&nbsp;ddd.',
      '15.2 - remove widows - entities, one line string with full stop'
    )
  })
})

test('16 - more widows', function (t) {
  mixer(sampleObj, {
    removeWidows: true,
    convertEntities: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa bbb ccc ddd', elem),
      'aaa bbb ccc\xa0ddd',
      '16.1 - remove widows - no entities, one line string no full stop'
    )
    t.is(
      detergent('aaa bbb ccc ddd.', elem),
      'aaa bbb ccc\xa0ddd.',
      '16.2 - remove widows - no entities, one line string with full stop'
    )
  })
})

test('17 - even more widows', function (t) {
  mixer(sampleObj, {
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa bbb ccc ddd', elem),
      'aaa bbb ccc ddd',
      '17.1 - don\'t remove widows - no full stop'
    )
    t.is(
      detergent('aaa bbb ccc ddd.', elem),
      'aaa bbb ccc ddd.',
      '17.2 - don\'t remove widows - ending with full stop'
    )
  })
})

test('18 - even more widows and a little bit more', function (t) {
  mixer(sampleObj, {
    removeWidows: true,
    convertEntities: true,
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa bbb ccc ddd\n\neee fff ggg hhh', elem),
      'aaa bbb ccc&nbsp;ddd<br />\n<br />\neee fff ggg&nbsp;hhh',
      '18 - remove widows - two line breaks with encoding BR in XHTML'
    )
  })
})

test('19 - furthermore widows', function (t) {
  mixer(sampleObj, {
    removeWidows: true,
    convertEntities: true,
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa bbb ccc ddd\n\neee fff ggg hhh', elem),
      'aaa bbb ccc&nbsp;ddd<br>\n<br>\neee fff ggg&nbsp;hhh',
      '19 - two BR\'s, widows with NBSP and HTML BR'
    )
  })
})

test('20 - and some more widows', function (t) {
  mixer(sampleObj, {
    removeWidows: true,
    convertEntities: true,
    replaceLineBreaks: false,
    removeLineBreaks: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa bbb ccc ddd\n\neee fff ggg hhh', elem),
      'aaa bbb ccc&nbsp;ddd\n\neee fff ggg&nbsp;hhh',
      '20 - two BR\'s, widows replaced with &nbsp'
    )
  })
})

test('21 - double widows', function (t) {
  mixer(sampleObj, {
    removeWidows: true,
    convertEntities: false,
    replaceLineBreaks: false,
    removeLineBreaks: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa bbb ccc ddd\n\neee fff ggg hhh', elem),
      'aaa bbb ccc\u00A0ddd\n\neee fff ggg\u00A0hhh',
      '21 - two BR\'s, widows replaced with non-encoded NBSP'
    )
  })
})

test('22 - widows with line breaks', function (t) {
  mixer(sampleObj, {
    removeWidows: true,
    convertEntities: true,
    replaceLineBreaks: false,
    removeLineBreaks: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa bbb ccc ddd\neee fff ggg hhh.', elem),
      'aaa bbb ccc ddd\neee fff ggg&nbsp;hhh.',
      '22.1 - one line break, no full stop - no widow fix needed'
    )
    t.is(
      detergent('aaa bbb ccc ddd.\neee fff ggg hhh.', elem),
      'aaa bbb ccc&nbsp;ddd.\neee fff ggg&nbsp;hhh.',
      '22.2 - one line break, with full stop - widow fix needed'
    )
  })
})

test('23 - widows with trailing space', function (t) {
  mixer(sampleObj, {
    removeWidows: true,
    convertEntities: true,
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa bbb ccc ddd. \n\neee fff ggg hhh', elem),
      'aaa bbb ccc&nbsp;ddd.<br>\n<br>\neee fff ggg&nbsp;hhh',
      '23 - remove widows - trailing space'
    )
  })
})

// ==============================
// testing defaults
// ==============================

test('24 - testing defaults', function (t) {
  t.is(
      detergent('aaa\n\nbbb\n\nccc'),
    'aaa<br />\n<br />\nbbb<br />\n<br />\nccc',
    '24.1 - default set - \\n replacement with BR')
  t.is(
      detergent('aaa<br>bbb<br>ccc'),
    'aaa<br />\nbbb<br />\nccc',
    '24.2 - default set - HTML BR replacement with XHTML BR')
  t.is(
      detergent('aaa<BR />< BR>bbb< BR ><BR>ccc< br >< Br>ddd'),
    'aaa<br />\n<br />\nbbb<br />\n<br />\nccc<br />\n<br />\nddd',
    '24.3 - default set - dirty BRs')
})

// ==============================
// testing rubbish removal
// ==============================

test('25 - rubbish removal', function (t) {
  allCombinations.forEach(function (elem) {
    t.is(
      detergent('\n\n \t     aaaaaa   \n\t\t  ', elem),
      'aaaaaa')
  })
}, '25 - front & back spaces stripped')

test('26 - excessive whitespace', function (t) {
  allCombinations.forEach(function (elem) {
    t.is(detergent('aaaaaa     bbbbbb', elem), 'aaaaaa bbbbbb')
  })
}, '26 - redundant space between words')

test('27 - trailing/leading whitespace', function (t) {
  mixer(sampleObj, {
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('&nbsp; a b', elem),
      '&nbsp; a b',
      '27.1 - leading nbsp'
    )
    t.is(
      detergent('a b &nbsp;', elem),
      'a b &nbsp;',
      '27.2 - leading nbsp'
    )
    t.is(
      detergent('&nbsp; a &nbsp;', elem),
      '&nbsp; a &nbsp;',
      '27.3 - surrounded with nbsp'
    )
    t.is(
      detergent('    \xa0     a     \xa0      ', elem),
      '&nbsp; a &nbsp;',
      '27.4 - surrounded with nbsp'
    )
    t.is(
      detergent('&nbsp;&nbsp;&nbsp; a &nbsp;&nbsp;&nbsp;', elem),
      '&nbsp;&nbsp;&nbsp; a &nbsp;&nbsp;&nbsp;',
      '27.5 - surrounded with nbsp'
    )
    t.is(
      detergent(' &nbsp;&nbsp;&nbsp; a &nbsp;&nbsp;&nbsp; ', elem),
      '&nbsp;&nbsp;&nbsp; a &nbsp;&nbsp;&nbsp;',
      '27.6 - surrounded with nbsp'
    )
  })
  mixer(sampleObj, {
    convertEntities: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('&nbsp; a b', elem),
      '\xa0 a b',
      '27.7 - trailing nbsp'
    )
    t.is(
      detergent('a b &nbsp;', elem),
      'a b \xa0',
      '27.8 - trailing nbsp'
    )
    t.is(
      detergent('    &nbsp; a &nbsp;     ', elem),
      '\xa0 a \xa0',
      '27.9 - surrounded with nbsp'
    )
    t.is(
      detergent('    \xa0     a     \xa0           ', elem),
      '\xa0 a \xa0',
      '27.10 - surrounded with nbsp'
    )
    t.is(
      detergent('\xa0\xa0\xa0 a \xa0\xa0\xa0', elem),
      '\xa0\xa0\xa0 a \xa0\xa0\xa0',
      '27.11 - surrounded with nbsp'
    )
    t.is(
      detergent(' \xa0\xa0\xa0 a \xa0\xa0\xa0 ', elem),
      '\xa0\xa0\xa0 a \xa0\xa0\xa0',
      '27.12 - surrounded with nbsp'
    )
  })
})

// ==============================
// testing ETX removal
// ==============================

test('28 - ETX', function (t) {
  mixer(sampleObj, {
    removeLineBreaks: false,
    replaceLineBreaks: true,
    useXHTML: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('first\u0003second', elem),
      'first<br />\nsecond',
      '28.1 - replaces ETX with XHTML BR'
    )
  })
  mixer(sampleObj, {
    removeLineBreaks: false,
    replaceLineBreaks: true,
    useXHTML: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('first\u0003second', elem),
      'first<br>\nsecond',
      '28.2 - replaces ETX with HTML BR'
    )
  })
  mixer(sampleObj, {
    removeLineBreaks: false,
    replaceLineBreaks: false,
    useXHTML: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('first\u0003second', elem),
      'first\nsecond',
      '28.3 - replaces ETX with \\n'
    )
  })
})

// ==============================
// o.keepBoldEtc
// ==============================

test('29 - retaining b tags', function (t) {
  mixer(sampleObj, {
    keepBoldEtc: true,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('test text is being <b class="test" id="br">set in bold</b> here', elem),
      'test text is being <b>set in bold</b> here',
      '29.1 - B tag is retained - clean'
    )
    t.is(
      detergent('test text is being < b tralala >set in bold< /  b > here', elem),
      'test text is being <b>set in bold</b> here',
      '29.2 - B tag is retained - with spaces'
    )
    t.is(
      detergent('test text is being < B >set in bold< B /> here', elem),
      'test text is being <b>set in bold</b> here',
      '29.3 - B tag is retained - capitalised + wrong slash'
    )
  })
  mixer(sampleObj, {
    keepBoldEtc: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('test text is being <b>set in bold</b> here', elem),
      'test text is being set in bold here',
      '29.4 - B tag is removed - clean'
    )
    t.is(
      detergent('test text is being < b >set in bold< /  b > here', elem),
      'test text is being set in bold here',
      '29.5 - B tag is removed - with spaces'
    )
    t.is(
      detergent('test text is being < B >set in bold<   B / > here', elem),
      'test text is being set in bold here',
      '29.6 - B tag is removed - capitalised + wrong slash'
    )
  })
})

test('30 - retaining i tags', function (t) {
  mixer(sampleObj, {
    keepBoldEtc: true,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('test text is being <i>set in italic</i> here', elem),
      'test text is being <i>set in italic</i> here',
      '30.1 - i tag is retained - clean'
    )
    t.is(
      detergent('test text is being < i >set in italic< /  i > here', elem),
      'test text is being <i>set in italic</i> here',
      '30.2 - i tag is retained - with spaces'
    )
    t.is(
      detergent('test text is being < I >set in italic<   I /> here', elem),
      'test text is being <i>set in italic</i> here',
      '30.3 - i tag is retained - capitalised + wrong slash'
    )
  })
  mixer(sampleObj, {
    keepBoldEtc: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('test text is being <i>set in italic</i> here', elem),
      'test text is being set in italic here',
      '30.4 - i tag is removed - clean'
    )
    t.is(
      detergent('test text is being < i >set in italic< /  i > here', elem),
      'test text is being set in italic here',
      '30.5 - i tag is removed - with spaces'
    )
    t.is(
      detergent('test text is being < I >set in italic<  I /> here', elem),
      'test text is being set in italic here',
      '30.6 - i tag is removed - capitalised + wrong slash'
    )
  })
})

test('31 - retaining STRONG tags', function (t) {
  mixer(sampleObj, {
    keepBoldEtc: true,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('test text is being <strong id="main">set in bold</ strong> here', elem),
      'test text is being <strong>set in bold</strong> here',
      '31.1 - STRONG tag is retained - clean'
    )
    t.is(
      detergent('test text is being <strong id="main">set in bold<strong/> here', elem),
      'test text is being <strong>set in bold</strong> here',
      '31.2 - STRONG tag is retained - wrong closing slash'
    )
    t.is(
      detergent('test text is being < StRoNg >set in bold<StRoNg class="wrong1" / > here', elem),
      'test text is being <strong>set in bold</strong> here',
      '31.3 - STRONG tag is retained - dirty capitalisation + wrong slash'
    )
  })
  mixer(sampleObj, {
    keepBoldEtc: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('test text is being <strong id="main">set in bold</ strong> here', elem),
      'test text is being set in bold here',
      '31.4 - STRONG tag is removed - clean'
    )
    t.is(
      detergent('test text is being <strong id="main">set in bold<strong/> here', elem),
      'test text is being set in bold here',
      '31.5 - STRONG tag is removed - wrong closing slash'
    )
    t.is(
      detergent('test text is being < StRoNg >set in bold<StRoNg class="wrong1" / > here', elem),
      'test text is being set in bold here',
      '31.6 - STRONG tag is removed - dirty capitalisation + wrong slash'
    )
  })
})

test('32 - retaining EM tags', function (t) {
  mixer(sampleObj, {
    keepBoldEtc: true,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('test text is being <em>set in emphasis</em> here', elem),
      'test text is being <em>set in emphasis</em> here',
      '32.1 - EM tag is retained - clean'
    )
    t.is(
      detergent('test text is being <em id="main">set in emphasis<em/> here', elem),
      'test text is being <em>set in emphasis</em> here',
      '32.2 - EM tag is retained - wrong closing slash + some attributes'
    )
    t.is(
      detergent('test text is being < eM >set in emphasis<  Em  / > here', elem),
      'test text is being <em>set in emphasis</em> here',
      '32.3 - EM tag is retained - dirty capitalisation + wrong slash'
    )
  })
  mixer(sampleObj, {
    keepBoldEtc: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('test text is being <em>set in emphasis</em> here', elem),
      'test text is being set in emphasis here',
      '32.4 - EM tag is removed - clean'
    )
    t.is(
      detergent('test text is being <em id="main">set in emphasis<em/> here', elem),
      'test text is being set in emphasis here',
      '32.5 - EM tag is removed - wrong closing slash + some attributes'
    )
    t.is(
      detergent('test text is being < eM >set in emphasis<  Em  / > here', elem),
      'test text is being set in emphasis here',
      '32.6 - EM tag is removed - dirty capitalisation + wrong closing slash'
    )
  })
})

// ==============================
// o.convertDashes
// ==============================

test('33 - convert dashes into M dashes', function (t) {
  mixer(sampleObj, {
    convertDashes: true,
    removeWidows: false,
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('some text - some more text', elem),
      'some text &mdash; some more text',
      '33.1 - converts M dashes with encoding entities: +dashes-widows+entities'
    )
  })
  mixer(sampleObj, {
    convertDashes: true,
    removeWidows: false,
    convertEntities: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('some text - some more text', elem),
      'some text \u2014 some more text',
      '33.2 - converts M dashes without encoding entities: +dashes-widows-entities'
    )
  })
  mixer(sampleObj, {
    convertDashes: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('some text - some more text', elem),
      'some text - some more text',
      '33.3 - does not convert M dashes: -dashes-widows'
    )
  })
})

// ==============================
// o.replaceLineBreaks
// ==============================

test('34 - replace \\n line breaks with BR', function (t) {
  mixer(sampleObj, {
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: true,
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('\n\n\ntralala\ntralala2\n\ntralala3\n\n\ntralala4\n\n\n', elem),
      'tralala<br />\ntralala2<br />\n<br />\ntralala3<br />\n<br />\n<br />\ntralala4',
      '34.1 - converts line breaks into XHTML BR\'s'
    )
  })
  mixer(sampleObj, {
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: false,
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('\n\ntralala\ntralala2\n\ntralala3\n\n\ntralala4\n\n\n\n', elem),
      'tralala<br>\ntralala2<br>\n<br>\ntralala3<br>\n<br>\n<br>\ntralala4',
      '34.2 - converts line breaks into HTML BR\'s'
    )
  })
})

// ==============================
// o.removeLineBreaks
// ==============================

test('35 - replace \\n line breaks with BR', function (t) {
  mixer(sampleObj, {
    removeLineBreaks: true,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('\n\n\ntralala\ntralala2\ntralala3\n<   bR />\n\ntralala4\n\n\n', elem),
      'tralala tralala2 tralala3 tralala4',
      '35 - strips all line breaks'
    )
  })
})

// ==============================
// o.convertApostrophes
// ==============================

test('36 - convert apostrophes into fancy ones', function (t) {
  mixer(sampleObj, {
    convertApostrophes: true,
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('test\'s', elem),
      'test&rsquo;s',
      '36.1 - converts single apostrophes - with entities'
    )
  })
  mixer(sampleObj, {
    convertApostrophes: true,
    convertEntities: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('test\'s', elem),
      'test\u2019s',
      '36.2 - converts single apostrophes - no entities'
    )
  })
  mixer(sampleObj, {
    convertApostrophes: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('test\'s', elem),
      'test\'s',
      '36.3 - doesn\'t convert single apostrophes'
    )
  })
})

test('37 - convert double quotes into fancy ones', function (t) {
  mixer(sampleObj, {
    convertApostrophes: true,
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('this is "citation"', elem),
      'this is &ldquo;citation&rdquo;',
      '37.1 - converts quotation marks into fancy ones: +entities'
    )
  })
  mixer(sampleObj, {
    convertApostrophes: true,
    convertEntities: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('this is "citation"', elem),
      'this is \u201Ccitation\u201D',
      '37.2 - converts quotation marks into fancy ones: -entities'
    )
  })
  mixer(sampleObj, {
    convertApostrophes: false,
    convertEntities: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('this is "citation"', elem),
      'this is "citation"',
      '37.3 - doesn\'t convert quotation marks: -apostrophes-entities'
    )
  })
})

// ==============================
// o.convertDashes
// ==============================

// following tests are according to the Butterick's practical typography
// http://practicaltypography.com/hyphens-and-dashes.html

// N dash - use case #1
test('38 - converts dashes', function (t) {
  mixer(sampleObj, {
    convertDashes: true,
    convertEntities: true,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('1880-1912, pages 330-39', elem),
      '1880&ndash;1912, pages 330&ndash;39',
      '38.1 - converts dashes into N dashes: +dashes+entities-widows'
    )
  })
  mixer(sampleObj, {
    convertDashes: true,
    convertEntities: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('1880-1912, pages 330-39', elem),
      '1880\u20131912, pages 330\u201339',
      '38.2 - converts dashes into N dashes: +dashes-entities-widows'
    )
  })
  mixer(sampleObj, {
    convertDashes: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('1880-1912, pages 330-39', elem),
      '1880-1912, pages 330-39',
      '38.3 - doesn\'t convert N dashes when is not asked to: -dashes-widows'
    )
  })
})

// ==============================
// o.dontEncodeNonLatin
// ==============================

test('39 - doesn\'t encode non-Latin', function (t) {
  mixer(sampleObj, {
    dontEncodeNonLatin: true,
    convertEntities: true,
    removeWidows: false,
    replaceLineBreaks: false,
    removeLineBreaks: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('Greek: \u03A1\u03CC\u03B9\u03C3\u03C4\u03BF\u03BD \u03AE\u03C4\u03B1\u03BD \u03B5\u03B4\u03CE\nRussian: \u0420\u043E\u0438\u0441\u0442\u043E\u043D\nJapanese: \u30ED\u30A4\u30B9\u30C8\u30F3\nChinese: \u7F85\u4F0A\u65AF\u9813\nHebrew: \u05E8\u05D5\u05D9\u05E1\u05D8\u05D5\u05DF\nArabic: \u0631\u0648\u064A\u0633\u062A\u0648\u0646', elem),
      'Greek: \u03A1\u03CC\u03B9\u03C3\u03C4\u03BF\u03BD \u03AE\u03C4\u03B1\u03BD \u03B5\u03B4\u03CE\nRussian: \u0420\u043E\u0438\u0441\u0442\u043E\u043D\nJapanese: \u30ED\u30A4\u30B9\u30C8\u30F3\nChinese: \u7F85\u4F0A\u65AF\u9813\nHebrew: \u05E8\u05D5\u05D9\u05E1\u05D8\u05D5\u05DF\nArabic: \u0631\u0648\u064A\u0633\u062A\u0648\u0646',
      '39 - doesn\'t convert non-latin characters'
    )
  })
})

// ==============================
// checking all numeric entities encoded in hyphens-and-dashes
// such as, for example, &#118; or &#39; - range 0-255
// ==============================

test('40 - numeric entities', function (t) {
  t.is(
      detergent('aaaaaaa aaaaaaaaa aaaaaaaaaa&#160;bbbb'),
    'aaaaaaa aaaaaaaaa aaaaaaaaaa&nbsp;bbbb',
    '40.1 - numeric entities'
  )
  t.is(
      detergent('aaaaaaa aaaaaaaaa aaaaaaaaaa&nbsp;bbbb'),
    'aaaaaaa aaaaaaaaa aaaaaaaaaa&nbsp;bbbb',
    '40.2 - named entities'
  )
  t.is(
      detergent('aaaaaaa aaaaaaaaa aaaaaaaaa\xa0bbbb'),
    'aaaaaaa aaaaaaaaa aaaaaaaaa&nbsp;bbbb',
    '40.3 - non-encoded entities'
  )
})

// ==============================
// detecting partial named entities
// ==============================

// taster
test('41 - potentially clashing incomplete named entities', function (t) {
  t.is(
      detergent('&fnof;'),
    '&fnof;',
    '41.1 precaution &fnof; (\\u0192)')
  t.is(
      detergent('&thinsp;'),
    '&thinsp;',
    '41.2 precaution &thinsp;')
  t.is(
      detergent('&zwnj'),
    '&zwnj;',
    '41.3 precaution &zwnj')
  t.is(
      detergent('&pi&piv&pi&piv'),
    he.decode('&pi;&piv;&pi;&piv;'),
    '41.4 precaution &pi/&piv')
  t.is(
      detergent('&sub&sube&sub&sube'),
    '&sub;&sube;&sub;&sube;',
    '41.5 precaution &sub;/&sube;')
  t.is(
      detergent('&sup&sup1&sup&sup2&sup&sup3&sup&supe'),
    '&sup;&sup1;&sup;&sup2;&sup;&sup3;&sup;&supe;',
    '43.6 precaution &sup;/&sup1/&sup2/&sup3;/&supe')
  t.is(
      detergent('&theta&thetasym&theta&thetasym'),
    he.decode('&theta;&thetasym;&theta;&thetasym;'),
    '41.7 precaution &theta;/&thetasym;')
  t.is(
      detergent('&ang&angst&ang&angst'),
    '&ang;&#xC5;&ang;&#xC5;',
    '41.8 precaution &ang;/&angst;')
})

  // check if Detergent doesn't mess with named entities
  // no mixer — Detergent on default settings
test('42 - checking if entity references are left intact', function (t) {
  entityTest.forEach(function (elem, i) {
    t.is(
      detergent(Object.keys(elem)[0]),
      elem[Object.keys(elem)[0]],
      '42.' + i + ' ' + elem
    )
  })
})

test('43 - precaution against false positives', function (t) {
  mixer(sampleObj, {
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('Zzz times; Zzzz or; Zzzzzz real; Zzzz alpha; Zzzzz exist; Zzzzz euro;', elem),
      'Zzz times; Zzzz or; Zzzzzz real; Zzzz alpha; Zzzzz exist; Zzzzz euro;',
      '43.1 - false positives'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    removeWidows: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('Zzz times; Zzzz or; Zzzzzz real; Zzzz alpha; Zzzzz exist; Zzzzz euro;', elem),
      'Zzz times; Zzzz or; Zzzzzz real; Zzzz alpha; Zzzzz exist; Zzzzz&nbsp;euro;',
      '43.2 - false positives'
    )
  })
  mixer(sampleObj, {
    convertEntities: false,
    removeWidows: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('Zzz times; Zzzz or; Zzzzzz real; Zzzz alpha; Zzzzz exist; Zzzzz euro;', elem),
      'Zzz times; Zzzz or; Zzzzzz real; Zzzz alpha; Zzzzz exist; Zzzzz\xa0euro;',
      '43.3 - false positives'
    )
  })
})

// ==============================
// Clearly errors
// ==============================

test('44 - multiple lines & obvious errors in the text', function (t) {
  mixer(sampleObj, {
    removeWidows: false,
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('\u000a Very long line, long-enough to trigger widow removal . \u000a\n Text . ', elem),
      'Very long line, long-enough to trigger widow removal.<br />\n<br />\nText.',
      '44.1 - space - full stop'
    )
  })
  mixer(sampleObj, {
    removeWidows: true,
    convertEntities: true,
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('\u000a Very long line, long-enough to trigger widow removal . \u000a\n Text . ', elem),
      'Very long line, long-enough to trigger widow&nbsp;removal.<br />\n<br />\nText.',
      '44.2 - space - full stop'
    )
  })
  mixer(sampleObj, {
    removeWidows: true,
    convertEntities: false,
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('\u000a Very long line, long-enough to trigger widow removal . \u000a\n Text . ', elem),
      'Very long line, long-enough to trigger widow\xa0removal.<br />\n<br />\nText.',
      '44.3 - space - full stop'
    )
  })
  mixer(sampleObj, {
    removeWidows: false,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    useXHTML: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('\u000a Very long line, long-enough to trigger widow removal . \u000a\n Text . ', elem),
      'Very long line, long-enough to trigger widow removal.\n\nText.',
      '44.4 - space - full stop'
    )
  })
  mixer(sampleObj, {
    removeWidows: true,
    convertEntities: true,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    useXHTML: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('\u000a Very long line, long-enough to trigger widow removal . \u000a\n Text . ', elem),
      'Very long line, long-enough to trigger widow&nbsp;removal.\n\nText.',
      '44.5 - space - full stop'
    )
  })
  mixer(sampleObj, {
    removeWidows: true,
    convertEntities: false,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    useXHTML: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('\u000a Very long line, long-enough to trigger widow removal . \u000a\n Text . ', elem),
      'Very long line, long-enough to trigger widow\xa0removal.\n\nText.',
      '44.6 - space - full stop'
    )
  })
  mixer(sampleObj, {
    removeWidows: false,
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('\u000a Very long line, long-enough to trigger widow removal . \u000a\n Text . ', elem),
      'Very long line, long-enough to trigger widow removal.<br>\n<br>\nText.',
      '44.7 - space - full stop'
    )
  })
  mixer(sampleObj, {
    removeWidows: true,
    convertEntities: true,
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('\u000a Very long line, long-enough to trigger widow removal . \u000a\n Text . ', elem),
      'Very long line, long-enough to trigger widow&nbsp;removal.<br>\n<br>\nText.',
      '44.8 - space - full stop'
    )
  })
  mixer(sampleObj, {
    removeWidows: true,
    convertEntities: false,
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('\u000a Very long line, long-enough to trigger widow removal . \u000a\n Text . ', elem),
      'Very long line, long-enough to trigger widow\xa0removal.<br>\n<br>\nText.',
      '44.9 - space - full stop'
    )
  })
  mixer(sampleObj, {
    removeWidows: false,
    removeLineBreaks: true
  })
  .forEach(function (elem) {
    t.is(
      detergent(' \u000a    Very long line, long-enough to trigger widow removal   \n\n. \u000a\n Text text text text . ', elem),
      'Very long line, long-enough to trigger widow removal. Text text text text.',
      '44.10 - space - full stop'
    )
  })
  mixer(sampleObj, {
    removeWidows: true,
    convertEntities: true,
    removeLineBreaks: true
  })
  .forEach(function (elem) {
    t.is(
      detergent(' \u000a    Very long line, long-enough to trigger widow removal .  \n \n \u000a\n Text text text text . ', elem),
      'Very long line, long-enough to trigger widow removal. Text text text&nbsp;text.',
      '44.11 - space - full stop'
    )
  })
  mixer(sampleObj, {
    removeWidows: true,
    convertEntities: false,
    removeLineBreaks: true
  })
  .forEach(function (elem) {
    t.is(
      detergent(' \u000a   Very long line, long-enough to trigger widow removal .  \n \n  \u000a\n Text text text text . ', elem),
      'Very long line, long-enough to trigger widow removal. Text text text\xa0text.',
      '44.12 - space - full stop'
    )
  })
})

test('45 - multiple lines & obvious errors in the text', function (t) {
  t.is(
      detergent('a. \na'),
    'a.<br />\na',
    '45.1 - full stop - space - line break'
  )
  t.is(
      detergent('a . \na'),
    'a.<br />\na',
    '45.2 - space - full stop - space - line break'
  )
  t.is(
      detergent('a , \na'),
    'a,<br />\na',
    '45.3 - space - comma - space - line break'
  )
})

// ==============================
// multiple spaces before comma or full stop
// ==============================

test('46 - multiple spaces before comma/full stop', function (t) {
  // mixer no.1 — no widows removal
  mixer(sampleObj, {
    removeWidows: false
  })
  .forEach(function (elem) {
    // comma
    t.is(
      detergent('some text text text text            ,text  ', elem),
      'some text text text text, text',
      '46.1 - multiple spaces, comma, no space, text, spaces'
    )
    t.is(
      detergent('some text text text text            ,text', elem),
      'some text text text text, text',
      '46.2 - multiple spaces, comma, no space, text, no spaces'
    )
    t.is(
      detergent('some text text text text            ,', elem),
      'some text text text text,',
      '46.3 - multiple spaces, comma, string\'s end'
    )
    t.is(
      detergent('lots of text to trigger widow removal 2,5 here', elem),
      'lots of text to trigger widow removal 2,5 here',
      '46.4 - alternative decimal notation'
    )
    // full stop
    t.is(
      detergent('some text text text text            .text  ', elem),
      'some text text text text. text',
      '46.5 - multiple spaces, comma, no space, text, spaces'
    )
    t.is(
      detergent('some text text text text            .text', elem),
      'some text text text text. text',
      '46.6 - multiple spaces, comma, no space, text, no spaces'
    )
    t.is(
      detergent('some text text text text            .', elem),
      'some text text text text.',
      '46.7 - multiple spaces, comma, string\'s end'
    )
    t.is(
      detergent('lots of text to trigger widow removal 2.5 here', elem),
      'lots of text to trigger widow removal 2.5 here',
      '46.8 - alternative decimal notation'
    )
  })

  // mixer no.2 — widows removal
  mixer(sampleObj, {
    removeWidows: true,
    convertEntities: true
  })
  .forEach(function (elem) {
    // comma
    t.is(
      detergent('some text text text text            ,text  ', elem),
      'some text text text text,&nbsp;text',
      '46.9 - multiple spaces, comma, no space, text, spaces'
    )
    t.is(
      detergent('some text text text text            ,text', elem),
      'some text text text text,&nbsp;text',
      '46.10 - multiple spaces, comma, no space, text, no spaces'
    )
    t.is(
      detergent('some text text text text            ,', elem),
      'some text text text&nbsp;text,',
      '46.11 - multiple spaces, comma, string\'s end'
    )
    t.is(
      detergent('lots of text to trigger widow removal 2,5 here', elem),
      'lots of text to trigger widow removal 2,5&nbsp;here',
      '46.12 - alternative decimal notation'
    )
    // full stop
    t.is(
      detergent('some text text text text            .text  ', elem),
      'some text text text text.&nbsp;text',
      '46.13 - multiple spaces, comma, no space, text, spaces'
    )
    t.is(
      detergent('some text text text text            .text', elem),
      'some text text text text.&nbsp;text',
      '46.14 - multiple spaces, comma, no space, text, no spaces'
    )
    t.is(
      detergent('some text text text text            .', elem),
      'some text text text&nbsp;text.',
      '46.15 - multiple spaces, comma, string\'s end'
    )
    t.is(
      detergent('lots of text to trigger widow removal 2.5 here', elem),
      'lots of text to trigger widow removal 2.5&nbsp;here',
      '46.16 - alternative decimal notation'
    )
  })
})

// ==============================
// m dash sanity check
// ==============================

test('47 - m dash sanity check', function (t) {
  mixer(sampleObj, {
    convertEntities: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('m—m', elem),
      'm—m',
      '47 - leaves the m dashes alone'
    )
  })
})

// ==============================
// (horizontal) ellipsis sanity check
// ==============================

test('48 - horizontal ellipsis sanity check', function (t) {
  mixer(sampleObj, {
    convertEntities: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('\u2026', elem),
      '\u2026',
      '48.1 - leaves the ellipsis alone when it has to (unencoded)'
    )
    t.is(
      detergent('&hellip;', elem),
      '\u2026',
      '48.2 - leaves the ellipsis alone when it has to (hellip)'
    )
    t.is(
      detergent('&mldr;', elem),
      '\u2026',
      '48.3 - leaves the ellipsis alone when it has to (mldr)'
    )
  })
  mixer(sampleObj, {
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('\u2026', elem),
      '&hellip;',
      '48.4 - encodes the ellipsis when it has to (unencoded)'
    )
    t.is(
      detergent('&hellip;', elem),
      '&hellip;',
      '48.5 - encodes the ellipsis when it has to (hellip)'
    )
    t.is(
      detergent('&mldr;', elem),
      '&hellip;',
      '48.6 - encodes the ellipsis when it has to (mldr)'
    )
  })
})

// =======================================
// three dots converted to ellipsis symbol
// =======================================

test('49 - ellipsis', function (t) {
  mixer(sampleObj, {
    convertEntities: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('...', elem),
      '\u2026',
      '49.1 - converts three full stops to unencoded ellipsis'
    )
  })
  mixer(sampleObj, {
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('...', elem),
      '&hellip;',
      '49.2 - converts three full stops to encoded ellipsis'
    )
  })
})

// ============================================================================
// some HTML entitities can't be sent in named entities format, only in numeric
// ============================================================================

test('50 - numeric entities', function (t) {
  mixer(sampleObj, {
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('&Breve;', elem),
      '&#x2D8;',
      '50.1 - HTML entity — Breve'
    )
    t.is(
      detergent('&Backslash;', elem),
      '&#x2216;',
      '50.2 - HTML entity — Backslash'
    )
    t.is(
      detergent('&Cacute;', elem),
      '&#x106;',
      '50.3 - HTML entity — Cacute'
    )
    t.is(
      detergent('&CircleDot;', elem),
      '&#x2299;',
      '50.4 - HTML entity — CircleDot'
    )
    t.is(
      detergent('&DD;', elem),
      '&#x2145;',
      '50.5 - HTML entity — DD'
    )
    t.is(
      detergent('&Diamond;', elem),
      '&#x22C4;',
      '50.6 - HTML entity — Diamond'
    )
    t.is(
      detergent('&DownArrow;', elem),
      '&darr;',
      '50.7 - HTML entity — DownArrow'
    )
    t.is(
      detergent('&LT;', elem),
      '&lt;',
      '50.8 - HTML entity — LT'
    )
    t.is(
      detergent('&RightArrow;', elem),
      '&rarr;',
      '50.9 - HTML entity — RightArrow'
    )
    t.is(
      detergent('&SmallCircle;', elem),
      '&#x2218;',
      '50.10 - HTML entity — SmallCircle'
    )
    t.is(
      detergent('&Uarr;', elem),
      '&#x219F;',
      '50.11 - HTML entity — Uarr'
    )
    t.is(
      detergent('&Verbar;', elem),
      '&#x2016;',
      '50.12 - HTML entity — Verbar'
    )
    t.is(
      detergent('&angst;', elem),
      '&#xC5;',
      '50.13 - HTML entity — angst'
    )
    t.is(
      detergent('&zdot;', elem),
      '&#x17C;',
      '50.14 - HTML entity — zdot'
    )
  })
})

test('51 - wrong named entity QUOT into quot', function (t) {
  mixer(sampleObj, {
    convertEntities: true,
    convertApostrophes: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('&QUOT;', elem),
      '&quot;',
      '51 - HTML entity — QUOT'
    )
  })
})

// =====
// ndash
// =====

test('52 - missing space after ndash added', function (t) {
  mixer(sampleObj, {
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('10am&nbsp;&ndash;11am', elem),
      '10am&nbsp;&ndash; 11am',
      '52.1 - missing space after ndash added'
    )
    t.is(
      detergent('10am&ndash;11am', elem),
      '10am&ndash;11am',
      '52.2 - space after ndash not added where not needed'
    )
  })
  mixer(sampleObj, {
    convertEntities: false,
    replaceLineBreaks: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('10am&nbsp;&ndash;11am', elem),
      '10am\xa0\u2013 11am',
      '52.3 - missing space after ndash added'
    )
    t.is(
      detergent('10am&ndash;11am', elem),
      '10am\u201311am',
      '52.4 - space after ndash not added where not needed'
    )
  })
})

test('53 - missing space after ndash added', function (t) {
  mixer(sampleObj, {
    convertEntities: true,
    removeWidows: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('10am &ndash;11am', elem),
      '10am&nbsp;&ndash; 11am',
      '53.1 - missing space after ndash added'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('10am &ndash;11am', elem),
      '10am &ndash; 11am',
      '53.2 - missing space after ndash added'
    )
  })
})

// ===================
// nnbsp, NBSP and nbs
// ===================

// repetitions

test('54 - broken nbsp - repetitions — nnnbbbsssp', function (t) {
  mixer(sampleObj, {
    convertEntities: true,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa &&&&nnnbbbspp;;;; aaa\naaa nnnbbbsssp aaaa\naaaa&nnnnbbbssssppp;aaa\naaannnbbbsssp;aaaa\naaa&nnnbbbssspaaaa\naaa&nnbsp;aaaa\naaannbsp;aaaa\naaa&nnbspaaaa\naaa &nnbsp; aaaa\naaa nnbsp; aaaa\naaa &nnbsp aaaa', elem),
      'aaa &nbsp; aaa\naaa &nbsp; aaaa\naaaa&nbsp;aaa\naaa&nbsp;aaaa\naaa&nbsp;aaaa\naaa&nbsp;aaaa\naaa&nbsp;aaaa\naaa&nbsp;aaaa\naaa &nbsp; aaaa\naaa &nbsp; aaaa\naaa &nbsp; aaaa',
      '54.1'
    )
  })
  mixer(sampleObj, {
    convertEntities: false,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa &&&&nnnbbbspp;;;; aaa\naaa nnnbbbsssp aaaa\naaaa&nnnnbbbssssppp;aaa\naaannnbbbsssp;aaaa\naaa&nnnbbbssspaaaa\naaa&nnbsp;aaaa\naaannbsp;aaaa\naaa&nnbspaaaa\naaa &nnbsp; aaaa\naaa nnbsp; aaaa\naaa &nnbsp aaaa', elem),
      'aaa \xa0 aaa\naaa \xa0 aaaa\naaaa\xa0aaa\naaa\xa0aaaa\naaa\xa0aaaa\naaa\xa0aaaa\naaa\xa0aaaa\naaa\xa0aaaa\naaa \xa0 aaaa\naaa \xa0 aaaa\naaa \xa0 aaaa',
      '54.2'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: true,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa &&&&nnnbbbspp;;;; aaa\naaa nnnbbbsssp aaaa\naaaa&nnnnbbbssssppp;aaa\naaannnbbbsssp;aaaa\naaa&nnnbbbssspaaaa\naaa&nnbsp;aaaa\naaannbsp;aaaa\naaa&nnbspaaaa\naaa &nnbsp; aaaa\naaa nnbsp; aaaa\naaa &nnbsp aaaa', elem),
      'aaa &nbsp; aaa<br />\naaa &nbsp; aaaa<br />\naaaa&nbsp;aaa<br />\naaa&nbsp;aaaa<br />\naaa&nbsp;aaaa<br />\naaa&nbsp;aaaa<br />\naaa&nbsp;aaaa<br />\naaa&nbsp;aaaa<br />\naaa &nbsp; aaaa<br />\naaa &nbsp; aaaa<br />\naaa &nbsp; aaaa',
      '54.3'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa &&&&nnnbbbspp;;;; aaa\naaa nnnbbbsssp aaaa\naaaa&nnnnbbbssssppp;aaa\naaannnbbbsssp;aaaa\naaa&nnnbbbssspaaaa\naaa&nnbsp;aaaa\naaannbsp;aaaa\naaa&nnbspaaaa\naaa &nnbsp; aaaa\naaa nnbsp; aaaa\naaa &nnbsp aaaa', elem),
      'aaa &nbsp; aaa<br>\naaa &nbsp; aaaa<br>\naaaa&nbsp;aaa<br>\naaa&nbsp;aaaa<br>\naaa&nbsp;aaaa<br>\naaa&nbsp;aaaa<br>\naaa&nbsp;aaaa<br>\naaa&nbsp;aaaa<br>\naaa &nbsp; aaaa<br>\naaa &nbsp; aaaa<br>\naaa &nbsp; aaaa',
      '54.4'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    removeLineBreaks: true,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa &&&&nnnbbbspp;;;; aaa\naaa nnnbbbsssp aaaa\naaaa&nnnnbbbssssppp;aaa\naaannnbbbsssp;aaaa\naaa&nnnbbbssspaaaa\naaa&nnbsp;aaaa\naaannbsp;aaaa\naaa&nnbspaaaa\naaa &nnbsp; aaaa\naaa nnbsp; aaaa\naaa &nnbsp aaaa', elem),
      'aaa &nbsp; aaa aaa &nbsp; aaaa aaaa&nbsp;aaa aaa&nbsp;aaaa aaa&nbsp;aaaa aaa&nbsp;aaaa aaa&nbsp;aaaa aaa&nbsp;aaaa aaa &nbsp; aaaa aaa &nbsp; aaaa aaa &nbsp; aaaa',
      '54.5'
    )
  })
  mixer(sampleObj, {
    convertEntities: false,
    removeLineBreaks: true,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa &&&&nnnbbbspp;;;; aaa\naaa nnnbbbsssp aaaa\naaaa&nnnnbbbssssppp;aaa\naaannnbbbsssp;aaaa\naaa&nnnbbbssspaaaa\naaa&nnbsp;aaaa\naaannbsp;aaaa\naaa&nnbspaaaa\naaa &nnbsp; aaaa\naaa nnbsp; aaaa\naaa &nnbsp aaaa', elem),
      'aaa \xa0 aaa aaa \xa0 aaaa aaaa\xa0aaa aaa\xa0aaaa aaa\xa0aaaa aaa\xa0aaaa aaa\xa0aaaa aaa\xa0aaaa aaa \xa0 aaaa aaa \xa0 aaaa aaa \xa0 aaaa',
      '54.6'
    )
  })
})

test('55 - nbSp with no semicol', function (t) {
  mixer(sampleObj, {
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a nbbSp a', elem),
      'a &nbsp; a',
      '55.1 - missing semicol/ampers and wrong capitalisation and repetitions'
    )
  })
  mixer(sampleObj, {
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('a nbbSppp; a', elem),
      'a &nbsp; a',
      '55.2 - missing amp and wrong capitalisation and repetition on P'
    )
  })
})

// NBSP missing letters AMPERSAND OBLIGATORY, SEMICOL — NOT:

test('56 - broken nbsp - &nbsp (no semicol)', function (t) {
  mixer(sampleObj, {
    convertEntities: true,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa&nbs;aaaa\naaa&nbsaaaa\naaa &nbs; aaaa\naaa &nbs aaaa\naaa &nbs\naaa &nbs', elem),
      'aaa&nbsp;aaaa\naaa&nbsp;aaaa\naaa &nbsp; aaaa\naaa &nbsp; aaaa\naaa &nbsp;\naaa &nbsp;',
      '56.1 - &nbsp missing p'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa&nbp;aaaa\naaa&nbpaaaa\naaa &nbp; aaaa\naaa &nbp aaaa\naaa &nbp\naaa &nbp', elem),
      'aaa&nbsp;aaaa\naaa&nbsp;aaaa\naaa &nbsp; aaaa\naaa &nbsp; aaaa\naaa &nbsp;\naaa &nbsp;',
      '56.2 - &nbsp missing s'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa&nsp;aaaa\naaa&nspaaaa\naaa &nsp; aaaa\naaa &nsp aaaa\naaa &nsp\naaa &nsp', elem),
      'aaa&nbsp;aaaa\naaa&nbsp;aaaa\naaa &nbsp; aaaa\naaa &nbsp; aaaa\naaa &nbsp;\naaa &nbsp;',
      '56.3 - &nbsp missing b'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa&bsp;aaaa\naaa&bspaaaa\naaa &bsp; aaaa\naaa &bsp aaaa\naaa &bsp\naaa &bsp', elem),
      'aaa&nbsp;aaaa\naaa&nbsp;aaaa\naaa &nbsp; aaaa\naaa &nbsp; aaaa\naaa &nbsp;\naaa &nbsp;',
      '56.4 - &nbsp missing n'
    )
  })
})

// NBSP missing letters SEMICOL OBLIGATORY, AMPERSAND — NOT:

test('57 - broken nbsp - nbsp; (no ampersand)', function (t) {
  mixer(sampleObj, {
    convertEntities: true,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa&nbs;aaaa\naaanbs;aaaa\naaa &nbs; aaaa\naaa nbs; aaaa\nnbs; aaaa\nnbs; aaaa', elem),
      'aaa&nbsp;aaaa\naaa&nbsp;aaaa\naaa &nbsp; aaaa\naaa &nbsp; aaaa\n&nbsp; aaaa\n&nbsp; aaaa',
      '57.1 - missing p'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa&nbp;aaaa\naaanbp;aaaa\naaa &nbp; aaaa\naaa nbp; aaaa\nnbp; aaaa\nnbp; aaaa', elem),
      'aaa&nbsp;aaaa\naaa&nbsp;aaaa\naaa &nbsp; aaaa\naaa &nbsp; aaaa\n&nbsp; aaaa\n&nbsp; aaaa',
      '57.2 - missing s'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa&nsp;aaaa\naaansp;aaaa\naaa &nsp; aaaa\naaa nsp; aaaa\nnsp; aaaa\nnsp; aaaa', elem),
      'aaa&nbsp;aaaa\naaa&nbsp;aaaa\naaa &nbsp; aaaa\naaa &nbsp; aaaa\n&nbsp; aaaa\n&nbsp; aaaa',
      '57.3 - missing b'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa&bsp;aaaa\naaabsp;aaaa\naaa &bsp; aaaa\naaa bsp; aaaa\nbsp; aaaa\nbsp; aaaa', elem),
      'aaa&nbsp;aaaa\naaa&nbsp;aaaa\naaa &nbsp; aaaa\naaa &nbsp; aaaa\n&nbsp; aaaa\n&nbsp; aaaa',
      '57.4 - missing n'
    )
  })
})

// NBSP missing letters AMPERSAND OBLIGATORY, SEMICOL — NOT:
// [' ', '.', ',', ';', '\xa0', '?', '!']
test('58 - broken nbsp - ?!.,nbsp (no semicol)', function (t) {
  mixer(sampleObj, {
    convertEntities: true,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa nbspaaa.nbspaaa,nbspaaa;nbspaaa\xa0nbspaaa?nbspaaa!nbspaaa', elem),
      'aaa &nbsp;aaa. &nbsp;aaa, &nbsp;aaa;&nbsp;aaa&nbsp;&nbsp;aaa?&nbsp;aaa!&nbsp;aaa',
      '58.1 - nbsp missing semicol and amp'
    )
    t.is(
      detergent('prop nbspprop.nbspprop,nbspprop;nbspprop\xa0nbspprop?nbspprop!nbspprop', elem),
      'prop &nbsp;prop. &nbsp;prop, &nbsp;prop;&nbsp;prop&nbsp;&nbsp;prop?&nbsp;prop!&nbsp;prop',
      '58.2 - nbsp missing semicol and amp - sneaky p\'s'
    )
  })
})

// ==============================
// COPING WITH MULTIPLE ENCODING
// ==============================

test('59 - recursive entity de-coding', function (t) {
  mixer(sampleObj, {
    convertEntities: false
  })
  .forEach(function (elem) {
    t.is(
      detergent('&amp;nbsp;', elem),
      '\xa0',
      '59.1 - double-encoded nbsp'
    )
    t.is(
      detergent('&amp;pound;', elem),
      '£',
      '59.2 - double-encoded pound'
    )
    t.is(
      detergent('&amp;amp;amp;amp;pound;', elem),
      '£',
      '59.3 - five times encoded pound'
    )
    t.is(
      detergent('&#x26;#xA9;', elem),
      '\u00A9',
      '59.4 - twice encoded using numeric entities'
    )
  })
  mixer(sampleObj, {
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('&amp;nbsp;', elem),
      '&nbsp;',
      '59.5 - double-encoded nbsp'
    )
    t.is(
      detergent('&amp;pound;', elem),
      '&pound;',
      '59.6 - double-encoded pound'
    )
    t.is(
      detergent('&amp;amp;amp;amp;pound;', elem),
      '&pound;',
      '59.7 - five times encoded pound'
    )
    t.is(
      detergent('&#x26;#xA9;', elem),
      '&copy;',
      '59.8 - twice encoded using numeric entities'
    )
  })
})

// =================================
// Enforcing spaces after semicolons
// =================================

test('60 - spaces after semicolons', function (t) {
  // usual:
  allCombinations.forEach(function (elem) {
    t.is(
      detergent('aaa;aaa', elem),
      'aaa; aaa',
      '60.1 - missing semicol'
    )
  })
  // semicol is last character:
  allCombinations.forEach(function (elem) {
    t.is(
      detergent('aaa;aaa;', elem),
      'aaa; aaa;',
      '60.2 - semicol at eol'
    )
  })
  // must not affect HTML entities:
  mixer(sampleObj, {
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(
      detergent('aaa&nbsp;aaa', elem),
      'aaa&nbsp;aaa',
      '60.3 - semicol fixes must not affect HTML entities'
    )
  })
})
