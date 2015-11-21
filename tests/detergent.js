'use strict';

var test = require('tape');
var detergent = require('../detergent.js');
var mixer = require('../mixer.js');
var hashCharEncoding = require('./hash-char-encoding.json');

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
};

// ==============================
// INVISIBLES
// ==============================

// var all settings combinations with removeWidows=true/false overrides
var allCombinations = mixer(sampleObj);
//console.log('\n\n all combinations'+allCombinations+'\n\n');

test('invisibles being removed', function (t) {
    t.equal(detergent('\u0000\u0001\u0002\u0004\u0005\u0006\u0007\u0008\u000E\u000F\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017\u0018\u0019\u001A\u001B\u001C\u001D\u001E\u001F\u007F\u0080\u0081\u0082\u0083\u0084\u0086\u0087\u0088\u0089\u008A\u008B\u008C\u008D\u008E\u008F\u0090\u0091\u0092\u0093\u0094\u0095\u0096\u0097\u0098\u0099\u009A\u009B\u009C\u009D\u009E\u009F'), '');
  t.end();
});

test('invisible line breaks replaced', function (t) {
  mixer(sampleObj, {
      replaceLineBreaks: false,
      removeLineBreaks: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      'a\u000Ab\u000Bc\u000C\u000D\u2028\u2029\u0003d', elem),
      'a\nb\nc\n\n\n\n\nd',
      'unencoded invisible breaks into \\n\'s'
    );
    t.equal(detergent(
      'a&#10;b&#11;c&#12;&#13;&#8232;&#8233;&#3;d', elem),
      'a\nb\nc\n\n\n\n\nd',
      'encoded invisible breaks into \\n\'s'
    );
  });

  mixer(sampleObj, {
      removeLineBreaks: true
    })
  .forEach(function (elem){
    t.equal(detergent(
      'a\u000Bb\u000C\u000D\u0085c\u2028\u2029d', elem),
      'abcd',
      'invisible breaks and remove all line breaks on'
    );
  });

  mixer(sampleObj, {
      replaceLineBreaks: true,
      removeLineBreaks: false,
      useXHTML: true
    })
  .forEach(function (elem){
    t.equal(detergent(
      'a\u000Ab\u000Bc\u000C\u000D\u0085\u2028\u2029d', elem),
      'a<br />b<br />c<br /><br /><br /><br /><br />d',
      'replace breaks into XHTML BR\'s'
    );
  });

  mixer(sampleObj, {
      replaceLineBreaks: true,
      removeLineBreaks: false,
      useXHTML: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      'a\u000Ab\u000Bc\u000C\u000D\u0085\u2028\u2029d', elem),
      'a<br>b<br>c<br><br><br><br><br>d',
      'replace breaks into HTML BR\'s'
    );
  });
  t.end();
});

// ==============================
// o.removeSoftHyphens
// ==============================

test('removing soft hyphens', function (t) {
  mixer(sampleObj, {
      removeSoftHyphens: true
    })
  .forEach(function (elem){
    t.equal(detergent(
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\u00ADbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', elem),
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      'remove soft hyphens'
    );
  });
  mixer(sampleObj, {
      convertEntities: false,
      removeSoftHyphens: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\u00ADbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', elem),
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\u00ADbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      'don\'t remove soft hyphens, but don\'t encode either'
    );
  });
  mixer(sampleObj, {
      convertEntities: true,
      removeSoftHyphens: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\u00ADbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', elem),
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&shy;bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      'don\'t remove soft hyphens, encode into &shy'
    );
  });
  t.end();
});

// ==============================
// strip the HTML
// ==============================

test('strip HTML', function (t) {
  mixer(sampleObj, {
      removeWidows: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      'text <a href="#">text</a> text', elem),
      'text text text',
      'strip the HTML'
    );
  });
  t.end();
});

// ==============================
// o.convertEntities
// ==============================

