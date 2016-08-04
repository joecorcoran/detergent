'use strict'

var detergent = require('./detergent.js')
var mixer = require('object-boolean-combinations')
var entityRefs = require('./entity-references.json')

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

test('invisibles being removed', t => {
  t.is(detergent('\u0000\u0001\u0002\u0004\u0005\u0006\u0007\u0008\u000E\u000F\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017\u0018\u0019\u001A\u001B\u001C\u001D\u001E\u001F\u007F\u0080\u0081\u0082\u0083\u0084\u0086\u0087\u0088\u0089\u008A\u008B\u008C\u008D\u008E\u008F\u0090\u0091\u0092\u0093\u0094\u0095\u0096\u0097\u0098\u0099\u009A\u009B\u009C\u009D\u009E\u009F'), '')
})

test('hairspace changed to space', function (t) {
  mixer(sampleObj, {
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'a&hairsp;a&VeryThinSpace;a&#x0200A;a&#8202;a\u200Aa', elem),
      'a a a a a a',
      'hairspace changed to space'
    )
    t.is(detergent(
      'a    &hairsp;  a  &VeryThinSpace;   a &#x0200A;     a              &#8202; a \u200A a    ', elem),
      'a a a a a a',
      'hairspace changed to space (lots of spaces)'
    )
  })
  mixer(sampleObj, {
    removeWidows: true,
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      'a&hairsp;a&VeryThinSpace;a&#x0200A;a&#8202;a\u200Aa', elem),
      'a a a a a&nbsp;a',
      'hairspace changed to space: +widows+entities'
    )
  })
})

test('invisible line breaks replaced', function (t) {
  mixer(sampleObj, {
    replaceLineBreaks: false,
    removeLineBreaks: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'a\u000Ab\u000Bc\u000C\u000D\u2028\u2029\u0003d', elem),
      'a\nb\nc\n\n\n\n\nd',
      'unencoded invisible breaks into \\n\'s'
    )
    t.is(detergent(
      'a&#10;b&#11;c&#12;&#13;&#8232;&#8233;&#3;d', elem),
      'a\nb\nc\n\n\n\n\nd',
      'encoded invisible breaks into \\n\'s'
    )
  })

  mixer(sampleObj, {
    removeLineBreaks: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      'a\u000Bb\u000C\u000D\u0085c\u2028\u2029d', elem),
      'abcd',
      'invisible breaks and remove all line breaks on'
    )
  })

  mixer(sampleObj, {
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      'a\u000Ab\u000Bc\u000C\u000D\u0085\u2028\u2029d', elem),
      'a<br />\nb<br />\nc<br />\n<br />\n<br />\n<br />\n<br />\nd',
      'replace breaks into XHTML BR\'s'
    )
  })

  mixer(sampleObj, {
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'a\u000Ab\u000Bc\u000C\u000D\u0085\u2028\u2029d', elem),
      'a<br>\nb<br>\nc<br>\n<br>\n<br>\n<br>\n<br>\nd',
      'replace breaks into HTML BR\'s'
    )
  })
})

// ==============================
// o.removeSoftHyphens
// ==============================

test('removing soft hyphens', function (t) {
  mixer(sampleObj, {
    removeSoftHyphens: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\u00ADbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', elem),
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      'remove soft hyphens'
    )
  })
  mixer(sampleObj, {
    convertEntities: false,
    removeSoftHyphens: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\u00ADbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', elem),
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\u00ADbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      'don\'t remove soft hyphens, but don\'t encode either'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    removeSoftHyphens: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\u00ADbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', elem),
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&shy;bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      'don\'t remove soft hyphens, encode into &shy'
    )
  })
})

// ==============================
// strip the HTML
// ==============================

test('strip HTML', function (t) {
  mixer(sampleObj, {
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'text <a>text</a> text', elem),
      'text text text',
      '#1 strip the HTML'
    )
    t.is(detergent(
      'text <a>text<a> text', elem),
      'text text text',
      '#2 strip the HTML'
    )
    t.is(detergent(
      'text <error>text<error> text', elem),
      'text text text',
      '#3 strip the HTML'
    )
    t.is(detergent(
      'text <sldkfj asdasd="lekjrtt" lgkdjfld="lndllkjfg">text<hgjkd> text', elem),
      'text text text',
      '#4 strip the HTML'
    )
    t.is(detergent(
      'text <a href="#" style="display: block;">text</a> text', elem),
      'text text text',
      '#5 strip the HTML'
    )
  })
})

// ==============================
// o.convertEntities
// ==============================

test('encode entities - pound sign', function (t) {
  mixer(sampleObj, {
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      '\u00A3', elem),
      '&pound;',
      'pound char converted into entity: +entities'
    )
  })
  mixer(sampleObj, {
    convertEntities: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      '\u00A3', elem),
      '\u00A3',
      'pound char not converted into entity: -entities'
    )
  })
})

test('encode entities - m-dash', function (t) {
  mixer(sampleObj, {
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      '\u2014', elem),
      '&mdash;',
      'M dash char encoded into entity: +entities'
    )
  })
  mixer(sampleObj, {
    convertEntities: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      '\u2014', elem),
      '\u2014',
      'M dash char not converted into entity: -entities'
    )
  })
})

