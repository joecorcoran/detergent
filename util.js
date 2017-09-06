'use strict'

const he = require('he')
const S = require('string')
const endashes = require('typographic-en-dashes')
const entityRefs = require('./entity-references.json')
const er = require('easy-replace')

const defaultsObj = {
  removeWidows: true,
  convertEntities: true,
  convertDashes: true,
  convertApostrophes: true,
  replaceLineBreaks: true,
  removeLineBreaks: false,
  useXHTML: true,
  removeSoftHyphens: true,
  dontEncodeNonLatin: true,
  keepBoldEtc: true,
  addMissingSpaces: true,
  convertDotsToEllipsis: true
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
 * trimTrailingSpaces - remove spaces from the front and end of each line
 * @param input {string} incoming string
 * @return {string}
 */
function trimTrailingSpaces (input) {
  var lines = S(input).lines()
  for (var i = lines.length; i--;) {
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
function doConvertEntities (inputString, dontEncodeNonLatin) {
  var encodeRangesArray = [
    [0, 880], [887, 890], [894, 900], [906, 908], [908, 910], [929, 931], [1319, 1329], [1366, 1369], [1375, 1377], [1415, 1417], [1418, 1423], [1423, 1425], [1479, 1488], [1514, 1520], [1524, 1536], [1540, 1542], [1563, 1566], [1805, 1807], [1866, 1869], [1969, 1984], [2042, 2048], [2093, 2096], [2110, 2112], [2139, 2142], [2142, 2208], [2208, 2210], [2220, 2276], [2302, 2304], [2423, 2425], [2431, 2433], [2435, 2437], [2444, 2447], [2448, 2451], [2472, 2474], [2480, 2482], [2482, 2486], [2489, 2492], [2500, 2503], [2504, 2507], [2510, 2519], [2519, 2524], [2525, 2527], [2531, 2534], [2555, 2561], [2563, 2565], [2570, 2575], [2576, 2579], [2600, 2602], [2608, 2610], [2611, 2613], [2614, 2616], [2617, 2620], [2620, 2622], [2626, 2631], [2632, 2635], [2637, 2641], [2641, 2649], [2652, 2654], [2654, 2662], [2677, 2689], [2691, 2693], [2701, 2703], [2705, 2707], [2728, 2730], [2736, 2738], [2739, 2741], [2745, 2748], [2757, 2759], [2761, 2763], [2765, 2768], [2768, 2784], [2787, 2790], [2801, 2817], [2819, 2821], [2828, 2831], [2832, 2835], [2856, 2858], [2864, 2866], [2867, 2869], [2873, 2876], [2884, 2887], [2888, 2891], [2893, 2902], [2903, 2908], [2909, 2911], [2915, 2918], [2935, 2946], [2947, 2949], [2954, 2958], [2960, 2962], [2965, 2969], [2970, 2972], [2972, 2974], [2975, 2979], [2980, 2984], [2986, 2990], [3001, 3006], [3010, 3014], [3016, 3018], [3021, 3024], [3024, 3031], [3031, 3046], [3066, 3073], [3075, 3077], [3084, 3086], [3088, 3090], [3112, 3114], [3123, 3125], [3129, 3133], [3140, 3142], [3144, 3146], [3149, 3157], [3158, 3160], [3161, 3168], [3171, 3174], [3183, 3192], [3199, 3202], [3203, 3205], [3212, 3214], [3216, 3218], [3240, 3242], [3251, 3253], [3257, 3260], [3268, 3270], [3272, 3274], [3277, 3285], [3286, 3294], [3294, 3296], [3299, 3302], [3311, 3313], [3314, 3330], [3331, 3333], [3340, 3342], [3344, 3346], [3386, 3389], [3396, 3398], [3400, 3402], [3406, 3415], [3415, 3424], [3427, 3430], [3445, 3449], [3455, 3458], [3459, 3461], [3478, 3482], [3505, 3507], [3515, 3517], [3517, 3520], [3526, 3530], [3530, 3535], [3540, 3542], [3542, 3544], [3551, 3570], [3572, 3585], [3642, 3647], [3675, 3713], [3714, 3716], [3716, 3719], [3720, 3722], [3722, 3725], [3725, 3732], [3735, 3737], [3743, 3745], [3747, 3749], [3749, 3751], [3751, 3754], [3755, 3757], [3769, 3771], [3773, 3776], [3780, 3782], [3782, 3784], [3789, 3792], [3801, 3804], [3807, 3840], [3911, 3913], [3948, 3953], [3991, 3993], [4028, 4030], [4044, 4046], [4058, 4096], [4293, 4295], [4295, 4301], [4301, 4304], [4680, 4682], [4685, 4688], [4694, 4696], [4696, 4698], [4701, 4704], [4744, 4746], [4749, 4752], [4784, 4786], [4789, 4792], [4798, 4800], [4800, 4802], [4805, 4808], [4822, 4824], [4880, 4882], [4885, 4888], [4954, 4957], [4988, 4992], [5017, 5024], [5108, 5120], [5788, 5792], [5872, 5888], [5900, 5902], [5908, 5920], [5942, 5952], [5971, 5984], [5996, 5998], [6000, 6002], [6003, 6016], [6109, 6112], [6121, 6128], [6137, 6144], [6158, 6160], [6169, 6176], [6263, 6272], [6314, 7936], [7957, 7960], [7965, 7968], [8005, 8008], [8013, 8016], [8023, 8025], [8025, 8027], [8027, 8029], [8029, 8031], [8061, 8064], [8116, 8118], [8132, 8134], [8147, 8150], [8155, 8157], [8175, 8178], [8180, 8182], [8190, 11904], [11929, 11931], [12019, 12032], [12245, 12288], [12351, 12353], [12438, 12441], [12543, 12549], [12589, 12593], [12686, 12688], [12730, 12736], [12771, 12784], [12830, 12832], [13054, 13056], [13312, 19893], [19893, 19904], [40869, 40908], [40908, 40960], [42124, 42128], [42182, 42192], [42539, 42560], [42647, 42655], [42743, 42752], [42894, 42896], [42899, 42912], [42922, 43000], [43051, 43056], [43065, 43072], [43127, 43136], [43204, 43214], [43225, 43232], [43259, 43264], [43347, 43359], [43388, 43392], [43469, 43471], [43481, 43486], [43487, 43520], [43574, 43584], [43597, 43600], [43609, 43612], [43643, 43648], [43714, 43739], [43766, 43777], [43782, 43785], [43790, 43793], [43798, 43808], [43814, 43816], [43822, 43968], [44013, 44016], [44025, 44032], [55203, 55216], [55238, 55243], [55291, 63744], [64109, 64112], [64217, 64256], [64262, 64275], [64279, 64285], [64310, 64312], [64316, 64318], [64318, 64320], [64321, 64323], [64324, 64326], [64449, 64467], [64831, 64848], [64911, 64914], [64967, 65008], [65021, 65136], [65140, 65142], [65276, 66560], [66717, 66720], [66729, 67584], [67589, 67592], [67592, 67594], [67637, 67639], [67640, 67644], [67644, 67647], [67669, 67671], [67679, 67840], [67867, 67871], [67897, 67903], [67903, 67968], [68023, 68030], [68031, 68096], [68099, 68101], [68102, 68108], [68115, 68117], [68119, 68121], [68147, 68152], [68154, 68159], [68167, 68176], [68184, 68192], [68223, 68352], [68405, 68409], [68437, 68440], [68466, 68472], [68479, 68608], [68680, 69216], [69246, 69632], [69709, 69714], [69743, 69760], [69825, 69840], [69864, 69872], [69881, 69888], [69940, 69942], [69955, 70016], [70088, 70096], [70105, 71296], [71351, 71360], [71369, 73728], [74606, 74752], [74850, 74864], [74867, 77824], [78894, 92160], [92728, 93952], [94020, 94032], [94078, 94095], [94111, 110592], [110593, 131072], [131072, 173782], [173782, 173824], [173824, 177972], [177972, 177984], [177984, 178205], [178205, 194560]
  ]
  var charCode, res, outputString
  if (dontEncodeNonLatin) {
    // split, check, encode conditionally
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
  var outputString

  // var paragraphsArray = inputString.split('\n')
  var paragraphsArray = S(inputString).lines()
  var newParasArray = paragraphsArray.map(function (elem, index, array) {
    // if the current line has a line under it, this means it is not the last line of the paragraph and we have to skip widow removal procedure
    if ((array[index + 1] !== undefined) && (array[index + 1] !== '')) {
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

    // use substring to chop string into two parts omitting the offender widow space
    var part1 = elem.substring(0, elem.length - lengthOfLastWord - 1)
    var part2 = elem.substring(elem.length - lengthOfLastWord, elem.length)

    // glue together, only with &nbsp between them:
    // * don't add non-breaking space if there's right slash immediately to the right of it. (it's a closing tag)
    // * don't add non-breaking space if left side ends with "br" or "hr"
    if (
      part1.length > 0 &&
      !S(part2).startsWith('/') &&
      !S(part1).endsWith('br') &&
      !S(part1).endsWith('hr')
    ) {
      elem = part1 + '\u00A0' + part2
    }
    return elem
  })
  outputString = newParasArray.join('\n')
  outputString = joinPostcodes(outputString)

  return outputString
}

/**
 * doRemoveWidowDashes - replaces spaces before dashes with non-breaking spaces
 *
 * @param  {string} inputString
 * @return {string}
 */
function doRemoveWidowDashes (inputString) {
  var outputString = S(inputString).replaceAll(' \u2013', '\u00A0\u2013').s
  outputString = S(outputString).replaceAll(' \u2014', '\u00A0\u2014').s

  // outputString = S(outputString).replaceAll(' &ndash;', '&nbsp;&ndash;').s
  // outputString = S(outputString).replaceAll(' &mdash;', '&nbsp;&mdash;').s
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
  inputString = er(
    inputString,
    {
      leftOutside: ' ',
      searchFor: '-',
      rightMaybe: '-',
      rightOutsideNot: ['$', '£', '€', '₽', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
    },
    '\u2014 '
  )

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
      searchFor: '&amp;nbsp;'
    },
    '&nbsp;'
  )

  // PART 1. Two components missing: one of [&, ;] and one of [n, b, s, p]
  // \nnsp;
  inputString = er(
    inputString,
    {
      leftOutside: '\n',
      searchFor: 'nsp;'
    },
    '&nbsp;'
  )
  // \nnbp;
  inputString = er(
    inputString,
    {
      leftOutside: '\n',
      searchFor: 'nbp;'
    },
    '&nbsp;'
  )
  // \nnbs;
  inputString = er(
    inputString,
    {
      leftOutside: '\n',
      searchFor: 'nbs;'
    },
    '&nbsp;'
  )
  // thinsp;
  inputString = er(
    inputString,
    {
      leftMaybe: '&',
      searchFor: 'thinsp',
      rightMaybe: ';'
    },
    '\u2009'
  )
  // &nbs
  inputString = er(
    inputString,
    {
      leftOutside: '&',
      searchFor: 'nbs',
      rightOutsideNot: 'p'
    },
    'nbsp'
  )
  // (&)nsp;
  inputString = er(
    inputString,
    {
      leftOutsideNot: 'e',
      leftMaybe: '&',
      searchFor: 'nsp;'
    },
    '&nbsp;'
  )
  // &nsp
  inputString = er(
    inputString,
    {
      leftOutside: '&',
      searchFor: 'nsp',
      rightMaybe: ';'
    },
    'nbsp;'
  )
  // bsp
  inputString = er(
    inputString,
    {
      leftOutside: '&',
      searchFor: 'bsp',
      rightMaybe: ';'
    },
    'nbsp;'
  )
  // nbp and similar
  inputString = er(
    inputString,
    {
      leftMaybe: '&',
      searchFor: 'nbp',
      rightMaybe: ';'
    },
    '&nbsp;'
  )
  // now dangerous stuff: missing ampersand and one letter (semicol present)
  // ?nbs;
  inputString = er(
    inputString,
    {
      leftMaybe: '&',
      searchFor: 'nbs;'
    },
    '&nbsp;'
  )
  // ?bsp;
  inputString = er(
    inputString,
    {
      leftOutsideNot: 'n',
      leftMaybe: '&',
      searchFor: 'bsp;'
    },
    '&nbsp;'
  )
  // ===
  // fix missing ampersand and semicolon if wrapped by spaces
  inputString = er(
    inputString,
    {
      leftOutside: ' ',
      searchFor: 'nbsp',
      rightOutside: ' '
    },
    ' &nbsp; '
  )
  // &ang (not &angst) - without semicol
  inputString = er(
    inputString,
    {
      searchFor: '&ang',
      rightMaybe: ';',
      rightOutsideNot: 's'
    },
    '&ang;'
  )
  // &ang (not &angst) - without semicol
  inputString = er(
    inputString,
    {
      searchFor: '&angst',
      rightOutsideNot: ';'
    },
    '&angst;'
  )
  // &pi (not &piv) - without semicol
  inputString = er(
    inputString,
    {
      searchFor: '&pi',
      rightMaybe: ';',
      rightOutsideNot: 'v'
    },
    '&pi;'
  )
  // &pi (not &piv) - without semicol
  inputString = er(
    inputString,
    {
      searchFor: '&Pi',
      rightMaybe: ';'
    },
    '&Pi;'
  )
  // &sigma (not &sigmaf) - without semicol
  inputString = er(
    inputString,
    {
      searchFor: '&sigma',
      rightMaybe: ';',
      rightOutsideNot: 'f'
    },
    '&sigma;'
  )
  // &sub (not &sube) - without semicol
  inputString = er(
    inputString,
    {
      searchFor: '&sub',
      rightMaybe: ';',
      rightOutsideNot: 'e'
    },
    '&sub;'
  )
  // &sup (not &supf, &supe, &sup1, &sup2 or &sup3) - without semicol
  inputString = er(
    inputString,
    {
      searchFor: '&sup',
      rightMaybe: ';',
      rightOutsideNot: ['f', 'e', '1', '2', '3']
    },
    '&sup;'
  )
  // &pi (not &piv) - without semicol
  inputString = er(
    inputString,
    {
      searchFor: '&piv',
      rightMaybe: ';'
    },
    '&piv;'
  )
  // &pi (not &piv) - without semicol
  inputString = er(
    inputString,
    {
      searchFor: '&theta',
      rightMaybe: ';',
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
      leftOutside: '&',
      searchFor: 'nbsp',
      rightMaybe: ';',
      i: {
        searchFor: true
      }
    },
    'nbsp;'
  )
  // ===
  // fix space-nbsp with no semicol
  inputString = er(
    inputString,
    {
      leftOutside: [' ', '.', ',', ';', '\xa0', '?', '!'],
      searchFor: 'nbsp',
      rightOutsideNot: ';',
      i: {
        searchFor: true
      }
    },
    '&nbsp;'
  )
  // ===
  // fix missing ampersand when semicolon is present:
  inputString = er(
    inputString,
    {
      leftMaybe: '&',
      searchFor: 'nbsp',
      rightOutside: ';',
      i: {
        searchFor: true
      }
    },
    '&nbsp'
  )
  //
  return inputString
}

function isNumeric (obj) {
  return !isNaN(obj - parseFloat(obj))
}

function isLetter (str) {
  return (typeof str === 'string') && (str.length === 1) && (str.toUpperCase() !== str.toLowerCase())
}

function isLowercaseLetter (str) {
  if (!isLetter(str)) {
    return false
  } else {
    return (str === str.toLowerCase()) && (str !== str.toUpperCase())
  }
}

function isUppercaseLetter (str) {
  if (!isLetter(str)) {
    return false
  } else {
    return (str === str.toUpperCase()) && (str !== str.toLowerCase())
  }
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
          leftOutside: '&',
          searchFor: elem,
          rightMaybe: ';'
        },
        elem + ';'
      )
    }
  })
  return inputString
}

// find postcodes, replace the space within them with '\u00A0'
function joinPostcodes (str) {
  str = str.replace(/([A-Z]{1,2}[0-9][0-9A-Z]?)\s?([0-9][A-Z]{2})/g, '$1\u00A0$2')
  return str
}

module.exports = {
  defaultsObj,
  doDecodeBRs,
  encryptBoldItalic,
  decryptBoldItalic,
  trimTrailingSpaces,
  fixedCharCodeAt,
  doConvertEntities,
  doRemoveWidows,
  doRemoveWidowDashes,
  doConvertDashes,
  doInterpretErroneousNBSP,
  fixMissingAmpsAndSemicols,
  isNumeric,
  isLetter,
  isLowercaseLetter,
  isUppercaseLetter
}