test('encode entities - pound sign', function (t) {
  mixer(sampleObj, {
    convertEntities: true
    })
  .forEach(function (elem){
    t.equal(detergent(
      '\u00A3', elem),
      '&pound;',
      'pound char converted into entity'
    );
  });
  mixer(sampleObj, {
    convertEntities: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      '\u00A3', elem),
      '\u00A3',
      'pound char not converted into entity'
    );
  });
  t.end();
});

test('encode entities - m-dash', function (t) {
  mixer(sampleObj, {
    convertEntities: true
    })
  .forEach(function (elem){
    t.equal(detergent(
      '\u2014', elem),
      '&mdash;',
      'M dash char encoded into entity'
    );
  });
  mixer(sampleObj, {
    convertEntities: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      '\u2014', elem),
      '\u2014',
      'M dash char not converted into entity'
    );
  });
  t.end();
});

test('encode entities - tetragram for centre', function (t) {
  mixer(sampleObj, {
    convertEntities: true
    })
  .forEach(function (elem){
    t.equal(detergent(
      '\uD834\uDF06', elem),
      '&#x1D306;',
      'trigram char converted into entity'
    );
  });
  mixer(sampleObj, {
    convertEntities: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      '\uD834\uDF06', elem),
      '\uD834\uDF06',
      'trigram char not converted into entity'
    );
  });
  t.end();
});

test('encode entities - one more paired surrogate', function (t) {
  mixer(sampleObj, {
    convertEntities: true
    })
  .forEach(function (elem){
    t.equal(detergent(
      '\uD83D\uDE0A', elem),
      '&#x1F60A;',
      'paired surrogate is kept and encoded'
    );
  });
  mixer(sampleObj, {
    convertEntities: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      '\uD83D\uDE0A', elem),
      '\uD83D\uDE0A',
      'paired surrogate is kept and not encoded'
    );
  });
t.end();
});

test('contingency - stray unpaired surrogates', function (t) {
  allCombinations.forEach(function (elem){
    t.equal(detergent(
      '\uFFFDa\uD800a\uD83Da\uDBFF', elem),
      'aaa',
      'stray low surrogates are deleted');
  });
  allCombinations.forEach(function (elem){
    t.equal(detergent(
      '\uDC00a\uDE0Aa\uDFFF', elem),
      'aa',
      'stray high surrogates are deleted');
  });
  t.end();
});


test('encode entities - gr\u00F6\u00DFer', function (t) {
  mixer(sampleObj, {
    convertEntities: true
    })
  .forEach(function (elem){
    t.equal(detergent(
      'gr\u00F6\u00DFer', elem),
      'gr&ouml;&szlig;er',
      'German entities encoded'
    );
  });
  mixer(sampleObj, {
    convertEntities: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      'gr\u00F6\u00DFer', elem),
      'gr\u00F6\u00DFer',
      'German entities not encoded'
    );
  });
  t.end();
});

// ==============================
// o.removeWidows
// ==============================

test('remove widows true + encoding - one line string', function (t) {
  mixer(sampleObj, {
      removeWidows: true,
      convertEntities: true
    })
  .forEach(function (elem){
    t.equal(detergent(
      'aaa bbb ccc ddd', elem),
      'aaa bbb ccc&nbsp;ddd',
      'remove widows - entities, one line string no full stop'
    );
    t.equal(detergent(
      'aaa bbb ccc ddd.', elem),
      'aaa bbb ccc&nbsp;ddd.',
      'remove widows - entities, one line string with full stop'
    );
  });
  t.end();
});

test('remove widows true + no encoding - one line string', function (t) {
  mixer(sampleObj, {
      removeWidows: true,
      convertEntities: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      'aaa bbb ccc ddd', elem),
      'aaa bbb ccc\xa0ddd',
      'remove widows - no entities, one line string no full stop'
    );
    t.equal(detergent(
      'aaa bbb ccc ddd.', elem),
      'aaa bbb ccc\xa0ddd.',
      'remove widows - no entities, one line string with full stop'
    );
  });
  t.end();
});

test('remove widows false - one line string', function (t) {
  mixer(sampleObj, {
      removeWidows: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      'aaa bbb ccc ddd', elem),
      'aaa bbb ccc ddd',
      'don\'t remove widows - no full stop'
    );
    t.equal(detergent(
      'aaa bbb ccc ddd.', elem),
      'aaa bbb ccc ddd.',
      'don\'t remove widows - ending with full stop'
    );
  });
  t.end();
});