test('Sketch case: hairspaces', function (t) {
  mixer(sampleObj, {
    convertEntities: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'a\u200A&mdash;\u200Aa', elem),
      'a \u2014 a',
      '#1 hairspaces'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'HOORAY  \u2014  IT’S HERE \u200A', elem),
      'HOORAY &mdash; IT&rsquo;S HERE',
      '#2 hairspaces'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    removeWidows: false,
    convertDashes: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      'HOORAY  -  IT’S HERE \u200A', elem),
      'HOORAY &mdash; IT&rsquo;S HERE',
      '#3 hairspaces'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    removeWidows: false,
    convertDashes: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'HOORAY  -  IT’S HERE \u200A', elem),
      'HOORAY - IT&rsquo;S HERE',
      '#4 hairspaces'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    removeWidows: true,
    convertDashes: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'HOORAY  -  IT’S HERE \u200A', elem),
      'HOORAY - IT&rsquo;S&nbsp;HERE',
      '#5 hairspaces'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    removeWidows: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      'HOORAY  —  IT’S HERE \u200A', elem),
      'HOORAY&nbsp;&mdash; IT&rsquo;S&nbsp;HERE',
      '#6 hairspaces'
    )
  })
})

// convertDashes: true

// more dashes tests:
test('More hairspaces safeguards', function (t) {
  mixer(sampleObj, {
    convertDashes: true,
    convertEntities: true,
    removeWidows: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      'aaaaaaaaaaa - aaaaaaaaaaaa', elem),
      'aaaaaaaaaaa&nbsp;&mdash; aaaaaaaaaaaa',
      '#7 hairspaces'
    )
  })
  mixer(sampleObj, {
    convertDashes: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'aaaaaaaaaaa - aaaaaaaaaaaa', elem),
      'aaaaaaaaaaa - aaaaaaaaaaaa',
      '#8 hairspaces'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    removeWidows: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      'aaaaaaaaaaa \u2014 aaaaaaaaaaaa', elem),
      'aaaaaaaaaaa&nbsp;&mdash; aaaaaaaaaaaa',
      '#9 hairspaces'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    removeWidows: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      'aaaaaaaaaaa &mdash; aaaaaaaaaaaa', elem),
      'aaaaaaaaaaa&nbsp;&mdash; aaaaaaaaaaaa',
      '#10 hairspaces'
    )
  }) // --- PART II ---
  mixer(sampleObj, {
    convertEntities: true,
    removeWidows: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      'a \u2014a', elem),
      'a&nbsp;&mdash; a',
      '#11 hairspaces'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'a \u2014a', elem),
      'a &mdash; a',
      '#12 hairspaces'
    )
  })
  mixer(sampleObj, {
    convertEntities: false,
    removeWidows: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      'a \u2014a', elem),
      'a\xa0\u2014 a',
      '#13 hairspaces'
    )
  })
  mixer(sampleObj, {
    convertEntities: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'a \u2014a', elem),
      'a \u2014 a',
      '#14 hairspaces'
    )
  })// --- PART III - hairlines mixed in ---
  mixer(sampleObj, {
    convertEntities: true,
    removeWidows: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      'a\u200A\u2014a', elem),
      'a&nbsp;&mdash; a',
      '#15 hairspaces'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'a\u200A\u2014a', elem),
      'a &mdash; a',
      '#16 hairspaces'
    )
  })
  mixer(sampleObj, {
    convertEntities: false,
    removeWidows: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      'a\u200A\u2014a', elem),
      'a\xa0\u2014 a',
      '#17 hairspaces'
    )
  })
  mixer(sampleObj, {
    convertEntities: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'a\u200A\u2014a', elem),
      'a \u2014 a',
      '#18 hairspaces'
    )
  })
})

// more hairspaces protection:
test('More hairspaces safeguards', function (t) {
  mixer(sampleObj, {
    convertEntities: true,
    removeWidows: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      'a\u200Aa a a a a a a a a \u2014 a a a a ', elem),
      'a a a a a a a a a a&nbsp;&mdash; a a a&nbsp;a',
      '#19 hairspaces'
    )
  })
  mixer(sampleObj, {
    convertEntities: true,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'a a a a a a\u200Aa a a a \u2014 a a a a ', elem),
      'a a a a a a a a a a &mdash; a a a a',
      '#20 hairspaces'
    )
  })
  mixer(sampleObj, {
    convertEntities: false,
    removeWidows: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      'a a a a a a a a a a \u2014 a a a a \u200A', elem),
      'a a a a a a a a a a\xa0\u2014 a a a\xa0a',
      '#21 hairspaces'
    )
  })
  mixer(sampleObj, {
    convertEntities: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'a a a a a a a a a a \u2014 a a a a \u200A', elem),
      'a a a a a a a a a a \u2014 a a a a',
      '#22 hairspaces'
    )
  })
})

test('encode entities - tetragram for centre', function (t) {
  mixer(sampleObj, {
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      '\uD834\uDF06', elem),
      '&#x1D306;',
      'trigram char converted into entity'
    )
  })
  mixer(sampleObj, {
    convertEntities: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      '\uD834\uDF06', elem),
      '\uD834\uDF06',
      'trigram char not converted into entity'
    )
  })
})

test('encode entities - one more paired surrogate', function (t) {
  mixer(sampleObj, {
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      '\uD83D\uDE0A', elem),
      '&#x1F60A;',
      'paired surrogate is kept and encoded'
    )
  })
  mixer(sampleObj, {
    convertEntities: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      '\uD83D\uDE0A', elem),
      '\uD83D\uDE0A',
      'paired surrogate is kept and not encoded'
    )
  })
})

test('contingency - stray unpaired surrogates', function (t) {
  allCombinations.forEach(function (elem) {
    t.is(detergent(
      '\uFFFDa\uD800a\uD83Da\uDBFF', elem),
      'aaa',
      'stray low surrogates are deleted')
  })
  allCombinations.forEach(function (elem) {
    t.is(detergent(
      '\uDC00a\uDE0Aa\uDFFF', elem),
      'aa',
      'stray high surrogates are deleted')
  })
})

