'use strict';

var he = require('he');
var S = require('string');
var curl = require('curl-quotes');
var endashes = require('typographic-en-dashes');
var emdashes = require('typographic-em-dashes');
var unicodeDragon = require('unicode-dragon');
var entityRefs = require('./entity-references.json');

function detergent(textToClean, options) {

  if (Array.isArray(options) === true){
    throw ('please feed a settings object into Detergent, not an array');
  }

  // vars - declarations
  var o = options || {};
  var cleanedText = String(textToClean);

  // vars - setting defaults
  if (o.removeWidows === void 0) { o.removeWidows = true; }
  if (o.convertEntities === void 0) { o.convertEntities = true; }
  if (o.convertDashes === void 0) { o.convertDashes = true; }
  if (o.convertApostrophes === void 0) { o.convertApostrophes = true; }
  if (o.replaceLineBreaks === void 0) { o.replaceLineBreaks = true; }
  if (o.removeLineBreaks === void 0) { o.removeLineBreaks = false; }
  if (o.useXHTML === void 0) { o.useXHTML = true; }
  if (o.removeSoftHyphens === void 0) { o.removeSoftHyphens = true; }
  if (o.dontEncodeNonLatin === void 0) { o.dontEncodeNonLatin = true; }
  if (o.keepBoldEtc === void 0) { o.keepBoldEtc = true; }

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
  ];

  var lineBreakCharacters = [
    '\u000a', '\u000b', '\u000c', '\u000d', '\u0085', '\u2028', '\u2029', '\u0003'
  ]; // CR+LF, (U+000D and U+000A) combination will yield two line breaks on Detergent.

  // FUNCTIONS

  // delete all useless invisible characters, unicode ranges C0 and C1 (with few exceptions):
  function doRemoveInvisibles(inputString) {
    invisibleCharacters.forEach(function (element) {
      inputString = S(inputString).replaceAll(element, '').s;
    });
    return inputString;
  }

  function doRemoveSoftHyphens(inputString) {
    inputString = S(inputString).replaceAll('\u00AD', '').s;
    return inputString;
  }

  function doDecodeBRs(inputString) {
    var outputString = inputString.replace(/<\s*[bB][rR][^>]*>/igm, '\n');
    return outputString;
  }

  function encryptBoldItalic(inputString) {
    var outputString = inputString;

    // opening B tag, including < B >, < b > and <b   >. Attributes allowed
    outputString = outputString.replace(/<(?!\s*br)(\s*b\s*[^/>]*)>/igm, '%$%b%$%');
    // closing B tag. No attributes allowed:
    outputString = outputString.replace(/<\s*\/\s*b[^>]*>/igm, '%$%/b%$%');
    // wrong slash on closing B tag:
    outputString = outputString.replace(/<\s*b\s*[\/]\s*>/igm, '%$%/b%$%');

    // opening STRONG tag, attributes allowed
    outputString = outputString.replace(/<\s*strong\s*[^/>]*>/igm, '%$%strong%$%');
    // closing STRONG tag, attributes alowed
    outputString = outputString.replace(/<\s*[\/]\s*strong\s*[^>]*>/igm, '%$%/strong%$%');
    // closing STRONG tag, wrong slash
    outputString = outputString.replace(/<\s*strong\s*[^>]*\s*[\/]\s*>/igm, '%$%/strong%$%');

    // opening i tag, attributes allowed
    outputString = outputString.replace(/<\s*i\s*[^/>]*>/igm, '%$%i%$%');
    // closing i tag, attributes alowed
    outputString = outputString.replace(/<\s*[\/]\s*i\s*[^>]*>/igm, '%$%/i%$%');
    // closing i tag, wrong slash
    outputString = outputString.replace(/<\s*i\s*[^>]*\s*[\/]\s*>/igm, '%$%/i%$%');

    // opening EM tag, attributes allowed
    outputString = outputString.replace(/<\s*[^\/][em]\s*[^/>]*>/igm, '%$%em%$%');
    // closing EM tag, attributes alowed
    outputString = outputString.replace(/<\s*[\/]\s*em\s*[^>]*>/igm, '%$%/em%$%');
    // closing EM tag, wrong slash
    outputString = outputString.replace(/<\s*em\s*[^>]*\s*[\/]\s*>/igm, '%$%/em%$%');

    return outputString;
  }

  function decryptBoldItalic(inputString) {
    var outputString = inputString;

    // TODO: appropriate feakout: if opening tag count doesn't match closing tag count - remove all

    outputString = outputString.replace('%$%b%$%', '<b>');
    outputString = outputString.replace('%$%/b%$%', '</b>');

    outputString = outputString.replace('%$%strong%$%', '<strong>');
    outputString = outputString.replace('%$%/strong%$%', '</strong>');

    outputString = outputString.replace('%$%i%$%', '<i>');
    outputString = outputString.replace('%$%/i%$%', '</i>');

    outputString = outputString.replace('%$%em%$%', '<em>');
    outputString = outputString.replace('%$%/em%$%', '</em>');

    return outputString;
  }

  /**
   * trimEdges - remove spaces from the front and end of each line
   * @param input {string} incoming string
   * @return {string}
   */
  function trimTrailingSpaces(input){
    var lines = S(input).lines();
    for (var i = 0, len = lines.length; i < len; i++) {
      while (S(lines[i]).right(1).s === ' '){
        lines[i] = S(lines[i]).chompRight(' ').s;
      }
      while (S(lines[i]).left(1).s === ' '){
        lines[i] = S(lines[i]).chompLeft(' ').s;
      }
    }
    return lines.join('\n');
  }

  /**
   * trimEdges - remove spaces from the front and end of each line
   * @param input {string} incoming string
   * @return {string}
   */
  function trimTrailingLineBreaks(input){
    while (S(input).right(1).s === '\n'){
      input = S(input).chompRight('\n').s;
    }
    while (S(input).left(1).s === '\n'){
      input = S(input).chompLeft('\n').s;
    }
    return input;
  }

  function escapeRegex(value) {
      return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
  }

  function doCollapseWhiteSpace(inputString) {
    var outputString = inputString;
    while (S(outputString).contains('  ')){
        outputString = S(outputString).replaceAll('  ', ' ').s;
    }
    return outputString;
  }

  // source:  https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt
  function fixedCharCodeAt(str, idx) {
  // ex. fixedCharCodeAt('\uD800\uDC00', 0); // 65536
  // ex. fixedCharCodeAt('\uD800\uDC00', 1); // false
  idx = idx || 0;
  var code = str.charCodeAt(idx);
  var hi, low;

  // High surrogate (could change last hex to 0xDB7F to treat high
  // private surrogates as single characters)
  if (0xD800 <= code && code <= 0xDBFF) {
    hi = code;
    low = str.charCodeAt(idx + 1);
    //if (isNaN(low)) {
      //throw 'High surrogate not followed by low surrogate in fixedCharCodeAt()';
    //}
    return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
  }
  if (0xDC00 <= code && code <= 0xDFFF) { // Low surrogate
    // We return false to allow loops to skip this iteration since should have
    // already handled high surrogate above in the previous iteration
    return false;
    /*hi = str.charCodeAt(idx - 1);
    low = code;
    return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;*/
  }
  return code;
}

  function doConvertEntities(inputString) {
    var encodeRangesArray = [
      [0,880],[887,890],[894,900],[906,908],[908,910],[929,931],[1319,1329],[1366,1369],[1375,1377],[1415,1417],[1418,1423],[1423,1425],[1479,1488],[1514,1520],[1524,1536],[1540,1542],[1563,1566],[1805,1807],[1866,1869],[1969,1984],[2042,2048],[2093,2096],[2110,2112],[2139,2142],[2142,2208],[2208,2210],[2220,2276],[2302,2304],[2423,2425],[2431,2433],[2435,2437],[2444,2447],[2448,2451],[2472,2474],[2480,2482],[2482,2486],[2489,2492],[2500,2503],[2504,2507],[2510,2519],[2519,2524],[2525,2527],[2531,2534],[2555,2561],[2563,2565],[2570,2575],[2576,2579],[2600,2602],[2608,2610],[2611,2613],[2614,2616],[2617,2620],[2620,2622],[2626,2631],[2632,2635],[2637,2641],[2641,2649],[2652,2654],[2654,2662],[2677,2689],[2691,2693],[2701,2703],[2705,2707],[2728,2730],[2736,2738],[2739,2741],[2745,2748],[2757,2759],[2761,2763],[2765,2768],[2768,2784],[2787,2790],[2801,2817],[2819,2821],[2828,2831],[2832,2835],[2856,2858],[2864,2866],[2867,2869],[2873,2876],[2884,2887],[2888,2891],[2893,2902],[2903,2908],[2909,2911],[2915,2918],[2935,2946],[2947,2949],[2954,2958],[2960,2962],[2965,2969],[2970,2972],[2972,2974],[2975,2979],[2980,2984],[2986,2990],[3001,3006],[3010,3014],[3016,3018],[3021,3024],[3024,3031],[3031,3046],[3066,3073],[3075,3077],[3084,3086],[3088,3090],[3112,3114],[3123,3125],[3129,3133],[3140,3142],[3144,3146],[3149,3157],[3158,3160],[3161,3168],[3171,3174],[3183,3192],[3199,3202],[3203,3205],[3212,3214],[3216,3218],[3240,3242],[3251,3253],[3257,3260],[3268,3270],[3272,3274],[3277,3285],[3286,3294],[3294,3296],[3299,3302],[3311,3313],[3314,3330],[3331,3333],[3340,3342],[3344,3346],[3386,3389],[3396,3398],[3400,3402],[3406,3415],[3415,3424],[3427,3430],[3445,3449],[3455,3458],[3459,3461],[3478,3482],[3505,3507],[3515,3517],[3517,3520],[3526,3530],[3530,3535],[3540,3542],[3542,3544],[3551,3570],[3572,3585],[3642,3647],[3675,3713],[3714,3716],[3716,3719],[3720,3722],[3722,3725],[3725,3732],[3735,3737],[3743,3745],[3747,3749],[3749,3751],[3751,3754],[3755,3757],[3769,3771],[3773,3776],[3780,3782],[3782,3784],[3789,3792],[3801,3804],[3807,3840],[3911,3913],[3948,3953],[3991,3993],[4028,4030],[4044,4046],[4058,4096],[4293,4295],[4295,4301],[4301,4304],[4680,4682],[4685,4688],[4694,4696],[4696,4698],[4701,4704],[4744,4746],[4749,4752],[4784,4786],[4789,4792],[4798,4800],[4800,4802],[4805,4808],[4822,4824],[4880,4882],[4885,4888],[4954,4957],[4988,4992],[5017,5024],[5108,5120],[5788,5792],[5872,5888],[5900,5902],[5908,5920],[5942,5952],[5971,5984],[5996,5998],[6000,6002],[6003,6016],[6109,6112],[6121,6128],[6137,6144],[6158,6160],[6169,6176],[6263,6272],[6314,7936],[7957,7960],[7965,7968],[8005,8008],[8013,8016],[8023,8025],[8025,8027],[8027,8029],[8029,8031],[8061,8064],[8116,8118],[8132,8134],[8147,8150],[8155,8157],[8175,8178],[8180,8182],[8190,11904],[11929,11931],[12019,12032],[12245,12288],[12351,12353],[12438,12441],[12543,12549],[12589,12593],[12686,12688],[12730,12736],[12771,12784],[12830,12832],[13054,13056],[13312,19893],[19893,19904],[40869,40908],[40908,40960],[42124,42128],[42182,42192],[42539,42560],[42647,42655],[42743,42752],[42894,42896],[42899,42912],[42922,43000],[43051,43056],[43065,43072],[43127,43136],[43204,43214],[43225,43232],[43259,43264],[43347,43359],[43388,43392],[43469,43471],[43481,43486],[43487,43520],[43574,43584],[43597,43600],[43609,43612],[43643,43648],[43714,43739],[43766,43777],[43782,43785],[43790,43793],[43798,43808],[43814,43816],[43822,43968],[44013,44016],[44025,44032],[55203,55216],[55238,55243],[55291,63744],[64109,64112],[64217,64256],[64262,64275],[64279,64285],[64310,64312],[64316,64318],[64318,64320],[64321,64323],[64324,64326],[64449,64467],[64831,64848],[64911,64914],[64967,65008],[65021,65136],[65140,65142],[65276,66560],[66717,66720],[66729,67584],[67589,67592],[67592,67594],[67637,67639],[67640,67644],[67644,67647],[67669,67671],[67679,67840],[67867,67871],[67897,67903],[67903,67968],[68023,68030],[68031,68096],[68099,68101],[68102,68108],[68115,68117],[68119,68121],[68147,68152],[68154,68159],[68167,68176],[68184,68192],[68223,68352],[68405,68409],[68437,68440],[68466,68472],[68479,68608],[68680,69216],[69246,69632],[69709,69714],[69743,69760],[69825,69840],[69864,69872],[69881,69888],[69940,69942],[69955,70016],[70088,70096],[70105,71296],[71351,71360],[71369,73728],[74606,74752],[74850,74864],[74867,77824],[78894,92160],[92728,93952],[94020,94032],[94078,94095],[94111,110592],[110593,131072],[131072,173782],[173782,173824],[173824,177972],[177972,177984],[177984,178205],[178205,194560]
    ];
    var charCode, res, outputString, low;
    if (o.dontEncodeNonLatin){
      // split, check, encode conditionally
      outputString = inputString
        .split('')
        .map(function(value1,index1,array1){
          // if current character is surrogate's first pair, grab second-one from the next array1 element and concat both.
          if(0xD800 <= value1.charCodeAt(0) && value1.charCodeAt(0) <= 0xDBFF){
            // TODO: grab next array element if surrogate's first part identified
            low = array1[index1+1].charCodeAt(0);
            if (isNaN(low)) {
              // if the symbol is incomplete, instead of throw'ing an exception, just delete this first half
              value1 = '';
            } else {
              // concat next symbol with current, completing the character
              value1 = value1 + array1[index1+1];
              console.log('new value1='+value1);
              // delete the next array element, because it is now part of the current character
              array1.splice((index1+1), 1);
            }
          }
          res = value1;
          charCode = fixedCharCodeAt(value1);
          encodeRangesArray.forEach(function(value2){
            if (charCode > value2[0] && charCode < value2[1]) {
              res = he.encode(String(res), {
                'useNamedReferences': true
              });
            }
          });
          return res;

        })
        .join('');
    } else {
      // just encode all
      outputString = he.encode(String(inputString), {
        'useNamedReferences': true
      });
    }
    return outputString;
  }

  function doRemoveWidows(inputString) {

    // first, trim the trailing white space
    inputString = inputString.trim();
    var outputString;

    //var paragraphsArray = inputString.split('\n');
    var paragraphsArray = S(inputString).lines();
    var newParasArray = paragraphsArray.map(function(elem,index,array) {
      // if the current line has a line under it, this means it is not the last line of the paragraph and we have to skip widow removal procedure
      if ((array[index+1] !== void 0) && (array[index+1] !== '')){
        if (!S(elem).endsWith('.') && !S(elem).endsWith('?') && !S(elem).endsWith('!')) {
          return elem;
        }
      }

      var arrayOfStrings = S(elem).s.split(' ');
      var numberOfWords = arrayOfStrings.length;
      // if there are only three words or less - skip this line:
      if (numberOfWords < 4) {
        return elem;
      }
      var lengthOfLastWord = arrayOfStrings[numberOfWords - 1].length;
      var lengthOfSecondLastWord = 0;
      if (numberOfWords > 1) {
          lengthOfSecondLastWord = arrayOfStrings[numberOfWords - 2].length;
      }
      //use substring to chop string into two parts omitting the offender widow space
      var part1 = elem.substring(0, elem.length - lengthOfLastWord - 1);
      var part2 = elem.substring(elem.length - lengthOfLastWord, elem.length);

      //glue together, only with &nbsp; between them:
      if (part1.length > 0) {
        elem = part1 + '\u00A0' + part2;
      }
      return elem;
    });
    outputString = newParasArray.join('\n');
    return outputString;
  }

  function doConvertDashes(inputString) {
    var outputString = endashes(inputString);
    outputString = emdashes(outputString);
    outputString = S(outputString).replaceAll(' - ', '\u00A0\u2014 ').s;
    outputString = S(outputString).replaceAll(' \u2014 ', '\u00A0\u2014 ').s;
    return outputString;
  }



  //
  //       T H E    P I P E L I N E
  //

  // ================= xx =================

  // decode entities
  //cleanedText = S(cleanedText).decodeHTMLEntities().s;
  cleanedText = he.decode(cleanedText);

  // ================= xx =================

  // fix clearly wrong things, such as space-full stop occurencies:
  cleanedText = S(cleanedText).replaceAll(' .', '.').s;
  // space-comma as well:
  cleanedText = S(cleanedText).replaceAll(' ,', ',').s;

  // ================= xx =================

  // replace all occurencies of broken "&nbsp;" (where one char is missing) with a space

  cleanedText = S(cleanedText).replaceAll('nbsp;', ' ').s;
  // there is safeguard for "text&nbsptext" already thanks to Mathias' he.js


  // ================= xx =================

  // invisibles being removed
  cleanedText = doRemoveInvisibles(cleanedText);

  // ================= xx =================

  // remove unpaired surrogates
  cleanedText = unicodeDragon(cleanedText);
  cleanedText = S(cleanedText).replaceAll('\uFFFD', '').s;

  // ================= xx =================

  // replace all invisible characters that can be interpreted as line breaks
  // see https://en.wikipedia.org/wiki/Newline#Unicode
  if (o.removeLineBreaks === false) {
    lineBreakCharacters.forEach(function (elem) {
      cleanedText = S(cleanedText).replaceAll(elem, '\n').s;
    });
  } else {
    lineBreakCharacters.forEach(function (elem) {
      if (elem !== '\u000A') {
        cleanedText = S(cleanedText).replaceAll(elem, '').s;
      }
    });
  }

  // ================= xx =================

  // replace the tabs with spaces
  cleanedText = S(cleanedText).replaceAll('\u0009', ' ').s;
  cleanedText = S(cleanedText).replaceAll('\t', ' ').s;

  // ================= xx =================

  cleanedText = doCollapseWhiteSpace(cleanedText);
  cleanedText = trimTrailingSpaces(cleanedText);

  // ================= xx =================

  // optionally, remove all line breaks (off by default, overrides other settings)
  if (o.removeLineBreaks === true) {
    cleanedText = doDecodeBRs(cleanedText);
    cleanedText = S(cleanedText).replaceAll('\n', ' ').s;
    cleanedText = doCollapseWhiteSpace(cleanedText);
  }

  // ================= xx =================

  // optionally remove all soft hyphens, on by default
  if (o.removeSoftHyphens === true) {
    cleanedText = doRemoveSoftHyphens(cleanedText);
  }

  // ================= xx =================

  // optionally preserve bold, italic, strong and em - on by default
  if (o.keepBoldEtc === true) {
    cleanedText = encryptBoldItalic(cleanedText);
  }

  // ================= xx =================

  // BR's also
  cleanedText = doDecodeBRs(cleanedText);

  // ================= xx =================

  // trim leading and trailing line breaks
  cleanedText = trimTrailingLineBreaks(cleanedText);

  // ================= xx =================

  // now BR's are secure, let's strip all the remaining HTML
  cleanedText = S(cleanedText).stripTags().s;

  // ================= xx =================

  // trim leading and trailing white space on each line
  cleanedText = trimTrailingSpaces(cleanedText);

  // ================= xx =================

  // replace the tabs with spaces
  cleanedText = S(cleanedText).replaceAll('\u0009', ' ').s;
  cleanedText = S(cleanedText).replaceAll('\t', ' ').s;
  cleanedText = doCollapseWhiteSpace(cleanedText);

  // ================= xx =================

  // optionally, fix widow words (on by default)
  if (o.removeWidows === true) {
    cleanedText = doRemoveWidows(cleanedText);
  }

  // ================= xx =================

  // convert apostrophes and quotation marks into fancy ones
  if (o.convertApostrophes === true) {
    cleanedText = curl(cleanedText);
  }

  // ================= xx =================

  // optionally, convert dashes to typographically correct-ones (on by default)
  if (o.convertDashes === true) {
    cleanedText = doConvertDashes(cleanedText);
  }

  // ================= xx =================

  // optionally, encode non-ASCII characters into named entities (on by default)
  if (o.convertEntities === true) {
    cleanedText = doConvertEntities(cleanedText);
  }

  // ================= xx =================

  // check for mis-typed character references:
  // 1. 100% wrong stuff - starts with ampersand, semicolon missing:
  for (var i = 0, len = entityRefs.length; i < len; i++) {
    cleanedText = cleanedText.replace(new RegExp((escapeRegex('&amp;' + entityRefs[i])+'(?!;)'), 'gm'), ('&' + entityRefs[i] + ';'));
  }

  // ================= xx =================

  // now restore any encrypted b, strong, em and i tags - on by default
  if (o.keepBoldEtc === true) {
    cleanedText = decryptBoldItalic(cleanedText);
  }

  // ================= xx =================

  // optionally, replace line breaks with BR (on by default)
  if ((o.replaceLineBreaks=== true) && (o.removeLineBreaks === false)) {
    if (o.useXHTML){
      cleanedText = S(cleanedText).replaceAll('\n', '<br />\n').s;
    }else{
      cleanedText = S(cleanedText).replaceAll('\n', '<br>\n').s;
    }
  }

  // ================= xx =================

  // also, restore single apostrophes if any were encoded:
  cleanedText = S(cleanedText).replaceAll('&apos;', '\'').s;

  // final trims:
  cleanedText = doCollapseWhiteSpace(cleanedText);
  cleanedText = trimTrailingSpaces(cleanedText);
  cleanedText = trimTrailingLineBreaks(cleanedText);

  // repeated:
  // fix clearly wrong things, such as space-full stop occurencies:
  cleanedText = S(cleanedText).replaceAll(' .', '.').s;
  // repeated:
  // space-comma as well:
  cleanedText = S(cleanedText).replaceAll(' ,', ',').s;

  // ================= xx =================

  return cleanedText;
}

module.exports = detergent;