test('remove widows - two BRs 1', function (t) {
  mixer(sampleObj, {
      removeWidows: true,
      convertEntities: true,
      replaceLineBreaks: true,
      removeLineBreaks: false,
      useXHTML: true
    })
  .forEach(function (elem){
    t.equal(detergent(
      'aaa bbb ccc ddd\n\neee fff ggg hhh', elem),
      'aaa bbb ccc&nbsp;ddd<br /><br />eee fff ggg&nbsp;hhh',
      'remove widows - two line breaks with encoding BR in XHTML'
    );
  });
  t.end();
});
test('remove widows - two BRs 2', function (t) {
  mixer(sampleObj, {
      removeWidows: true,
      convertEntities: true,
      replaceLineBreaks: true,
      removeLineBreaks: false,
      useXHTML: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      'aaa bbb ccc ddd\n\neee fff ggg hhh', elem),
      'aaa bbb ccc&nbsp;ddd<br><br>eee fff ggg&nbsp;hhh',
      'two BR\'s, widows with NBSP and HTML BR'
    );
  });
  t.end();
});
test('remove widows - two BRs 3', function (t) {
  mixer(sampleObj, {
      removeWidows: true,
      convertEntities: true,
      replaceLineBreaks: false,
      removeLineBreaks: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      'aaa bbb ccc ddd\n\neee fff ggg hhh', elem),
      'aaa bbb ccc&nbsp;ddd\n\neee fff ggg&nbsp;hhh',
      'two BR\'s, widows replaced with &nbsp'
    );
  });
  t.end();
});
test('remove widows - two BRs 4', function (t) {
  mixer(sampleObj, {
      removeWidows: true,
      convertEntities: false,
      replaceLineBreaks: false,
      removeLineBreaks: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      'aaa bbb ccc ddd\n\neee fff ggg hhh', elem),
      'aaa bbb ccc\u00A0ddd\n\neee fff ggg\u00A0hhh',
      'two BR\'s, widows replaced with non-encoded NBSP'
    );
  });
  t.end();
});
test('remove widows - one BR', function (t) {
  mixer(sampleObj, {
      removeWidows: true,
      convertEntities: true,
      replaceLineBreaks: false,
      removeLineBreaks: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      'aaa bbb ccc ddd\neee fff ggg hhh.', elem),
      'aaa bbb ccc ddd\neee fff ggg&nbsp;hhh.',
      'one line break, no full stop - no widow fix needed'
    );
    t.equal(detergent(
      'aaa bbb ccc ddd.\neee fff ggg hhh.', elem),
      'aaa bbb ccc&nbsp;ddd.\neee fff ggg&nbsp;hhh.',
      'one line break, with full stop - widow fix needed'
    );
  });
  t.end();
});


// TODO: widows with trailing white space before last full stop

// ==============================
// testing defaults
// ==============================

test('default set - \\n replacement with BR', function (t) {
  t.equal(detergent(
    'aaa\n\nbbb\n\nccc'),
    'aaa<br /><br />bbb<br /><br />ccc',
    '\\n type replaced with <br />');
  t.end();
});

test('default set - HTML BR replacement with XHTML BR', function (t) {
  t.equal(detergent(
    'aaa<br>bbb<br>ccc'),
    'aaa<br />bbb<br />ccc',
    '<br> replaced with <br />');
  t.end();
});

test('default set - dirty BRs', function (t) {
  t.equal(detergent(
    'aaa<BR />< BR>bbb< BR ><BR>ccc< br >< Br>ddd'),
    'aaa<br /><br />bbb<br /><br />ccc<br /><br />ddd',
    'various dirty BRs replaced with <br />');
  t.end();
});

// ==============================
// testing rubbish removal
// ==============================

test('strip front/back spaces', function (t) {
  allCombinations.forEach(function (elem){
    t.equal(detergent(
      '\n\n \t     aaaaaa   \n\t\t  ', elem),
      'aaaaaa');
  });
  t.end();
},'front & back spaces stripped');