test('encode entities - gr\u00F6\u00DFer', function (t) {
  mixer(sampleObj, {
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      'gr\u00F6\u00DFer', elem),
      'gr&ouml;&szlig;er',
      'German entities encoded'
    )
  })
  mixer(sampleObj, {
    convertEntities: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'gr\u00F6\u00DFer', elem),
      'gr\u00F6\u00DFer',
      'German entities not encoded'
    )
  })
})

// ==============================
// o.removeWidows
// ==============================

test('remove widows true + encoding - one line string', function (t) {
  mixer(sampleObj, {
    removeWidows: true,
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      'aaa bbb ccc ddd', elem),
      'aaa bbb ccc&nbsp;ddd',
      'remove widows - entities, one line string no full stop'
    )
    t.is(detergent(
      'aaa bbb ccc ddd.', elem),
      'aaa bbb ccc&nbsp;ddd.',
      'remove widows - entities, one line string with full stop'
    )
  })
})

test('remove widows true + no encoding - one line string', function (t) {
  mixer(sampleObj, {
    removeWidows: true,
    convertEntities: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'aaa bbb ccc ddd', elem),
      'aaa bbb ccc\xa0ddd',
      'remove widows - no entities, one line string no full stop'
    )
    t.is(detergent(
      'aaa bbb ccc ddd.', elem),
      'aaa bbb ccc\xa0ddd.',
      'remove widows - no entities, one line string with full stop'
    )
  })
})

test('remove widows false - one line string', function (t) {
  mixer(sampleObj, {
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'aaa bbb ccc ddd', elem),
      'aaa bbb ccc ddd',
      'don\'t remove widows - no full stop'
    )
    t.is(detergent(
      'aaa bbb ccc ddd.', elem),
      'aaa bbb ccc ddd.',
      'don\'t remove widows - ending with full stop'
    )
  })
})

test('remove widows - two BRs 1', function (t) {
  mixer(sampleObj, {
    removeWidows: true,
    convertEntities: true,
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      'aaa bbb ccc ddd\n\neee fff ggg hhh', elem),
      'aaa bbb ccc&nbsp;ddd<br />\n<br />\neee fff ggg&nbsp;hhh',
      'remove widows - two line breaks with encoding BR in XHTML'
    )
  })
})
test('remove widows - two BRs 2', function (t) {
  mixer(sampleObj, {
    removeWidows: true,
    convertEntities: true,
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'aaa bbb ccc ddd\n\neee fff ggg hhh', elem),
      'aaa bbb ccc&nbsp;ddd<br>\n<br>\neee fff ggg&nbsp;hhh',
      'two BR\'s, widows with NBSP and HTML BR'
    )
  })
})
test('remove widows - two BRs 3', function (t) {
  mixer(sampleObj, {
    removeWidows: true,
    convertEntities: true,
    replaceLineBreaks: false,
    removeLineBreaks: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'aaa bbb ccc ddd\n\neee fff ggg hhh', elem),
      'aaa bbb ccc&nbsp;ddd\n\neee fff ggg&nbsp;hhh',
      'two BR\'s, widows replaced with &nbsp'
    )
  })
})
test('remove widows - two BRs 4', function (t) {
  mixer(sampleObj, {
    removeWidows: true,
    convertEntities: false,
    replaceLineBreaks: false,
    removeLineBreaks: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'aaa bbb ccc ddd\n\neee fff ggg hhh', elem),
      'aaa bbb ccc\u00A0ddd\n\neee fff ggg\u00A0hhh',
      'two BR\'s, widows replaced with non-encoded NBSP'
    )
  })
})
test('remove widows - one BR', function (t) {
  mixer(sampleObj, {
    removeWidows: true,
    convertEntities: true,
    replaceLineBreaks: false,
    removeLineBreaks: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'aaa bbb ccc ddd\neee fff ggg hhh.', elem),
      'aaa bbb ccc ddd\neee fff ggg&nbsp;hhh.',
      'one line break, no full stop - no widow fix needed'
    )
    t.is(detergent(
      'aaa bbb ccc ddd.\neee fff ggg hhh.', elem),
      'aaa bbb ccc&nbsp;ddd.\neee fff ggg&nbsp;hhh.',
      'one line break, with full stop - widow fix needed'
    )
  })
})
test('remove widows - trailing space', function (t) {
  mixer(sampleObj, {
    removeWidows: true,
    convertEntities: true,
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'aaa bbb ccc ddd. \n\neee fff ggg hhh', elem),
      'aaa bbb ccc&nbsp;ddd.<br>\n<br>\neee fff ggg&nbsp;hhh',
      'line-dot-space-brbr-line'
    )
  })
})

// TODO: widows with trailing white space before last full stop

// ==============================
// testing defaults
// ==============================

test('default set - \\n replacement with BR', function (t) {
  t.is(detergent(
    'aaa\n\nbbb\n\nccc'),
    'aaa<br />\n<br />\nbbb<br />\n<br />\nccc',
    '\\n type replaced with <br />')
})

test('default set - HTML BR replacement with XHTML BR', function (t) {
  t.is(detergent(
    'aaa<br>bbb<br>ccc'),
    'aaa<br />\nbbb<br />\nccc',
    '<br> replaced with <br />')
})

