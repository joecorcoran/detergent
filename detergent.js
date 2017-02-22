'use strict'

var he = require('he')
var S = require('string')
var curl = require('curl-quotes')
var endashes = require('typographic-en-dashes')
var unicodeDragon = require('unicode-dragon')
var entityRefs = require('./entity-references.json')
var numericEnt = require('./enforced-numeric-entities-list.json')
var er = require('easy-replace')
var toArray = require('lodash.toarray')

function existy (x) { return x != null }

/**
 * detergent - main function
 *
 * @param  {string} textToClean   this is text to clean
 * @param  {object} options       optional options object
 * @return {string}               cleaned text
 */
function detergent (textToClean, options) {
  // vars - declarations
  var o = options || {}
  var cleanedText = String(textToClean)

  // vars - setting defaults
  if (o.removeWidows === undefined) { o.removeWidows = true }
  if (o.convertEntities === undefined) { o.convertEntities = true }
  if (o.convertDashes === undefined) { o.convertDashes = true }
  if (o.convertApostrophes === undefined) { o.convertApostrophes = true }
  if (o.replaceLineBreaks === undefined) { o.replaceLineBreaks = true }
  if (o.removeLineBreaks === undefined) { o.removeLineBreaks = false }
  if (o.useXHTML === undefined) { o.useXHTML = true }
  if (o.removeSoftHyphens === undefined) { o.removeSoftHyphens = true }
  if (o.dontEncodeNonLatin === undefined) { o.dontEncodeNonLatin = true }
  if (o.keepBoldEtc === undefined) { o.keepBoldEtc = true }

  // vars - assets:
  var invisibleCharacters = [
    // C0 group. All, except: line feed u000A, vertical tab u000B, form feed u000C, carriage return u000D, ETX u0003 (Photoshop/Illustrator uses them) and tab u0009.
    '\u0000', '\u0001', '\u0002', '\u0004', '\u0005', '\u0006', '\u0007', '\u0008',
    '\u000e', '\u000f',
    '\u0010', '\u0011', '\u0012', '\u0013', '\u0014', '\u0015', '\u0016', '\u0017', '\u0018', '\u0019',
    '\u001a', '\u001b', '\u001c', '\u001d', '\u001e', '\u001f',
    // gap - space is not in, but delete 007F will be removed
    '\u007f',
    // C1 group
    '\u0080', '\u0081', '\u0082', '\u0083', '\u0084', '\u0086', '\u0087', '\u0088', '\u0089',
    '\u008a', '\u008b', '\u008c', '\u008d', '\u008e', '\u008f',
    '\u0090', '\u0091', '\u0092', '\u0093', '\u0094', '\u0095', '\u0096', '\u0097', '\u0098', '\u0099',
    '\u009a', '\u009b', '\u009c', '\u009d', '\u009e', '\u009f'
  ]

  var lineBreakCharacters = [
    '\u000a', '\u000b', '\u000c', '\u000d', '\u0085', '\u2028', '\u2029', '\u0003'
  ] // CR+LF, (U+000D and U+000A) combination will yield two line breaks on Detergent.

  // FUNCTIONS

  // delete all useless invisible characters, unicode ranges C0 and C1 (with few exceptions):

  /**
   * doRemoveInvisibles - delete every character in the incoming "inputString" which is present in the "invisibleCharacters" array
   *
   * @param  {string} inputString text to clean
   * @return {string}             result
   */
  function doRemoveInvisibles (inputString) {
    invisibleCharacters.forEach(function (element) {
      inputString = S(inputString).replaceAll(element, '').s
    })
    return inputString
  }

  /**
   * doRemoveSoftHyphens - delete all soft hyphens from a string
   *
   * @param  {string} inputString text to clean
   * @return {string}             result
   */
  function doRemoveSoftHyphens (inputString) {
    inputString = S(inputString).replaceAll('\u00AD', '').s
    return inputString
  }

  /**
   * doDecodeBRs - replace all BR tags with new line symbol
   *
   * @param  {string} inputString text to clean
   * @return {string}             result
   */
  function doDecodeBRs (inputString) {
    inputString = inputString.replace(/<\s*[bB][rR][^>]*>/igm, '\n')
    return inputString
  }

  /**
   * encryptBoldItalic - change all <b>, <bold>, <i> and <em> tags as well as closing tag equivalents TO proprietary placeholders. This procedure will not retain any attributes (class, id, etc.). It is necessary to encrypt because otherwise tags would be stripped by other functions.
   *
   * @param  {string} inputString text to clean
   * @return {string}             result
   */
  function encryptBoldItalic (inputString) {
    // opening B tag, including < B >, < b > and <b   >. Attributes allowed
    inputString = inputString.replace(/<(?!\s*br)(\s*b\s*[^/>]*)>/igm, '%$%b%$%')
    // closing B tag. No attributes allowed:
    inputString = inputString.replace(/<\s*\/\s*b[^>]*>/igm, '%$%/b%$%')
    // wrong slash on closing B tag:
    inputString = inputString.replace(/<\s*b\s*[/]\s*>/igm, '%$%/b%$%')

    // opening STRONG tag, attributes allowed
    inputString = inputString.replace(/<\s*strong\s*[^/>]*>/igm, '%$%strong%$%')
    // closing STRONG tag, attributes alowed
    inputString = inputString.replace(/<\s*[/]\s*strong\s*[^>]*>/igm, '%$%/strong%$%')
    // closing STRONG tag, wrong slash
    inputString = inputString.replace(/<\s*strong\s*[^>]*\s*[/]\s*>/igm, '%$%/strong%$%')

    // opening i tag, attributes allowed
    inputString = inputString.replace(/<\s*i\s*[^/>]*>/igm, '%$%i%$%')
    // closing i tag, attributes alowed
    inputString = inputString.replace(/<\s*[/]\s*i\s*[^>]*>/igm, '%$%/i%$%')
    // closing i tag, wrong slash
    inputString = inputString.replace(/<\s*i\s*[^>]*\s*[/]\s*>/igm, '%$%/i%$%')

    // opening EM tag, attributes allowed
    inputString = inputString.replace(/<\s*[^/][em]\s*[^/>]*>/igm, '%$%em%$%')
    // closing EM tag, attributes alowed
    inputString = inputString.replace(/<\s*[/]\s*em\s*[^>]*>/igm, '%$%/em%$%')
    // closing EM tag, wrong slash
    inputString = inputString.replace(/<\s*em\s*[^>]*\s*[/]\s*>/igm, '%$%/em%$%')

    return inputString
  }

  /**
   * decryptBoldItalic - decode the encrypted <b>, <bold>, <i> and <em> tags
   *
   * @param  {string} inputString text to decode
   * @return {string}             result
   */
  function decryptBoldItalic (inputString) {
    // IDEA: appropriate freakout: if opening tag count doesn't match closing tag count - remove all

    inputString = inputString.replace('%$%b%$%', '<b>')
    inputString = inputString.replace('%$%/b%$%', '</b>')

    inputString = inputString.replace('%$%strong%$%', '<strong>')
    inputString = inputString.replace('%$%/strong%$%', '</strong>')

    inputString = inputString.replace('%$%i%$%', '<i>')
    inputString = inputString.replace('%$%/i%$%', '</i>')

    inputString = inputString.replace('%$%em%$%', '<em>')
    inputString = inputString.replace('%$%/em%$%', '</em>')

    return inputString
  }

  /**
   * trimEdges - remove spaces from the front and end of each line
   * @param input {string} incoming string
   * @return {string}
   */
  function trimTrailingSpaces (input) {
    var lines = S(input).lines()
    for (var i = 0, len = lines.length; i < len; i++) {
      while (S(lines[i]).right(1).s === ' ') {
        lines[i] = S(lines[i]).chompRight(' ').s
      }
      while (S(lines[i]).left(1).s === ' ') {
        lines[i] = S(lines[i]).chompLeft(' ').s
      }
    }
    return lines.join('\n')
  }

  /**
   * trimEdges - remove spaces from the front and end of each line
   * @param input {string} incoming string
   * @return {string}
   */
  function trimTrailingLineBreaks (input) {
    while (S(input).right(1).s === '\n') {
      input = S(input).chompRight('\n').s
    }
    while (S(input).left(1).s === '\n') {
      input = S(input).chompLeft('\n').s
    }
    return input
  }

  /**
   * doCollapseWhiteSpace - will loop until every double space is replaced with single space
   *
   * @param  {string} inputString incoming string
   * @return {string}             result
   */
  function doCollapseWhiteSpace (inputString) {
    while (S(inputString).contains('  ')) {
      inputString = S(inputString).replaceAll('  ', ' ').s
    }
    return inputString
  }

  // source:

  /**
   * fixedCharCodeAt - used as charCodeAt() replacement when it is unknown whether non-Basic-Multilingual-Plane characters exist before the specified index position.
   * Source: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt
   *
   * @param str  {string} incoming string
   * @param idx  {Number} offset by one digit position. Theoretically, this second para could be used to identify the high surrogate. We are not using it here at Detergent.
   * @return {string}     description
   */
  function fixedCharCodeAt (str, idx) {
  // ex. fixedCharCodeAt('\uD800\uDC00', 0) // 65536
    idx = idx || 0
    var code = str.charCodeAt(idx)
    var hi, low

  // High surrogate (could change last hex to 0xDB7F to treat high
  // private surrogates as single characters)
    if ((code >= 0xD800) && (code <= 0xDBFF)) {
      hi = code
      low = str.charCodeAt(idx + 1)
    // if (isNaN(low)) {
      // throw 'High surrogate not followed by low surrogate in fixedCharCodeAt()'
    // }
      return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000
    }
    return code
  }

  /**
   * doConvertEntities - converts entities, optionally, skipping all non-latin characters.
   *
   * CHECKS AND CONSUMES o.dontEncodeNonLatin !
   * @param  {string} inputString incoming string
   * @return {string}             result
   */
  function doConvertEntities (inputString) {
    var encodeRangesArray = [
      [0, 880], [887, 890], [894, 900], [906, 908], [908, 910], [929, 931], [1319, 1329], [1366, 1369], [1375, 1377], [1415, 1417], [1418, 1423], [1423, 1425], [1479, 1488], [1514, 1520], [1524, 1536], [1540, 1542], [1563, 1566], [1805, 1807], [1866, 1869], [1969, 1984], [2042, 2048], [2093, 2096], [2110, 2112], [2139, 2142], [2142, 2208], [2208, 2210], [2220, 2276], [2302, 2304], [2423, 2425], [2431, 2433], [2435, 2437], [2444, 2447], [2448, 2451], [2472, 2474], [2480, 2482], [2482, 2486], [2489, 2492], [2500, 2503], [2504, 2507], [2510, 2519], [2519, 2524], [2525, 2527], [2531, 2534], [2555, 2561], [2563, 2565], [2570, 2575], [2576, 2579], [2600, 2602], [2608, 2610], [2611, 2613], [2614, 2616], [2617, 2620], [2620, 2622], [2626, 2631], [2632, 2635], [2637, 2641], [2641, 2649], [2652, 2654], [2654, 2662], [2677, 2689], [2691, 2693], [2701, 2703], [2705, 2707], [2728, 2730], [2736, 2738], [2739, 2741], [2745, 2748], [2757, 2759], [2761, 2763], [2765, 2768], [2768, 2784], [2787, 2790], [2801, 2817], [2819, 2821], [2828, 2831], [2832, 2835], [2856, 2858], [2864, 2866], [2867, 2869], [2873, 2876], [2884, 2887], [2888, 2891], [2893, 2902], [2903, 2908], [2909, 2911], [2915, 2918], [2935, 2946], [2947, 2949], [2954, 2958], [2960, 2962], [2965, 2969], [2970, 2972], [2972, 2974], [2975, 2979], [2980, 2984], [2986, 2990], [3001, 3006], [3010, 3014], [3016, 3018], [3021, 3024], [3024, 3031], [3031, 3046], [3066, 3073], [3075, 3077], [3084, 3086], [3088, 3090], [3112, 3114], [3123, 3125], [3129, 3133], [3140, 3142], [3144, 3146], [3149, 3157], [3158, 3160], [3161, 3168], [3171, 3174], [3183, 3192], [3199, 3202], [3203, 3205], [3212, 3214], [3216, 3218], [3240, 3242], [3251, 3253], [3257, 3260], [3268, 3270], [3272, 3274], [3277, 3285], [3286, 3294], [3294, 3296], [3299, 3302], [3311, 3313], [3314, 3330], [3331, 3333], [3340, 3342], [3344, 3346], [3386, 3389], [3396, 3398], [3400, 3402], [3406, 3415], [3415, 3424], [3427, 3430], [3445, 3449], [3455, 3458], [3459, 3461], [3478, 3482], [3505, 3507], [3515, 3517], [3517, 3520], [3526, 3530], [3530, 3535], [3540, 3542], [3542, 3544], [3551, 3570], [3572, 3585], [3642, 3647], [3675, 3713], [3714, 3716], [3716, 3719], [3720, 3722], [3722, 3725], [3725, 3732], [3735, 3737], [3743, 3745], [3747, 3749], [3749, 3751], [3751, 3754], [3755, 3757], [3769, 3771], [3773, 3776], [3780, 3782], [3782, 3784], [3789, 3792], [3801, 3804], [3807, 3840], [3911, 3913], [3948, 3953], [3991, 3993], [4028, 4030], [4044, 4046], [4058, 4096], [4293, 4295], [4295, 4301], [4301, 4304], [4680, 4682], [4685, 4688], [4694, 4696], [4696, 4698], [4701, 4704], [4744, 4746], [4749, 4752], [4784, 4786], [4789, 4792], [4798, 4800], [4800, 4802], [4805, 4808], [4822, 4824], [4880, 4882], [4885, 4888], [4954, 4957], [4988, 4992], [5017, 5024], [5108, 5120], [5788, 5792], [5872, 5888], [5900, 5902], [5908, 5920], [5942, 5952], [5971, 5984], [5996, 5998], [6000, 6002], [6003, 6016], [6109, 6112], [6121, 6128], [6137, 6144], [6158, 6160], [6169, 6176], [6263, 6272], [6314, 7936], [7957, 7960], [7965, 7968], [8005, 8008], [8013, 8016], [8023, 8025], [8025, 8027], [8027, 8029], [8029, 8031], [8061, 8064], [8116, 8118], [8132, 8134], [8147, 8150], [8155, 8157], [8175, 8178], [8180, 8182], [8190, 11904], [11929, 11931], [12019, 12032], [12245, 12288], [12351, 12353], [12438, 12441], [12543, 12549], [12589, 12593], [12686, 12688], [12730, 12736], [12771, 12784], [12830, 12832], [13054, 13056], [13312, 19893], [19893, 19904], [40869, 40908], [40908, 40960], [42124, 42128], [42182, 42192], [42539, 42560], [42647, 42655], [42743, 42752], [42894, 42896], [42899, 42912], [42922, 43000], [43051, 43056], [43065, 43072], [43127, 43136], [43204, 43214], [43225, 43232], [43259, 43264], [43347, 43359], [43388, 43392], [43469, 43471], [43481, 43486], [43487, 43520], [43574, 43584], [43597, 43600], [43609, 43612], [43643, 43648], [43714, 43739], [43766, 43777], [43782, 43785], [43790, 43793], [43798, 43808], [43814, 43816], [43822, 43968], [44013, 44016], [44025, 44032], [55203, 55216], [55238, 55243], [55291, 63744], [64109, 64112], [64217, 64256], [64262, 64275], [64279, 64285], [64310, 64312], [64316, 64318], [64318, 64320], [64321, 64323], [64324, 64326], [64449, 64467], [64831, 64848], [64911, 64914], [64967, 65008], [65021, 65136], [65140, 65142], [65276, 66560], [66717, 66720], [66729, 67584], [67589, 67592], [67592, 67594], [67637, 67639], [67640, 67644], [67644, 67647], [67669, 67671], [67679, 67840], [67867, 67871], [67897, 67903], [67903, 67968], [68023, 68030], [68031, 68096], [68099, 68101], [68102, 68108], [68115, 68117], [68119, 68121], [68147, 68152], [68154, 68159], [68167, 68176], [68184, 68192], [68223, 68352], [68405, 68409], [68437, 68440], [68466, 68472], [68479, 68608], [68680, 69216], [69246, 69632], [69709, 69714], [69743, 69760], [69825, 69840], [69864, 69872], [69881, 69888], [69940, 69942], [69955, 70016], [70088, 70096], [70105, 71296], [71351, 71360], [71369, 73728], [74606, 74752], [74850, 74864], [74867, 77824], [78894, 92160], [92728, 93952], [94020, 94032], [94078, 94095], [94111, 110592], [110593, 131072], [131072, 173782], [173782, 173824], [173824, 177972], [177972, 177984], [177984, 178205], [178205, 194560]
    ]
    var charCode, res, outputString
    if (o.dontEncodeNonLatin) {
      // split, check, enco de conditionally
      outputString = inputString
        .split('')
        .map(function (value1, index1, array1) {
          // if current character is surrogate's first pair, grab second-one from the next array1 element and concat both.
          if ((value1.charCodeAt(0) >= 0xD800) && (value1.charCodeAt(0) <= 0xDBFF)) {
            // concat next symbol with current, completing the character
            value1 = value1 + array1[index1 + 1]
            // delete the next array element, because it is now part of the current character
            array1.splice((index1 + 1), 1)
          }
          res = value1
          charCode = fixedCharCodeAt(value1)
          encodeRangesArray.forEach(function (value2) {
            if (charCode > value2[0] && charCode < value2[1]) {
              res = he.encode(String(res), {
                'useNamedReferences': true
              })
            }
          })
          return res
        })
        .join('')
    } else {
      // just encode all
      outputString = he.encode(String(inputString), {
        'useNamedReferences': true
      })
    }
    return outputString
  }

  /**
   * doRemoveWidows - prevents widows - last word in the paragraph that wrap onto the last line, all by itself. We use NBSP to join the last two words.
   *
   * @param  {string} inputString incoming string
   * @return {string}             result
   */
  function doRemoveWidows (inputString) {
    // first, trim the trailing white space
    // inputString = inputString.trim()
    var outputString

    // var paragraphsArray = inputString.split('\n')
    var paragraphsArray = S(inputString).lines()
    var newParasArray = paragraphsArray.map(function (elem, index, array) {
      // if the current line has a line under it, this means it is not the last line of the paragraph and we have to skip widow removal procedure
      if ((array[index + 1] !== void 0) && (array[index + 1] !== '')) {
        if (!S(elem).endsWith('.') && !S(elem).endsWith('?') && !S(elem).endsWith('!')) {
          return elem
        }
      }

      var arrayOfStrings = S(elem).s.split(' ')
      var numberOfWords = arrayOfStrings.length
      // if there are only three words or less - skip this line:
      if (numberOfWords < 4) {
        return elem
      }
      var lengthOfLastWord = arrayOfStrings[numberOfWords - 1].length
      // var lengthOfSecondLastWord = 0
      // if (numberOfWords > 1) {
      //   lengthOfSecondLastWord = arrayOfStrings[numberOfWords - 2].length
      // }

      // use substring to chop string into two parts omitting the offender widow space
      var part1 = elem.substring(0, elem.length - lengthOfLastWord - 1)
      var part2 = elem.substring(elem.length - lengthOfLastWord, elem.length)

      // glue together, only with &nbsp between them:
      if (part1.length > 0) {
        elem = part1 + '\u00A0' + part2
      }
      return elem
    })
    outputString = newParasArray.join('\n')
    outputString = joinPostcodes(outputString)

    return outputString
  }

  /**
   * widowDashes - replaces spaces before dashes with non-breaking spaces
   *
   * @param  {string} inputString
   * @return {string}
   */
  function doRemoveWidowDashes (inputString) {
    var outputString = S(inputString).replaceAll(' \u2013', '\u00A0\u2013').s
    outputString = S(outputString).replaceAll(' \u2014', '\u00A0\u2014').s

    outputString = S(outputString).replaceAll(' &ndash;', '&nbsp;&ndash;').s
    outputString = S(outputString).replaceAll(' &mdash;', '&nbsp;&mdash;').s
    return outputString
  }

  /**
   * doConvertDashes - converts regular dashes into N- and M-dashes, depending on the context.
   *
   * @param  {string} inputString
   * @return {string}
   */
  function doConvertDashes (inputString, widows) {
    inputString = endashes(inputString)

    // take care of m dashes manually (spaces added after deliberately):
    inputString = S(inputString).replaceAll(' --', ' \u2014 ').s
    inputString = S(inputString).replaceAll(' -', ' \u2014 ').s

    // add space after m dash provisionally
    inputString = S(inputString).replaceAll(' \u2014', ' \u2014 ').s
    // add space after m dash provisionally
    inputString = S(inputString).replaceAll(' &mdash;', ' &mdash; ').s

    if (widows) {
      // adding non-breaking space before ndashes:
      inputString = S(inputString).replaceAll(' \u2013', '\u00A0\u2013 ').s
      // adding non-breaking space before mdashes:
      inputString = S(inputString).replaceAll(' \u2014', '\u00A0\u2014 ').s
    }
    return inputString
  }

  /**
   * doAddSpaceAfterDashes - add space after hyphens and dashes if text follows
   *
   * @param  {string} inputString
   * @return {string}
   */
  function doAddSpaceAfterDashes (inputString) {
    // add space after m dash if there's preceding-one
    inputString = er(
      inputString,
      {
        leftOutsideNot: '',
        leftOutside: ' ',
        leftMaybe: '',
        searchFor: '\u2014',
        rightMaybe: ' ',
        rightOutside: '',
        rightOutsideNot: ''
      },
      '\u2014 '
    )
    // add space after n dash if there's preceding-one
    inputString = er(
      inputString,
      {
        leftOutsideNot: '',
        leftOutside: ' ',
        leftMaybe: '',
        searchFor: '\u2013',
        rightMaybe: ' ',
        rightOutside: '',
        rightOutsideNot: ''
      },
      '\u2013 '
    )
    // add space after m dash if there's nbsp or space in front of it
    inputString = er(
      inputString,
      {
        leftOutsideNot: '',
        leftOutside: ['\xa0', ' '],
        leftMaybe: '',
        searchFor: '\u2014',
        rightMaybe: ' ',
        rightOutside: '',
        rightOutsideNot: ''
      },
      '\u2014 '
    )
    // add space after n dash if there's nbsp or space in front of it
    inputString = er(
      inputString,
      {
        leftOutsideNot: '',
        leftOutside: ['\xa0', ' '],
        leftMaybe: '',
        searchFor: '\u2013',
        rightMaybe: ' ',
        rightOutside: '',
        rightOutsideNot: ''
      },
      '\u2013 '
    )
    // add space after minus/dash character if there's nbsp or space in front of it
    inputString = er(
      inputString,
      {
        leftOutsideNot: '',
        leftOutside: ['\xa0', ' '],
        leftMaybe: '',
        searchFor: '-',
        rightMaybe: ' ',
        rightOutside: '',
        rightOutsideNot: ''
      },
      '- '
    )
    return inputString
  }

  /**
   * doInterpretErroneousNBSP - fixes all variations of wrong &nbsp;
   *
   * @param  {string} inputString
   * @return {string}
   */
  function doInterpretErroneousNBSP (inputString) {
    // PART 0. Double-encoded nbsp
    inputString = er(
      inputString,
      {
        leftOutsideNot: '',
        leftOutside: '',
        leftMaybe: '',
        searchFor: '&amp;nbsp;',
        rightMaybe: '',
        rightOutside: '',
        rightOutsideNot: ''
      },
      '&nbsp;'
    )

    // PART 1. Two components missing: one of [&, ;] and one of [n, b, s, p]
    // \nnsp;
    inputString = er(
      inputString,
      {
        leftOutsideNot: '',
        leftOutside: '\n',
        leftMaybe: '',
        searchFor: 'nsp;',
        rightMaybe: '',
        rightOutside: '',
        rightOutsideNot: ''
      },
      '&nbsp;'
    )
    // \nnbp;
    inputString = er(
      inputString,
      {
        leftOutsideNot: '',
        leftOutside: '\n',
        leftMaybe: '',
        searchFor: 'nbp;',
        rightMaybe: '',
        rightOutside: '',
        rightOutsideNot: ''
      },
      '&nbsp;'
    )
    // \nnbs;
    inputString = er(
      inputString,
      {
        leftOutsideNot: '',
        leftOutside: '\n',
        leftMaybe: '',
        searchFor: 'nbs;',
        rightMaybe: '',
        rightOutside: '',
        rightOutsideNot: ''
      },
      '&nbsp;'
    )
    // thinsp;
    inputString = er(
      inputString,
      {
        leftOutsideNot: '',
        leftOutside: '',
        leftMaybe: '&',
        searchFor: 'thinsp',
        rightMaybe: ';',
        rightOutside: '',
        rightOutsideNot: ''
      },
      '\u2009'
    )
    // &nbs
    inputString = er(
      inputString,
      {
        leftOutsideNot: '',
        leftOutside: '&',
        leftMaybe: '',
        searchFor: 'nbs',
        rightMaybe: '',
        rightOutside: '',
        rightOutsideNot: 'p'
      },
      'nbsp'
    )
    // (&)nsp;
    inputString = er(
      inputString,
      {
        leftOutsideNot: 'e',
        leftOutside: '',
        leftMaybe: '&',
        searchFor: 'nsp;',
        rightMaybe: '',
        rightOutside: '',
        rightOutsideNot: ''
      },
      '&nbsp;'
    )
    // &nsp
    inputString = er(
      inputString,
      {
        leftOutsideNot: '',
        leftOutside: '&',
        leftMaybe: '',
        searchFor: 'nsp',
        rightMaybe: ';',
        rightOutside: '',
        rightOutsideNot: ''
      },
      'nbsp;'
    )
    // bsp
    inputString = er(
      inputString,
      {
        leftOutsideNot: '',
        leftOutside: '&',
        leftMaybe: '',
        searchFor: 'bsp',
        rightMaybe: ';',
        rightOutside: '',
        rightOutsideNot: ''
      },
      'nbsp;'
    )
    // nbp and similar
    inputString = er(
      inputString,
      {
        leftOutsideNot: '',
        leftOutside: '',
        leftMaybe: '&',
        searchFor: 'nbp',
        rightMaybe: ';',
        rightOutside: '',
        rightOutsideNot: ''
      },
      '&nbsp;'
    )
    // now dangerous stuff: missing ampersand and one letter (semicol present)
    // ?nbs;
    inputString = er(
      inputString,
      {
        leftOutsideNot: '',
        leftOutside: '',
        leftMaybe: '&',
        searchFor: 'nbs;',
        rightMaybe: '',
        rightOutside: '',
        rightOutsideNot: ''
      },
      '&nbsp;'
    )
    // ?bsp;
    inputString = er(
      inputString,
      {
        leftOutsideNot: 'n',
        leftOutside: '',
        leftMaybe: '&',
        searchFor: 'bsp;',
        rightMaybe: '',
        rightOutside: '',
        rightOutsideNot: ''
      },
      '&nbsp;'
    )
    // ===
    // fix missing ampersand and semicolon if wrapped by spaces
    inputString = er(
      inputString,
      {
        leftOutsideNot: '',
        leftOutside: ' ',
        leftMaybe: '',
        searchFor: 'nbsp',
        rightMaybe: '',
        rightOutside: ' ',
        rightOutsideNot: ''
      },
      ' &nbsp; '
    )
    // &ang (not &angst) - without semicol
    inputString = er(
      inputString,
      {
        leftOutsideNot: '',
        leftOutside: '',
        leftMaybe: '',
        searchFor: '&ang',
        rightMaybe: ';',
        rightOutside: '',
        rightOutsideNot: 's'
      },
      '&ang;'
    )
    // &ang (not &angst) - without semicol
    inputString = er(
      inputString,
      {
        leftOutsideNot: '',
        leftOutside: '',
        leftMaybe: '',
        searchFor: '&angst',
        rightMaybe: '',
        rightOutside: '',
        rightOutsideNot: ';'
      },
      '&angst;'
    )
    // &pi (not &piv) - without semicol
    inputString = er(
      inputString,
      {
        leftOutsideNot: '',
        leftOutside: '',
        leftMaybe: '',
        searchFor: '&pi',
        rightMaybe: ';',
        rightOutside: '',
        rightOutsideNot: 'v'
      },
      '&pi;'
    )
    // &pi (not &piv) - without semicol
    inputString = er(
      inputString,
      {
        leftOutsideNot: '',
        leftOutside: '',
        leftMaybe: '',
        searchFor: '&Pi',
        rightMaybe: ';',
        rightOutside: '',
        rightOutsideNot: ''
      },
      '&Pi;'
    )
    // &sigma (not &sigmaf) - without semicol
    inputString = er(
      inputString,
      {
        leftOutsideNot: '',
        leftOutside: '',
        leftMaybe: '',
        searchFor: '&sigma',
        rightMaybe: ';',
        rightOutside: '',
        rightOutsideNot: 'f'
      },
      '&sigma;'
    )
    // &sub (not &sube) - without semicol
    inputString = er(
      inputString,
      {
        leftOutsideNot: '',
        leftOutside: '',
        leftMaybe: '',
        searchFor: '&sub',
        rightMaybe: ';',
        rightOutside: '',
        rightOutsideNot: 'e'
      },
      '&sub;'
    )
    // &sup (not &supf, &supe, &sup1, &sup2 or &sup3) - without semicol
    inputString = er(
      inputString,
      {
        leftOutsideNot: '',
        leftOutside: '',
        leftMaybe: '',
        searchFor: '&sup',
        rightMaybe: ';',
        rightOutside: '',
        rightOutsideNot: ['f', 'e', '1', '2', '3']
      },
      '&sup;'
    )
    // &pi (not &piv) - without semicol
    inputString = er(
      inputString,
      {
        leftOutsideNot: '',
        leftOutside: '',
        leftMaybe: '',
        searchFor: '&piv',
        rightMaybe: ';',
        rightOutside: '',
        rightOutsideNot: ''
      },
      '&piv;'
    )
    // &pi (not &piv) - without semicol
    inputString = er(
      inputString,
      {
        leftOutsideNot: '',
        leftOutside: '',
        leftMaybe: '',
        searchFor: '&theta',
        rightMaybe: ';',
        rightOutside: '',
        rightOutsideNot: 'sym'
      },
      '&theta;'
    )
    //
    // PART 2. At least one of each of the set [n, b, s, p] is present.
    // any repetitions whatsoever like &&&&&nnnbbbssssp;;;
    inputString = inputString.replace(/&+n+b+s+p/igm, '&nbsp')
    inputString = inputString.replace(/n+b+s+p+;+/igm, 'nbsp;')
    inputString = inputString.replace(/n+b+s+p /igm, 'nbsp; ')
    inputString = inputString.replace(/n+b+s+p,/igm, 'nbsp;,')
    inputString = inputString.replace(/n+b+s+p\./igm, 'nbsp;.')

    // PART 3. One letter missing, but amp and semicol are present.
    inputString = inputString.replace(/&bsp;/igm, '&nbsp;')
    inputString = inputString.replace(/&nsp;/igm, '&nbsp;')
    inputString = inputString.replace(/&nbp;/igm, '&nbsp;')
    inputString = inputString.replace(/&nbs;/igm, '&nbsp;')
    //
    // ===
    // fix missing semicolon when ampersand is present:
    inputString = er(
      inputString,
      {
        leftOutsideNot: '',
        leftOutside: '&',
        leftMaybe: '',
        searchFor: 'nbsp',
        rightMaybe: ';',
        rightOutside: '',
        rightOutsideNot: ''
      },
      'nbsp;'
    )
    // ===
    // fix space-nbsp with no semicol
    inputString = er(
      inputString,
      {
        leftOutsideNot: '',
        leftOutside: [' ', '.', ',', ';', '\xa0', '?', '!'],
        leftMaybe: '',
        searchFor: 'nbsp',
        rightMaybe: '',
        rightOutside: '',
        rightOutsideNot: ';'
      },
      '&nbsp;'
    )
    // ===
    // fix missing ampersand when semicolon is present:
    inputString = er(
      inputString,
      {
        leftOutsideNot: '',
        leftOutside: '',
        leftMaybe: '&',
        searchFor: 'nbsp',
        rightMaybe: '',
        rightOutside: ';',
        rightOutsideNot: ''
      },
      '&nbsp'
    )
    //
    return inputString
  }

  /**
   * fixMissingAmpsAndSemicols - patches up other messed up named entities
   *
   * @param  {string} inputString
   * @return {string}
   */
  function fixMissingAmpsAndSemicols (inputString) {
    entityRefs.forEach(function (elem) {
      if (elem !== '') {
        inputString = er(
          inputString,
          {
            leftOutsideNot: '',
            leftOutside: '&',
            leftMaybe: '',
            searchFor: elem,
            rightMaybe: ';',
            rightOutside: '',
            rightOutsideNot: ''
          },
          elem + ';'
        )
      }
    })
    return inputString
  }

  // taken from jQuery
  // detects strings which are numbers
  //
  function isNumeric (obj) {
    return !isNaN(obj - parseFloat(obj))
  }

  function isLetter (c) {
    return c.toLowerCase() !== c.toUpperCase()
  }

  function isCapitalLetter (char) {
    if (isLetter(char)) {
      return char.toUpperCase() === char
    } else {
      return false
    }
  }

  /**
   * addMissingSpaces - adds missing spaces after dots/colons/semicolons, unless it's URL
   * space and colon don't have restrictions for following characters
   * space after semicolon will be added only if ['&', '\xa0'] don't follow it
   * algorithm will look for "://" to acticate URL ignoring
   *
   * @param  {String} input  accepts any string
   * @return {String}        returns cleaned string
   */
  function addMissingSpaces (input) {
    var x = toArray(input)
    var onUrlCurrently = false
    for (var i = 0, len = x.length; i < len; i++) {
      //
      // situation detections
      // ====================
      if ((x[i] === ':') && existy(x[i + 2]) && (x[i + 1] === '/') && (x[i + 2] === '/')) {
        onUrlCurrently = true
      } else if ((x[i] === 'w') && existy(x[i + 2]) && (x[i + 1] === 'w') && (x[i + 2] === 'w')) {
        onUrlCurrently = true
      }
      if ((x[i] === ' ') || (x[i] === '\n')) {
        onUrlCurrently = false
      }
      //
      // action
      // ======
      // add missing space after full stop or comma
      if (!onUrlCurrently &&
        ((x[i] === '.') || (x[i] === ',')) &&
        !isNumeric(x[i + 1]) &&
        (x[i + 1] !== ' ') &&
        (x[i + 1] !== '\n') &&
        (x[i + 1] !== undefined)
      ) {
        // dot/comma, not on URL, not followed by number = add space afterwards
        x.splice(i + 1, 0, ' ')
        len++
      } else if (
        onUrlCurrently &&
        ((x[i] === '.') || (x[i] === ',')) &&
        existy(x[i] + 2) &&
        isCapitalLetter(x[i + 1]) &&
        !isCapitalLetter(x[i + 2])
      ) {
        // dot at the end of URL, there's capital case letter and lowercase letter after it
        x.splice(i + 1, 0, ' ')
        len++
      }

      // add missing space after semicolon
      if (!onUrlCurrently &&
        (x[i] === ';') &&
        !isNumeric(x[i + 1]) &&
        (x[i + 1] !== ' ') &&
        (x[i + 1] !== '\n') &&
        (x[i + 1] !== undefined) &&
        (x[i + 1] !== '&') &&
        (x[i + 1] !== '\xa0')
      ) {
        // dot, not on URL, not followed by number = add space afterwards
        x.splice(i + 1, 0, ' ')
        len++
      } else if (
        onUrlCurrently &&
        (x[i] === ';') &&
        existy(x[i] + 2) &&
        isCapitalLetter(x[i + 1]) &&
        !isCapitalLetter(x[i + 2]) &&
        (x[i + 1] !== '&') &&
        (x[i + 1] !== '\xa0')
      ) {
        x.splice(i + 1, 0, ' ')
        len++
      }
    }
    return x.join('')
  }

  // find postcodes, replace the space within them with '\u00A0'
  function joinPostcodes (str) {
    str = str.replace(/([A-Z]{1,2}[0-9][0-9A-Z]?)\s?([0-9][A-Z]{2})/g, '$1\u00A0$2')
    return str
  }

  //                           ____
  //          massive hammer  |    |
  //        O=================|    |
  //          upon all bugs   |____|
  //
  //                         .=O=.
  //
  //       T H E    P I P E L I N E
  //

  // ================= xx =================

  // replace all occurencies of broken "&nbsp;" (where ampersand is missing) with a "&nbsp;"
  cleanedText = doInterpretErroneousNBSP(cleanedText)
  // all other mis-typed character references — missing ampersand and/or semicolon
  cleanedText = fixMissingAmpsAndSemicols(cleanedText)

  // ================= xx =================

  // decode entities
  // recursive decode until there's no difference anymore
  while (cleanedText !== he.decode(cleanedText)) {
    cleanedText = he.decode(cleanedText)
  }

  // ================= xx =================

  // invisibles being removed
  cleanedText = doRemoveInvisibles(cleanedText)

  // ================= xx =================

  // replace all hairspace chars with spaces
  cleanedText = S(cleanedText).replaceAll('\u200A', ' ').s

  // ================= xx =================

  // add missing space after m dashes
  cleanedText = doAddSpaceAfterDashes(cleanedText)

  // ================= xx =================

  // remove unpaired surrogates
  cleanedText = unicodeDragon(cleanedText)
  cleanedText = S(cleanedText).replaceAll('\uFFFD', '').s

  // ================= xx =================

  // replace all invisible characters that can be interpreted as line breaks
  // see https://en.wikipedia.org/wiki/Newline#Unicode
  if (!o.removeLineBreaks) {
    lineBreakCharacters.forEach(function (elem) {
      cleanedText = S(cleanedText).replaceAll(elem, '\n').s
    })
  } else {
    lineBreakCharacters.forEach(function (elem) {
      if (elem !== '\u000A') {
        cleanedText = S(cleanedText).replaceAll(elem, '').s
      }
    })
  }

  // ================= xx =================

  // replace the tabs with spaces
  cleanedText = S(cleanedText).replaceAll('\u0009', ' ').s
  cleanedText = S(cleanedText).replaceAll('\t', ' ').s

  // ================= xx =================

  cleanedText = doCollapseWhiteSpace(cleanedText)
  cleanedText = trimTrailingSpaces(cleanedText)

  // ================= xx =================

  // optionally, remove all line breaks (off by default, overrides other settings)
  if (o.removeLineBreaks) {
    cleanedText = doDecodeBRs(cleanedText)
    cleanedText = S(cleanedText).replaceAll('\n', ' ').s
    cleanedText = doCollapseWhiteSpace(cleanedText)
  }

  // ================= xx =================

  // optionally remove all soft hyphens, on by default
  if (o.removeSoftHyphens) {
    cleanedText = doRemoveSoftHyphens(cleanedText)
  }

  // ================= xx =================

  // optionally preserve bold, italic, strong and em - on by default
  if (o.keepBoldEtc) {
    cleanedText = encryptBoldItalic(cleanedText)
  }

  // ================= xx =================

  // BR's also
  cleanedText = doDecodeBRs(cleanedText)

  // ================= xx =================

  // trim leading and trailing line breaks
  cleanedText = trimTrailingLineBreaks(cleanedText)

  // ================= xx =================

  // now BR's are secure, let's strip all the remaining HTML
  cleanedText = S(cleanedText).stripTags().s

  // ================= xx =================

  // trim leading and trailing white space on each line
  cleanedText = trimTrailingSpaces(cleanedText)

  // ================= xx =================

  // replace the tabs with spaces
  cleanedText = S(cleanedText).replaceAll('\u0009', ' ').s
  cleanedText = S(cleanedText).replaceAll('\t', ' ').s
  cleanedText = doCollapseWhiteSpace(cleanedText)

  // ================= xx =================

  // enforce spaces after full stops, commas and semicolons
  cleanedText = doCollapseWhiteSpace(cleanedText)
  cleanedText = addMissingSpaces(cleanedText)

  // ================= xx =================

  // fix clearly wrong things, such as space-full stop occurencies:
  cleanedText = S(cleanedText).replaceAll(' .', '.').s
  // space-comma as well:
  cleanedText = S(cleanedText).replaceAll(' ,', ',').s

  // ================= xx =================

  // trims:
  cleanedText = doCollapseWhiteSpace(cleanedText)
  cleanedText = trimTrailingSpaces(cleanedText)
  cleanedText = trimTrailingLineBreaks(cleanedText)

  // ================= xx =================

  // optionally, fix widow words (on by default)
  if (o.removeWidows) {
    cleanedText = doRemoveWidows(cleanedText)
  }

  // optionally, replace spaces before m dashes with non-breaking spaces
  if (o.removeWidows) {
    cleanedText = doRemoveWidowDashes(cleanedText)
  }

  // ================= xx =================

  // convert apostrophes and quotation marks into fancy ones
  if (o.convertApostrophes) {
    cleanedText = curl(cleanedText)
  }

  // ================= xx =================

  // optionally, convert dashes to typographically correct-ones (on by default)
  if (o.convertDashes) {
    cleanedText = doConvertDashes(cleanedText, o.removeWidows)
  }

  // ================= xx =================

  // optionally, encode non-ASCII characters into named entities (on by default)
  if (o.convertEntities) {
    cleanedText = doConvertEntities(cleanedText)
    cleanedText = S(cleanedText).replaceAll('&hairsp;', ' ').s
  }

  // ================= xx =================

  // clean up after converting entities:
  // some entities can't be emailed in named form, only
  // in numeric-one:

  if (o.convertEntities) {
    // cleanedText = S(cleanedText).replaceAll('&hairsp;', ' ').s
    Object.keys(numericEnt).forEach(function (key) {
      cleanedText = S(cleanedText).replaceAll(key, numericEnt[key]).s
    })
  }

  // ================= xx =================

  // (horizontal) ellipsis:

  if (o.convertEntities) {
    cleanedText = S(cleanedText).replaceAll('...', '&hellip;').s
    cleanedText = S(cleanedText).replaceAll('&mldr;', '&hellip;').s
    cleanedText = S(cleanedText).replaceAll('\u2026', '&hellip;').s
  } else {
    cleanedText = S(cleanedText).replaceAll('...', '\u2026').s
    cleanedText = S(cleanedText).replaceAll('&mldr;', '\u2026').s
    cleanedText = S(cleanedText).replaceAll('&hellip;', '\u2026').s
  }

  // ================= xx =================

  // now restore any encrypted b, strong, em and i tags - on by default
  if (o.keepBoldEtc) {
    cleanedText = decryptBoldItalic(cleanedText)
  }

  // ================= xx =================

  // optionally, replace line breaks with BR (on by default)
  if ((o.replaceLineBreaks) && (!o.removeLineBreaks)) {
    if (o.useXHTML) {
      cleanedText = S(cleanedText).replaceAll('\n', '<br />\n').s
    } else {
      cleanedText = S(cleanedText).replaceAll('\n', '<br>\n').s
    }
  }

  // ================= xx =================

  // also, restore single apostrophes if any were encoded:
  cleanedText = S(cleanedText).replaceAll('&apos;', '\'').s

  // final trims:
  cleanedText = doCollapseWhiteSpace(cleanedText)
  cleanedText = trimTrailingSpaces(cleanedText)
  cleanedText = trimTrailingLineBreaks(cleanedText)

  // repeated:
  // fix clearly wrong things, such as space-full stop occurencies:
  cleanedText = S(cleanedText).replaceAll(' .', '.').s
  // repeated:
  // space-comma as well:
  cleanedText = S(cleanedText).replaceAll(' ,', ',').s

  // ================= xx =================

  // replace all hairspace chars with spaces
  cleanedText = S(cleanedText).replaceAll('\u200A', ' ').s
  cleanedText = S(cleanedText).replaceAll('&hairsp;', ' ').s

  // ================= xx =================

  // optionally, replace spaces before m dashes with non-breaking spaces
  if (o.removeWidows) {
    cleanedText = doRemoveWidowDashes(cleanedText)
  }

  // ================= xx =================

  return cleanedText
}

module.exports = detergent