test('strip middle space clusters', function (t) {
  allCombinations.forEach(function (elem){
    t.equal(detergent('aaaaaa     bbbbbb', elem), 'aaaaaa bbbbbb');
  });
  t.end();
},'redundant space between words');

// ==============================
// testing ETX removal
// ==============================

test('replace all ETX symbols with BR', function (t) {
  mixer(sampleObj, {
      removeLineBreaks: false,
      replaceLineBreaks: true,
      useXHTML: true
    })
  .forEach(function (elem){
    t.equal(detergent(
      'first\u0003second', elem),
      'first<br />second',
      'replaces ETX with XHTML BR'
    );
  });
  mixer(sampleObj, {
      removeLineBreaks: false,
      replaceLineBreaks: true,
      useXHTML: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      'first\u0003second', elem),
      'first<br>second',
      'replaces ETX with HTML BR'
    );
  });
  mixer(sampleObj, {
      removeLineBreaks: false,
      replaceLineBreaks: false,
      useXHTML: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      'first\u0003second', elem),
      'first\nsecond',
      'replaces ETX with \\n'
    );
  });
  t.end();
});

// ==============================
// o.keepBoldEtc
// ==============================

test('retaining b tags', function (t) {
  mixer(sampleObj, {
      keepBoldEtc: true,
      removeWidows: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      'test text is being <b class="test" id="br">set in bold</b> here', elem),
      'test text is being <b>set in bold</b> here',
      'B tag is retained - clean'
    );
    t.equal(detergent(
      'test text is being < b tralala >set in bold< /  b > here', elem),
      'test text is being <b>set in bold</b> here',
      'B tag is retained - with spaces'
    );
    t.equal(detergent(
      'test text is being < B >set in bold< B /> here', elem),
      'test text is being <b>set in bold</b> here',
      'B tag is retained - capitalised + wrong slash'
    );
  });
  mixer(sampleObj, {
      keepBoldEtc: false,
      removeWidows: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      'test text is being <b>set in bold</b> here', elem),
      'test text is being set in bold here',
      'B tag is removed - clean'
    );
    t.equal(detergent(
      'test text is being < b >set in bold< /  b > here', elem),
      'test text is being set in bold here',
      'B tag is removed - with spaces'
    );
    t.equal(detergent(
      'test text is being < B >set in bold<   B / > here', elem),
      'test text is being set in bold here',
      'B tag is removed - capitalised + wrong slash'
    );
  });
  t.end();
});

test('retaining i tags', function (t) {
  mixer(sampleObj, {
      keepBoldEtc: true,
      removeWidows: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      'test text is being <i>set in italic</i> here', elem),
      'test text is being <i>set in italic</i> here',
      'i tag is retained - clean'
    );
    t.equal(detergent(
      'test text is being < i >set in italic< /  i > here', elem),
      'test text is being <i>set in italic</i> here',
      'i tag is retained - with spaces'
    );
    t.equal(detergent(
      'test text is being < I >set in italic<   I /> here', elem),
      'test text is being <i>set in italic</i> here',
      'i tag is retained - capitalised + wrong slash'
    );
  });
  mixer(sampleObj, {
      keepBoldEtc: false,
      removeWidows: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      'test text is being <i>set in italic</i> here', elem),
      'test text is being set in italic here',
      'i tag is removed - clean'
    );
    t.equal(detergent(
      'test text is being < i >set in italic< /  i > here', elem),
      'test text is being set in italic here',
      'i tag is removed - with spaces'
    );
    t.equal(detergent(
      'test text is being < I >set in italic<  I /> here', elem),
      'test text is being set in italic here',
      'i tag is removed - capitalised + wrong slash'
    );
  });
  t.end();
});