test('default set - dirty BRs', function (t) {
  t.is(detergent(
    'aaa<BR />< BR>bbb< BR ><BR>ccc< br >< Br>ddd'),
    'aaa<br />\n<br />\nbbb<br />\n<br />\nccc<br />\n<br />\nddd',
    'various dirty BRs replaced with <br />')
})

// ==============================
// testing rubbish removal
// ==============================

test('strip front/back spaces', function (t) {
  allCombinations.forEach(function (elem) {
    t.is(detergent(
      '\n\n \t     aaaaaa   \n\t\t  ', elem),
      'aaaaaa')
  })
}, 'front & back spaces stripped')

test('strip middle space clusters', function (t) {
  allCombinations.forEach(function (elem) {
    t.is(detergent('aaaaaa     bbbbbb', elem), 'aaaaaa bbbbbb')
  })
}, 'redundant space between words')

test('leading-trailing non-breaking space', function (t) {
  mixer(sampleObj, {
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      '&nbsp; a b', elem),
      '&nbsp; a b',
      '#1 leading nbsp'
    )
    t.is(detergent(
      'a b &nbsp;', elem),
      'a b &nbsp;',
      '#2 leading nbsp'
    )
    t.is(detergent(
      '&nbsp; a &nbsp;', elem),
      '&nbsp; a &nbsp;',
      '#3 surrounded with nbsp'
    )
    t.is(detergent(
      '    \xa0     a     \xa0      ', elem),
      '&nbsp; a &nbsp;',
      '#4 surrounded with nbsp'
    )
    t.is(detergent(
      '&nbsp;&nbsp;&nbsp; a &nbsp;&nbsp;&nbsp;', elem),
      '&nbsp;&nbsp;&nbsp; a &nbsp;&nbsp;&nbsp;',
      '#5 surrounded with nbsp'
    )
    t.is(detergent(
      ' &nbsp;&nbsp;&nbsp; a &nbsp;&nbsp;&nbsp; ', elem),
      '&nbsp;&nbsp;&nbsp; a &nbsp;&nbsp;&nbsp;',
      '#6 surrounded with nbsp'
    )
  })
  mixer(sampleObj, {
    convertEntities: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      '&nbsp; a b', elem),
      '\xa0 a b',
      '#7 trailing nbsp'
    )
    t.is(detergent(
      'a b &nbsp;', elem),
      'a b \xa0',
      '#8 trailing nbsp'
    )
    t.is(detergent(
      '    &nbsp; a &nbsp;     ', elem),
      '\xa0 a \xa0',
      '#9 surrounded with nbsp'
    )
    t.is(detergent(
      '    \xa0     a     \xa0           ', elem),
      '\xa0 a \xa0',
      '#10 surrounded with nbsp'
    )
    t.is(detergent(
      '\xa0\xa0\xa0 a \xa0\xa0\xa0', elem),
      '\xa0\xa0\xa0 a \xa0\xa0\xa0',
      '#11 surrounded with nbsp'
    )
    t.is(detergent(
      ' \xa0\xa0\xa0 a \xa0\xa0\xa0 ', elem),
      '\xa0\xa0\xa0 a \xa0\xa0\xa0',
      '#12 surrounded with nbsp'
    )
  })
})

// ==============================
// testing ETX removal
// ==============================

test('replace all ETX symbols with BR', function (t) {
  mixer(sampleObj, {
    removeLineBreaks: false,
    replaceLineBreaks: true,
    useXHTML: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      'first\u0003second', elem),
      'first<br />\nsecond',
      'replaces ETX with XHTML BR'
    )
  })
  mixer(sampleObj, {
    removeLineBreaks: false,
    replaceLineBreaks: true,
    useXHTML: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'first\u0003second', elem),
      'first<br>\nsecond',
      'replaces ETX with HTML BR'
    )
  })
  mixer(sampleObj, {
    removeLineBreaks: false,
    replaceLineBreaks: false,
    useXHTML: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'first\u0003second', elem),
      'first\nsecond',
      'replaces ETX with \\n'
    )
  })
})

// ==============================
// o.keepBoldEtc
// ==============================

test('retaining b tags', function (t) {
  mixer(sampleObj, {
    keepBoldEtc: true,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'test text is being <b class="test" id="br">set in bold</b> here', elem),
      'test text is being <b>set in bold</b> here',
      'B tag is retained - clean'
    )
    t.is(detergent(
      'test text is being < b tralala >set in bold< /  b > here', elem),
      'test text is being <b>set in bold</b> here',
      'B tag is retained - with spaces'
    )
    t.is(detergent(
      'test text is being < B >set in bold< B /> here', elem),
      'test text is being <b>set in bold</b> here',
      'B tag is retained - capitalised + wrong slash'
    )
  })
  mixer(sampleObj, {
    keepBoldEtc: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'test text is being <b>set in bold</b> here', elem),
      'test text is being set in bold here',
      'B tag is removed - clean'
    )
    t.is(detergent(
      'test text is being < b >set in bold< /  b > here', elem),
      'test text is being set in bold here',
      'B tag is removed - with spaces'
    )
    t.is(detergent(
      'test text is being < B >set in bold<   B / > here', elem),
      'test text is being set in bold here',
      'B tag is removed - capitalised + wrong slash'
    )
  })
})