test('retaining STRONG tags', function (t) {
  mixer(sampleObj, {
      keepBoldEtc: true,
      removeWidows: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      'test text is being <strong id="main">set in bold</ strong> here', elem),
      'test text is being <strong>set in bold</strong> here',
      'STRONG tag is retained - clean'
    );
    t.equal(detergent(
      'test text is being <strong id="main">set in bold<strong/> here', elem),
      'test text is being <strong>set in bold</strong> here',
      'STRONG tag is retained - wrong closing slash'
    );
    t.equal(detergent(
      'test text is being < StRoNg >set in bold<StRoNg class="wrong1" / > here', elem),
      'test text is being <strong>set in bold</strong> here',
      'STRONG tag is retained - dirty capitalisation + wrong slash'
    );
  });
  mixer(sampleObj, {
      keepBoldEtc: false,
      removeWidows: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      'test text is being <strong id="main">set in bold</ strong> here', elem),
      'test text is being set in bold here',
      'STRONG tag is removed - clean'
    );
    t.equal(detergent(
      'test text is being <strong id="main">set in bold<strong/> here', elem),
      'test text is being set in bold here',
      'STRONG tag is removed - wrong closing slash'
    );
    t.equal(detergent(
      'test text is being < StRoNg >set in bold<StRoNg class="wrong1" / > here', elem),
      'test text is being set in bold here',
      'STRONG tag is removed - dirty capitalisation + wrong slash'
    );
  });
  t.end();
});

test('retaining EM tags', function (t) {
  mixer(sampleObj, {
      keepBoldEtc: true,
      removeWidows: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      'test text is being <em>set in emphasis</em> here', elem),
      'test text is being <em>set in emphasis</em> here',
      'EM tag is retained - clean'
    );
    t.equal(detergent(
      'test text is being <em id="main">set in emphasis<em/> here', elem),
      'test text is being <em>set in emphasis</em> here',
      'EM tag is retained - wrong closing slash + some attributes'
    );
    t.equal(detergent(
      'test text is being < eM >set in emphasis<  Em  / > here', elem),
      'test text is being <em>set in emphasis</em> here',
      'EM tag is retained - dirty capitalisation + wrong slash'
    );
  });
  mixer(sampleObj, {
      keepBoldEtc: false,
      removeWidows: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      'test text is being <em>set in emphasis</em> here', elem),
      'test text is being set in emphasis here',
      'EM tag is removed - clean'
    );
    t.equal(detergent(
      'test text is being <em id="main">set in emphasis<em/> here', elem),
      'test text is being set in emphasis here',
      'EM tag is removed - wrong closing slash + some attributes'
    );
    t.equal(detergent(
      'test text is being < eM >set in emphasis<  Em  / > here', elem),
      'test text is being set in emphasis here',
      'EM tag is removed - dirty capitalisation + wrong closing slash'
    );
  });
  t.end();
});

// ==============================
// o.convertDashes
// ==============================

test('convert dashes into M dashes', function (t) {
  mixer(sampleObj, {
      convertDashes: true,
      removeWidows: false,
      convertEntities: true
    })
  .forEach(function (elem){
    t.equal(detergent(
      'some text - some more text', elem),
      'some text&nbsp;&mdash; some more text',
      'converts M dashes with encoding entities'
    );
  });
  mixer(sampleObj, {
      convertDashes: true,
      removeWidows: false,
      convertEntities: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      'some text - some more text', elem),
      'some text\u00A0\u2014 some more text',
      'converts M dashes without encoding entities'
    );
  });
  mixer(sampleObj, {
      convertDashes: false,
      removeWidows: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      'some text - some more text', elem),
      'some text - some more text',
      'does not convert M dashes'
    );
  });
  t.end();
});

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
  .forEach(function (elem){
    t.equal(detergent(
      '\n\n\ntralala\ntralala2\n\ntralala3\n\n\ntralala4\n\n\n', elem),
      'tralala<br />tralala2<br /><br />tralala3<br /><br /><br />tralala4',
      'converts line breaks into XHTML BR\'s'
    );
  });
  mixer(sampleObj, {
      replaceLineBreaks: true,
      removeLineBreaks: false,
      useXHTML: false,
      convertEntities: true
    })
  .forEach(function (elem){
    t.equal(detergent(
      '\n\ntralala\ntralala2\n\ntralala3\n\n\ntralala4\n\n\n\n', elem),
      'tralala<br>tralala2<br><br>tralala3<br><br><br>tralala4',
      'converts line breaks into HTML BR\'s'
    );
  });
  t.end();
});