test('retaining i tags', function (t) {
  mixer(sampleObj, {
    keepBoldEtc: true,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'test text is being <i>set in italic</i> here', elem),
      'test text is being <i>set in italic</i> here',
      'i tag is retained - clean'
    )
    t.is(detergent(
      'test text is being < i >set in italic< /  i > here', elem),
      'test text is being <i>set in italic</i> here',
      'i tag is retained - with spaces'
    )
    t.is(detergent(
      'test text is being < I >set in italic<   I /> here', elem),
      'test text is being <i>set in italic</i> here',
      'i tag is retained - capitalised + wrong slash'
    )
  })
  mixer(sampleObj, {
    keepBoldEtc: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'test text is being <i>set in italic</i> here', elem),
      'test text is being set in italic here',
      'i tag is removed - clean'
    )
    t.is(detergent(
      'test text is being < i >set in italic< /  i > here', elem),
      'test text is being set in italic here',
      'i tag is removed - with spaces'
    )
    t.is(detergent(
      'test text is being < I >set in italic<  I /> here', elem),
      'test text is being set in italic here',
      'i tag is removed - capitalised + wrong slash'
    )
  })
})

test('retaining STRONG tags', function (t) {
  mixer(sampleObj, {
    keepBoldEtc: true,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'test text is being <strong id="main">set in bold</ strong> here', elem),
      'test text is being <strong>set in bold</strong> here',
      'STRONG tag is retained - clean'
    )
    t.is(detergent(
      'test text is being <strong id="main">set in bold<strong/> here', elem),
      'test text is being <strong>set in bold</strong> here',
      'STRONG tag is retained - wrong closing slash'
    )
    t.is(detergent(
      'test text is being < StRoNg >set in bold<StRoNg class="wrong1" / > here', elem),
      'test text is being <strong>set in bold</strong> here',
      'STRONG tag is retained - dirty capitalisation + wrong slash'
    )
  })
  mixer(sampleObj, {
    keepBoldEtc: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'test text is being <strong id="main">set in bold</ strong> here', elem),
      'test text is being set in bold here',
      'STRONG tag is removed - clean'
    )
    t.is(detergent(
      'test text is being <strong id="main">set in bold<strong/> here', elem),
      'test text is being set in bold here',
      'STRONG tag is removed - wrong closing slash'
    )
    t.is(detergent(
      'test text is being < StRoNg >set in bold<StRoNg class="wrong1" / > here', elem),
      'test text is being set in bold here',
      'STRONG tag is removed - dirty capitalisation + wrong slash'
    )
  })
})

test('retaining EM tags', function (t) {
  mixer(sampleObj, {
    keepBoldEtc: true,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'test text is being <em>set in emphasis</em> here', elem),
      'test text is being <em>set in emphasis</em> here',
      'EM tag is retained - clean'
    )
    t.is(detergent(
      'test text is being <em id="main">set in emphasis<em/> here', elem),
      'test text is being <em>set in emphasis</em> here',
      'EM tag is retained - wrong closing slash + some attributes'
    )
    t.is(detergent(
      'test text is being < eM >set in emphasis<  Em  / > here', elem),
      'test text is being <em>set in emphasis</em> here',
      'EM tag is retained - dirty capitalisation + wrong slash'
    )
  })
  mixer(sampleObj, {
    keepBoldEtc: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'test text is being <em>set in emphasis</em> here', elem),
      'test text is being set in emphasis here',
      'EM tag is removed - clean'
    )
    t.is(detergent(
      'test text is being <em id="main">set in emphasis<em/> here', elem),
      'test text is being set in emphasis here',
      'EM tag is removed - wrong closing slash + some attributes'
    )
    t.is(detergent(
      'test text is being < eM >set in emphasis<  Em  / > here', elem),
      'test text is being set in emphasis here',
      'EM tag is removed - dirty capitalisation + wrong closing slash'
    )
  })
})

// ==============================
// o.convertDashes
// ==============================

test('convert dashes into M dashes', function (t) {
  mixer(sampleObj, {
    convertDashes: true,
    removeWidows: false,
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      'some text - some more text', elem),
      'some text &mdash; some more text',
      'converts M dashes with encoding entities: +dashes-widows+entities'
    )
  })
  mixer(sampleObj, {
    convertDashes: true,
    removeWidows: false,
    convertEntities: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'some text - some more text', elem),
      'some text \u2014 some more text',
      'converts M dashes without encoding entities: +dashes-widows-entities'
    )
  })
  mixer(sampleObj, {
    convertDashes: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'some text - some more text', elem),
      'some text - some more text',
      'does not convert M dashes: -dashes-widows'
    )
  })
})

// ==============================
// o.replaceLineBreaks
// ==============================

test('replace \\n line breaks with BR', function (t) {
  mixer(sampleObj, {
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: true,
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      '\n\n\ntralala\ntralala2\n\ntralala3\n\n\ntralala4\n\n\n', elem),
      'tralala<br />\ntralala2<br />\n<br />\ntralala3<br />\n<br />\n<br />\ntralala4',
      'converts line breaks into XHTML BR\'s'
    )
  })
  mixer(sampleObj, {
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: false,
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      '\n\ntralala\ntralala2\n\ntralala3\n\n\ntralala4\n\n\n\n', elem),
      'tralala<br>\ntralala2<br>\n<br>\ntralala3<br>\n<br>\n<br>\ntralala4',
      'converts line breaks into HTML BR\'s'
    )
  })
})

// ==============================
// o.removeLineBreaks
// ==============================

test('replace \\n line breaks with BR', function (t) {
  mixer(sampleObj, {
    removeLineBreaks: true,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      '\n\n\ntralala\ntralala2\ntralala3\n<   bR />\n\ntralala4\n\n\n', elem),
      'tralala tralala2 tralala3 tralala4',
      'strips all line breaks'
    )
  })
})

// ==============================
// o.convertApostrophes
// ==============================