// ==============================
// o.removeLineBreaks
// ==============================

test('replace \\n line breaks with BR', function (t) {
  mixer(sampleObj, {
      removeLineBreaks: true,
      removeWidows: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      '\n\n\ntralala\ntralala2\ntralala3\n<   bR />\n\ntralala4\n\n\n', elem),
      'tralala tralala2 tralala3 tralala4',
      'strips all line breaks'
    );
  });
  t.end();
});

// ==============================
// o.convertApostrophes
// ==============================

test('convert apostrophes into fancy ones', function (t) {
  mixer(sampleObj, {
      convertApostrophes: true,
      convertEntities: true
    })
  .forEach(function (elem){
    t.equal(detergent(
      'test\'s', elem),
      'test&rsquo;s',
      'converts single apostrophes - with entities'
    );
  });
  mixer(sampleObj, {
      convertApostrophes: true,
      convertEntities: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      'test\'s', elem),
      'test\u2019s',
      'converts single apostrophes - no entities'
    );
  });
  mixer(sampleObj, {
      convertApostrophes: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      'test\'s', elem),
      'test\'s',
      'doesn\'t convert single apostrophes'
    );
  });
  t.end();
});

test('convert double quotes into fancy ones', function (t) {
  mixer(sampleObj, {
      convertApostrophes: true,
      convertEntities: true
    })
  .forEach(function (elem){
    t.equal(detergent(
      'this is "citation"', elem),
      'this is &ldquo;citation&rdquo;',
      'converts quotation marks into fancy ones - with entities'
    );
  });
  mixer(sampleObj, {
      convertApostrophes: true,
      convertEntities: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      'this is "citation"', elem),
      'this is \u201Ccitation\u201D',
      'converts quotation marks into fancy ones - no entities'
    );
  });
  mixer(sampleObj, {
      convertApostrophes: false,
      convertEntities: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      'this is "citation"', elem),
      'this is "citation"',
      'doesn\'t convert quotation marks'
    );
  });
  t.end();
});

// ==============================
// o.convertDashes
// ==============================

// following tests are according to the Butterick's practical typography
// http://practicaltypography.com/hyphens-and-dashes.html

// N dash - use case #1
test('convert dashes', function (t) {
  mixer(sampleObj, {
      convertDashes: true,
      convertEntities: true,
      removeWidows: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      '1880-1912, pages 330-39', elem),
      '1880&ndash;1912, pages 330&ndash;39',
      'converts dashes into N dashes - with entities'
    );
  });
  mixer(sampleObj, {
      convertDashes: true,
      convertEntities: false,
      removeWidows: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      '1880-1912, pages 330-39', elem),
      '1880\u20131912, pages 330\u201339',
      'converts dashes into N dashes - without entities'
    );
  });
  mixer(sampleObj, {
      convertDashes: false,
      removeWidows: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      '1880-1912, pages 330-39', elem),
      '1880-1912, pages 330-39',
      'doesn\'t convert N dashes when is not asked to'
    );
  });
  t.end();
});

// ==============================
// o.dontEncodeNonLatin
// ==============================