test('convert apostrophes into fancy ones', function (t) {
  mixer(sampleObj, {
    convertApostrophes: true,
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      'test\'s', elem),
      'test&rsquo;s',
      'converts single apostrophes - with entities'
    )
  })
  mixer(sampleObj, {
    convertApostrophes: true,
    convertEntities: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'test\'s', elem),
      'test\u2019s',
      'converts single apostrophes - no entities'
    )
  })
  mixer(sampleObj, {
    convertApostrophes: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'test\'s', elem),
      'test\'s',
      'doesn\'t convert single apostrophes'
    )
  })
})

test('convert double quotes into fancy ones', function (t) {
  mixer(sampleObj, {
    convertApostrophes: true,
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      'this is "citation"', elem),
      'this is &ldquo;citation&rdquo;',
      'converts quotation marks into fancy ones: +entities'
    )
  })
  mixer(sampleObj, {
    convertApostrophes: true,
    convertEntities: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'this is "citation"', elem),
      'this is \u201Ccitation\u201D',
      'converts quotation marks into fancy ones: -entities'
    )
  })
  mixer(sampleObj, {
    convertApostrophes: false,
    convertEntities: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'this is "citation"', elem),
      'this is "citation"',
      'doesn\'t convert quotation marks: -apostrophes-entities'
    )
  })
})

// ==============================
// o.convertDashes
// ==============================

// following tests are according to the Butterick's practical typography
// http://practicaltypography.com/hyphens-and-dashes.html

// N dash - use case #1
test('converts dashes', function (t) {
  mixer(sampleObj, {
    convertDashes: true,
    convertEntities: true,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      '1880-1912, pages 330-39', elem),
      '1880&ndash;1912, pages 330&ndash;39',
      'converts dashes into N dashes: +dashes+entities-widows'
    )
  })
  mixer(sampleObj, {
    convertDashes: true,
    convertEntities: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      '1880-1912, pages 330-39', elem),
      '1880\u20131912, pages 330\u201339',
      'converts dashes into N dashes: +dashes-entities-widows'
    )
  })
  mixer(sampleObj, {
    convertDashes: false,
    removeWidows: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      '1880-1912, pages 330-39', elem),
      '1880-1912, pages 330-39',
      'doesn\'t convert N dashes when is not asked to: -dashes-widows'
    )
  })
})

// ==============================
// o.dontEncodeNonLatin
// ==============================

test('doesn\'t encode non-Latin', function (t) {
  mixer(sampleObj, {
    dontEncodeNonLatin: true,
    convertEntities: true,
    removeWidows: false,
    replaceLineBreaks: false,
    removeLineBreaks: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'Greek: \u03A1\u03CC\u03B9\u03C3\u03C4\u03BF\u03BD \u03AE\u03C4\u03B1\u03BD \u03B5\u03B4\u03CE\nRussian: \u0420\u043E\u0438\u0441\u0442\u043E\u043D\nJapanese: \u30ED\u30A4\u30B9\u30C8\u30F3\nChinese: \u7F85\u4F0A\u65AF\u9813\nHebrew: \u05E8\u05D5\u05D9\u05E1\u05D8\u05D5\u05DF\nArabic: \u0631\u0648\u064A\u0633\u062A\u0648\u0646', elem),

      'Greek: \u03A1\u03CC\u03B9\u03C3\u03C4\u03BF\u03BD \u03AE\u03C4\u03B1\u03BD \u03B5\u03B4\u03CE\nRussian: \u0420\u043E\u0438\u0441\u0442\u043E\u043D\nJapanese: \u30ED\u30A4\u30B9\u30C8\u30F3\nChinese: \u7F85\u4F0A\u65AF\u9813\nHebrew: \u05E8\u05D5\u05D9\u05E1\u05D8\u05D5\u05DF\nArabic: \u0631\u0648\u064A\u0633\u062A\u0648\u0646',
      'doesn\'t convert non-latin characters'
    )
  })
})

// ==============================
// checking all numeric entities encoded in hyphens-and-dashes
// such as, for example, &#118; or &#39; - range 0-255
// ==============================

test('numeric entities', function (t) {
  t.is(detergent(
    'aaaaaaa aaaaaaaaa aaaaaaaaaa&#160;bbbb'),
    'aaaaaaa aaaaaaaaa aaaaaaaaaa&nbsp;bbbb',
    'numeric entities'
  )
  t.is(detergent(
    'aaaaaaa aaaaaaaaa aaaaaaaaaa&nbsp;bbbb'),
    'aaaaaaa aaaaaaaaa aaaaaaaaaa&nbsp;bbbb',
    'named entities'
  )
  t.is(detergent(
    'aaaaaaa aaaaaaaaa aaaaaaaaa\xa0bbbb'),
    'aaaaaaa aaaaaaaaa aaaaaaaaa&nbsp;bbbb',
    'non-encoded entities'
  )
})

// ==============================
// detecting partial named entities
// ==============================

test('partial entity references', function (t) {
  // no mixer — it's rudimentary conversion, no need to bloat test suite
  for (var i = 0, len = entityRefs.length; i < len; i++) {
    t.is(detergent(
      '&' + entityRefs[i]),
      '&' + entityRefs[i] + ';',
      'partial named refs: #1.' + i + ': &' + entityRefs[i]
    )
  }
})

// ==============================
// Clearly errors
// ==============================

test('multiple lines & obvious errors in the text', function (t) {
  mixer(sampleObj, {
    removeWidows: false,
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      '\u000a Very long line, long-enough to trigger widow removal . \u000a\n Text . ', elem),
      'Very long line, long-enough to trigger widow removal.<br />\n<br />\nText.',
      'no.1 - space - full stop'
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
    t.is(detergent(
      '\u000a Very long line, long-enough to trigger widow removal . \u000a\n Text . ', elem),
      'Very long line, long-enough to trigger widow&nbsp;removal.<br />\n<br />\nText.',
      'no.2 - space - full stop'
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
    t.is(detergent(
      '\u000a Very long line, long-enough to trigger widow removal . \u000a\n Text . ', elem),
      'Very long line, long-enough to trigger widow\xa0removal.<br />\n<br />\nText.',
      'no.3 - space - full stop'
    )
  })

  mixer(sampleObj, {
    removeWidows: false,
    replaceLineBreaks: false,
    removeLineBreaks: false,
    useXHTML: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      '\u000a Very long line, long-enough to trigger widow removal . \u000a\n Text . ', elem),
      'Very long line, long-enough to trigger widow removal.\n\nText.',
      'no.4 - space - full stop'
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
    t.is(detergent(
      '\u000a Very long line, long-enough to trigger widow removal . \u000a\n Text . ', elem),
      'Very long line, long-enough to trigger widow&nbsp;removal.\n\nText.',
      'no.5 - space - full stop'
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
    t.is(detergent(
      '\u000a Very long line, long-enough to trigger widow removal . \u000a\n Text . ', elem),
      'Very long line, long-enough to trigger widow\xa0removal.\n\nText.',
      'no.6 - space - full stop'
    )
  })

  mixer(sampleObj, {
    removeWidows: false,
    replaceLineBreaks: true,
    removeLineBreaks: false,
    useXHTML: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      '\u000a Very long line, long-enough to trigger widow removal . \u000a\n Text . ', elem),
      'Very long line, long-enough to trigger widow removal.<br>\n<br>\nText.',
      'no.7 - space - full stop'
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
    t.is(detergent(
      '\u000a Very long line, long-enough to trigger widow removal . \u000a\n Text . ', elem),
      'Very long line, long-enough to trigger widow&nbsp;removal.<br>\n<br>\nText.',
      'no.8 - space - full stop'
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
    t.is(detergent(
      '\u000a Very long line, long-enough to trigger widow removal . \u000a\n Text . ', elem),
      'Very long line, long-enough to trigger widow\xa0removal.<br>\n<br>\nText.',
      'no.9 - space - full stop'
    )
  })

  mixer(sampleObj, {
    removeWidows: false,
    removeLineBreaks: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      ' \u000a    Very long line, long-enough to trigger widow removal   \n\n. \u000a\n Text text text text . ', elem),
      'Very long line, long-enough to trigger widow removal. Text text text text.',
      'no.10 - space - full stop'
    )
  })
  mixer(sampleObj, {
    removeWidows: true,
    convertEntities: true,
    removeLineBreaks: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      ' \u000a    Very long line, long-enough to trigger widow removal .  \n \n \u000a\n Text text text text . ', elem),
      'Very long line, long-enough to trigger widow removal. Text text text&nbsp;text.',
      'no.11 - space - full stop'
    )
  })
  mixer(sampleObj, {
    removeWidows: true,
    convertEntities: false,
    removeLineBreaks: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      ' \u000a   Very long line, long-enough to trigger widow removal .  \n \n  \u000a\n Text text text text . ', elem),
      'Very long line, long-enough to trigger widow removal. Text text text\xa0text.',
      'no.12 - space - full stop'
    )
  })

  t.is(detergent(
    'a. \na'),
    'a.<br />\na',
    'full stop - space - line break'
  )
  t.is(detergent(
    'a . \na'),
    'a.<br />\na',
    'space - full stop - space - line break'
  )
  t.is(detergent(
    'a , \na'),
    'a,<br />\na',
    'space - comma - space - line break'
  )
})

// ==============================
// multiple spaces before comma or full stop
// ==============================

test('multiple spaces before comma/full stop', function (t) {
  // mixer no.1 — no widows removal
  mixer(sampleObj, {
    removeWidows: false
  })
  .forEach(function (elem) {
    // comma
    t.is(detergent(
      'some text text text text            ,text  ', elem),
      'some text text text text, text',
      '#1 - multiple spaces, comma, no space, text, spaces'
    )
    t.is(detergent(
      'some text text text text            ,text', elem),
      'some text text text text, text',
      '#2 - multiple spaces, comma, no space, text, no spaces'
    )
    t.is(detergent(
      'some text text text text            ,', elem),
      'some text text text text,',
      '#3 - multiple spaces, comma, string\'s end'
    )
    t.is(detergent(
      'lots of text to trigger widow removal 2,5 here', elem),
      'lots of text to trigger widow removal 2,5 here',
      '#4 - alternative decimal notation'
    )
    // full stop
    t.is(detergent(
      'some text text text text            .text  ', elem),
      'some text text text text. text',
      '#5 - multiple spaces, comma, no space, text, spaces'
    )
    t.is(detergent(
      'some text text text text            .text', elem),
      'some text text text text. text',
      '#6 - multiple spaces, comma, no space, text, no spaces'
    )
    t.is(detergent(
      'some text text text text            .', elem),
      'some text text text text.',
      '#7 - multiple spaces, comma, string\'s end'
    )
    t.is(detergent(
      'lots of text to trigger widow removal 2.5 here', elem),
      'lots of text to trigger widow removal 2.5 here',
      '#8 - alternative decimal notation'
    )
  })

  // mixer no.2 — widows removal
  mixer(sampleObj, {
    removeWidows: true,
    convertEntities: true
  })
  .forEach(function (elem) {
    // comma
    t.is(detergent(
      'some text text text text            ,text  ', elem),
      'some text text text text,&nbsp;text',
      '#9 - multiple spaces, comma, no space, text, spaces'
    )
    t.is(detergent(
      'some text text text text            ,text', elem),
      'some text text text text,&nbsp;text',
      '#10 - multiple spaces, comma, no space, text, no spaces'
    )
    t.is(detergent(
      'some text text text text            ,', elem),
      'some text text text&nbsp;text,',
      '#11 - multiple spaces, comma, string\'s end'
    )
    t.is(detergent(
      'lots of text to trigger widow removal 2,5 here', elem),
      'lots of text to trigger widow removal 2,5&nbsp;here',
      '#12 - alternative decimal notation'
    )
    // full stop
    t.is(detergent(
      'some text text text text            .text  ', elem),
      'some text text text text.&nbsp;text',
      '#13 - multiple spaces, comma, no space, text, spaces'
    )
    t.is(detergent(
      'some text text text text            .text', elem),
      'some text text text text.&nbsp;text',
      '#14 - multiple spaces, comma, no space, text, no spaces'
    )
    t.is(detergent(
      'some text text text text            .', elem),
      'some text text text&nbsp;text.',
      '#15 - multiple spaces, comma, string\'s end'
    )
    t.is(detergent(
      'lots of text to trigger widow removal 2.5 here', elem),
      'lots of text to trigger widow removal 2.5&nbsp;here',
      '#16 - alternative decimal notation'
    )
  })
})