test('convert dashes', function (t) {
  mixer(sampleObj, {
      dontEncodeNonLatin: true,
      convertEntities: true,
      removeWidows: false,
      replaceLineBreaks: false,
      removeLineBreaks: false
    })
  .forEach(function (elem){
    t.equal(detergent(
      'Greek: \u03A1\u03CC\u03B9\u03C3\u03C4\u03BF\u03BD \u03AE\u03C4\u03B1\u03BD \u03B5\u03B4\u03CE\nRussian: \u0420\u043E\u0438\u0441\u0442\u043E\u043D\nJapanese: \u30ED\u30A4\u30B9\u30C8\u30F3\nChinese: \u7F85\u4F0A\u65AF\u9813\nHebrew: \u05E8\u05D5\u05D9\u05E1\u05D8\u05D5\u05DF\nArabic: \u0631\u0648\u064A\u0633\u062A\u0648\u0646', elem),

      'Greek: \u03A1\u03CC\u03B9\u03C3\u03C4\u03BF\u03BD \u03AE\u03C4\u03B1\u03BD \u03B5\u03B4\u03CE\nRussian: \u0420\u043E\u0438\u0441\u0442\u043E\u043D\nJapanese: \u30ED\u30A4\u30B9\u30C8\u30F3\nChinese: \u7F85\u4F0A\u65AF\u9813\nHebrew: \u05E8\u05D5\u05D9\u05E1\u05D8\u05D5\u05DF\nArabic: \u0631\u0648\u064A\u0633\u062A\u0648\u0646',
      'doesn\'t convert non-latin characters'
    );
  });
  t.end();
});

// ==============================
// checking all numeric entities encoded in hyphens-and-dashes
// such as, for example, &#118; or &#39; - range 0-255
// ==============================

test('numeric entities', function (t) {

  t.equal(detergent(
    'aaaaaaa aaaaaaaaa aaaaaaaaaa&#160;bbbb'),
    'aaaaaaa aaaaaaaaa aaaaaaaaaa&nbsp;bbbb',
    'numeric entities'
  );
  t.equal(detergent(
    'aaaaaaa aaaaaaaaa aaaaaaaaaa&nbsp;bbbb'),
    'aaaaaaa aaaaaaaaa aaaaaaaaaa&nbsp;bbbb',
    'named entities'
  );
  t.equal(detergent(
    'aaaaaaa aaaaaaaaa aaaaaaaaa\xa0bbbb'),
    'aaaaaaa aaaaaaaaa aaaaaaaaa&nbsp;bbbb',
    'non-encoded entities'
  );

  // OK
  // mixer(sampleObj, {
  //     removeWidows : true,
  //     convertEntities : true,
  //     convertDashes : true,
  //     replaceLineBreaks : true,
  //     removeLineBreaks : false,
  //     useXHTML : true,
  //     convertApostrophes : true,
  //     removeSoftHyphens : true,
  //     dontEncodeNonLatin : true,
  //     keepBoldEtc : true
  //   })
  // .forEach(function (elem1){
  //   t.equal(detergent(
  //     'aaaaaaa bbbbbbb cccccccc&#160;ddddddddd', elem1),
  //     'aaaaaaa bbbbbbb cccccccc&nbsp;ddddddddd',
  //     'non-breaking space &#160;'
  //   );
  // });

  // mixer(sampleObj, {
  //       removeWidows : false,
  //       convertEntities : true,
  //       convertDashes : true,
  //       replaceLineBreaks : true,
  //       removeLineBreaks : false,
  //       useXHTML : true,
  //       convertApostrophes : true,
  //       removeSoftHyphens : true,
  //       dontEncodeNonLatin : true,
  //       keepBoldEtc : true
  //   })
  // .forEach(function (elem1){
  //   t.equal(detergent(
  //     'a&#160;b', elem1),
  //     'a&nbsp;b',
  //     'non-breaking space &#160;'
  //   );
  // });


  mixer(sampleObj, {
      convertEntities: true,
      useXHTML: true,
      convertApostrophes: false,
      removeSoftHyphens: false,
      removeWidows: false
    })
  .forEach(function (elem1){
    hashCharEncoding.forEach(function(elem2){
      t.equal(detergent(
        elem2[0], elem1),
        elem2[3],
        (elem2[1]+' ('+elem2[0]+')')
      );
    });
  });
  mixer(sampleObj, {
    convertEntities: false,
    useXHTML: true,
    convertApostrophes: false,
    removeSoftHyphens: false
    })
  .forEach(function (elem1){
    hashCharEncoding.forEach(function(elem2){
      t.equal(detergent(
        elem2[0], elem1),
        elem2[2],
        (elem2[1]+' ('+elem2[0]+')')
      );
    });
  });

  t.end();
});

// ref: fuzzysearch

// node tests/detergent.js | faucet