// ==============================
// m dash sanity check
// ==============================

test('m dash sanity check', function (t) {
  mixer(sampleObj, {
    convertEntities: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      'm—m', elem),
      'm—m',
      'leaves the m dashes alone'
    )
  })
})

// ==============================
// (horizontal) ellipsis sanity check
// ==============================

test('m dash sanity check', function (t) {
  mixer(sampleObj, {
    convertEntities: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      '\u2026', elem),
      '\u2026',
      'leaves the ellipsis alone when it has to (unencoded)'
    )
    t.is(detergent(
      '&hellip;', elem),
      '\u2026',
      'leaves the ellipsis alone when it has to (hellip)'
    )
    t.is(detergent(
      '&mldr;', elem),
      '\u2026',
      'leaves the ellipsis alone when it has to (mldr)'
    )
  })
  mixer(sampleObj, {
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      '\u2026', elem),
      '&hellip;',
      'encodes the ellipsis when it has to (unencoded)'
    )
    t.is(detergent(
      '&hellip;', elem),
      '&hellip;',
      'encodes the ellipsis when it has to (hellip)'
    )
    t.is(detergent(
      '&mldr;', elem),
      '&hellip;',
      'encodes the ellipsis when it has to (mldr)'
    )
  })
})

// =======================================
// three dots converted to ellipsis symbol
// =======================================

test('ellipsis from full stops', function (t) {
  mixer(sampleObj, {
    convertEntities: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      '...', elem),
      '\u2026',
      'converts three full stops to unencoded ellipsis'
    )
  })
  mixer(sampleObj, {
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      '...', elem),
      '&hellip;',
      'converts three full stops to encoded ellipsis'
    )
  })
})

// ============================================================================
// some HTML entitities can't be sent in named entities format, only in numeric
// ============================================================================

test('ellipsis from full stops', function (t) {
  mixer(sampleObj, {
    convertEntities: true
  })
  .forEach(function (elem) {
    t.is(detergent(
      '&Breve;', elem),
      '&#x2D8;',
      'HTML entity — Breve'
    )
    t.is(detergent(
      '&Backslash;', elem),
      '&#x2216;',
      'HTML entity — Backslash'
    )
    t.is(detergent(
      '&Cacute;', elem),
      '&#x106;',
      'HTML entity — Cacute'
    )
    t.is(detergent(
      '&CircleDot;', elem),
      '&#x2299;',
      'HTML entity — CircleDot'
    )
    t.is(detergent(
      '&DD;', elem),
      '&#x2145;',
      'HTML entity — DD'
    )
    t.is(detergent(
      '&Diamond;', elem),
      '&#x22C4;',
      'HTML entity — Diamond'
    )
    t.is(detergent(
      '&DownArrow;', elem),
      '&darr;',
      'HTML entity — DownArrow'
    )
    t.is(detergent(
      '&LT;', elem),
      '&lt;',
      'HTML entity — LT'
    )
    t.is(detergent(
      '&RightArrow;', elem),
      '&rarr;',
      'HTML entity — RightArrow'
    )
    t.is(detergent(
      '&SmallCircle;', elem),
      '&#x2218;',
      'HTML entity — SmallCircle'
    )
    t.is(detergent(
      '&Uarr;', elem),
      '&#x219F;',
      'HTML entity — Uarr'
    )
    t.is(detergent(
      '&Verbar;', elem),
      '&#x2016;',
      'HTML entity — Verbar'
    )
    t.is(detergent(
      '&angst;', elem),
      '&#xC5;',
      'HTML entity — angst'
    )
    t.is(detergent(
      '&zdot;', elem),
      '&#x17C;',
      'HTML entity — zdot'
    )
  })
})

test('wrong named entity QUOT into quot', function (t) {
  mixer(sampleObj, {
    convertEntities: true,
    convertApostrophes: false
  })
  .forEach(function (elem) {
    t.is(detergent(
      '&QUOT;', elem),
      '&quot;',
      'HTML entity — QUOT'
    )
  })
})
