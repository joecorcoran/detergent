'use strict'

const he = require('he')
const S = require('string')
const curl = require('curl-quotes')
const unicodeDragon = require('unicode-dragon')
const numericEnt = require('./enforced-numeric-entities-list.json')
const isObj = require('lodash.isplainobject')
const checkTypes = require('check-types-mini')
const doCollapseWhiteSpace = require('string-collapse-white-space')

// preparing for ops on input as a string:
const Slices = require('string-slices-array-push/es5') // ranges managing library
const replaceSlicesArray = require('string-replace-slices-array/es5') // applies ranges onto a string
var rangesArr = new Slices() // the main container to gather the ranges. Slices is a JS class.

const util = require('./util')
const doDecodeBRs = util.doDecodeBRs
const encryptBoldItalic = util.encryptBoldItalic
const decryptBoldItalic = util.decryptBoldItalic
const trimTrailingSpaces = util.trimTrailingSpaces
const doConvertEntities = util.doConvertEntities
const doRemoveWidows = util.doRemoveWidows
const doRemoveWidowDashes = util.doRemoveWidowDashes
const doConvertDashes = util.doConvertDashes
const doInterpretErroneousNBSP = util.doInterpretErroneousNBSP
const fixMissingAmpsAndSemicols = util.fixMissingAmpsAndSemicols
const defaultsObj = util.defaultsObj
const isUppercaseLetter = util.isUppercaseLetter
const isLowercaseLetter = util.isLowercaseLetter
const isLetter = util.isLetter
const isNumeric = util.isNumeric

/**
 * detergent - main function
 *
 * @param  {string} textToClean   some text
 * @param  {object} o             an optional options object
 * @return {string}               cleaned text
 */
function detergent (str, o) {
  var i, y, len
  function existy (x) { return x != null }
  str = String(str)
  if ((arguments.length > 1) && !isObj(o)) {
    throw new Error('detergent(): [THROW_ERROR_ID01] Options object must be a plain object, not ' + typeof o)
  }
  // defaults object (`defaultsObj`) is in util.js to keep it DRY
  // fill any settings with defaults if missing:
  o = Object.assign({}, defaultsObj, o)
  for (var prop in o) {
    if (o[prop] === 1) {
      o[prop] = true
    } else if (o[prop] === 0) {
      o[prop] = false
    }
  }
  // the options object's check:
  checkTypes(o, defaultsObj, {msg: 'detergent(): [THROW_ERROR_ID02*]', optsVarName: 'opts'})

  //                           ____
  //          massive hammer  |    |
  //        O=================|    |
  //          upon all bugs   |____|
  //
  //                         .=O=.
  //
  //       T H E    P I P E L I N E
  //

  // ---------------------------------------------------------------------------
  // STEP 1.
  //
  // All ops that prepare us to the moment when we will be able to iterate
  // the string and perform check on character-level.
  // But first, let's decode and patch up things.

  // ================= xx =================

  // replace all occurencies of broken "nbsp;" (where ampersand is missing) with a "&nbsp;"
  str = doInterpretErroneousNBSP(str)
  // all other mis-typed character references - missing ampersand and/or semicolon
  str = fixMissingAmpsAndSemicols(str)
  // ================= xx =================

  // decode entities
  // recursive decode until there's no difference anymore
  while (str !== he.decode(str)) {
    str = he.decode(str)
  }
  // remove unpaired surrogates and turn BR's into new lines
  str = doDecodeBRs(unicodeDragon(str))

  // replace line breaks upfront because the traversal needs to see whole picture
  if (o.removeLineBreaks) {
    str = S(str).replaceAll('\n', ' ').s
  }

  // ---------------------------------------------------------------------------
  // STEP 2.
  //
  // Once operations on "words" are done, we can begin operations on "letters",
  // or, rather, "characters". At this point, checks are not dependent on the
  // surroundings - for example, if it's invisible character, put it up for deletion.
  // It does not matter what is around it. Compare that to previous step, where
  // we were decoding HTML entities and it mattered what's around - for example,
  // missing semicolon on HTML entity should be restored before it's decoded -
  // there's relationship between lump of characters.

  var onUrlCurrently = false
  var numCode
  var scriptTagStarts = null
  let lastIndexOfTheLastOfDotsInRow = null
  var allOK = true // global flipswitch that's activated where we need to skip
  // all the checking, for example within <script> tags.
  // ================= xx =================
  // We can't traverse backwards because of URL detection.
  // It would not work easily that way.

  for (i = 0, len = str.length; i < len; i++) {
    // ***
    //  1. delete static invisible Unicode control characters & BOM and
    //     replace the control characters that can be interpreted as line breaks with `\n`
    //     replace some others with spaces (for example, hairspaces and tabs)
    // ***
    //  2. add missing spaces after minus, N- & M-dashes
    // ***
    //  3. add line breaks in front of </ul> and <li>
    // ***
    //  4. remove soft hyphens
    //

    // for performance reasons, we won't iterate the invisibles array, but if-else
    // over the values.
    numCode = str[i].codePointAt(0)
    if ((numCode < 32) && allOK) {
      if (numCode < 9) {
        if (numCode === 3) {
          // that's \u0003, END OF TEXT - replace with line break
          rangesArr.add(i, i + 1, o.removeLineBreaks ? ' ' : '\n')
        } else {
          // numCodes: [0;2], [4;8] - remove these control chars
          rangesArr.add(i, i + 1)
        }
      } else if (numCode === 9) {
        // Replace all tabs, '\u0009', with spaces:
        rangesArr.add(i, i + 1, ' ')
      } else if (numCode === 10) {
        // 10 - "\u000A" - line feed, LF
        if (o.removeLineBreaks) {
          rangesArr.add(i, i + 1, ' ')
        }
        //
        // URL detection:
        //
        onUrlCurrently = false
      } else if ((numCode === 11) || (numCode === 12) || (numCode === 13)) {
        // 11 - "\u000B" - tab
        // 12 - "\u000C" - form feed
        // 13 - "\u000D" - carriage return
        rangesArr.add(i, i + 1, o.removeLineBreaks ? '' : '\n')
      } else if (numCode > 13) {
        // numCodes: [14;31] - remove these control chars
        rangesArr.add(i, i + 1)
      }
    } else if ((numCode > 126) && (numCode < 160) && allOK) {
      // C1 group
      if (numCode !== 133) {
        // over thirty characters, so they are statistically more likely to happen:
        rangesArr.add(i, i + 1)
      } else {
        // only codepoint 133, statistically less probable so comes second:
        rangesArr.add(i, i + 1, o.removeLineBreaks ? '' : '\n')
      }
    } else if (((numCode === 8232) || (numCode === 8233)) && allOK) {
      // '\u2028', '\u2029'
      rangesArr.add(i, i + 1, o.removeLineBreaks ? '' : '\n')
    } else if (((numCode === 44) || (numCode === 59)) && allOK) {
      // IF COMMA (,) OR SEMICOLON (;)
      if (str[i - 1] === ' ') {
        // march backwards
        for (y = i - 1; y--;) {
          if (str[y] !== ' ') {
            rangesArr.add(y + 1, i)
            break
          }
        }
      }
    } else if ((numCode === 58) && allOK) {
      // IF COLON (:)
      //
      // URL detection
      //
      if (existy(str[i + 2]) && (str[i + 1] === '/') && (str[i + 2] === '/')) {
        onUrlCurrently = true
      }
    } else if ((numCode === 119) && allOK) {
      // IF LETTER W
      //
      // URL detection
      //
      if (existy(str[i + 2]) && (str[i + 1].toLowerCase() === 'w') && (str[i + 2].toLowerCase() === 'w')) {
        onUrlCurrently = true
      }
    } else if (numCode === 32) {
      // IF SPACE CHARACTER
    } else if (numCode === 46) {
      // IF DOT CHARACTER
      // THERE'S MORE LOGIC BELOW IN STEP #2 BTW
      //
      if (
        str[i + 2] !== undefined &&
        ((str[i + 1] + str[i + 2]) === '..') &&
        ((lastIndexOfTheLastOfDotsInRow === null) || (lastIndexOfTheLastOfDotsInRow < i))
      ) {
        if (
          (
            (str[i + 3] === undefined) || (str[i + 3] !== '.')
          )
        ) {
          // there are only three dots, that's cool
          if (o.convertDotsToEllipsis) {
            rangesArr.add(i, i + 3, '\u2026')
          }
        } else {
          // there's bunch of dots, so let's bail and make sure all this train of
          // dots is immune from conversion to ellipses
          for (let y = i + 3; y < len; y++) {
            if ((str[y] !== '.') || (str[y + 1] === undefined)) {
              lastIndexOfTheLastOfDotsInRow = y
              break
            }
          }
        }
      }
    } else if ((numCode === 8212) && allOK) {
      // IF M DASH
      //
      // add a space after m dash, '\u2014' if there's preceding-one
      if (
        ((str[i - 1] === ' ') || (str[i - 1] === '\xa0') || (str[i - 1] === '\u200A')) &&
        (str[i + 1] !== ' ')
      ) {
        rangesArr.add(i + 1, i + 1, ' ')
      }
    } else if ((numCode === 8211) && allOK) {
      // IF N DASH
      //
      // add a space after n dash, '\u2013' if there's preceding-one
      if (
        ((str[i - 1] === ' ') || (str[i - 1] === '\xa0') || (str[i - 1] === '\u200A')) &&
        (str[i + 1] !== ' ')
      ) {
        rangesArr.add(i + 1, i + 1, ' ')
      }
    } else if ((numCode === 45) && allOK) {
      // IF MINUS SIGN, codepoint 45
      // add space after minus/dash character if there's nbsp or space in front of it,
      // but the next character is not currency or digit.
      // That's to prevent the space addition in front of legit minuses.
      if (
        ((str[i - 1] === '\xa0') || (str[i - 1] === ' ')) &&
        (str[i + 1] !== '$') && (str[i + 1] !== '£') && (str[i + 1] !== '€') && (str[i + 1] !== '₽') &&
        (str[i + 1] !== '0') && (str[i + 1] !== '1') && (str[i + 1] !== '2') && (str[i + 1] !== '3') &&
        (str[i + 1] !== '4') && (str[i + 1] !== '5') && (str[i + 1] !== '6') && (str[i + 1] !== '7') &&
        (str[i + 1] !== '8') && (str[i + 1] !== '9')
      ) {
        // add space after it:
        rangesArr.add(i + 1, i + 1, ' ')
      }
    } else if ((numCode === 60) && allOK) {
      // IF LESS THAN SIGN, <
      // add line breaks in front of </ul> and <li>.
      // This is to make HTML lists look nicer after tag-stripping.
      if (
        (str[i + 1] + str[i + 2] + str[i + 3] === '/ul') ||
        (str[i + 1] + str[i + 2] === 'li')
      ) {
        rangesArr.add(i, i, o.removeLineBreaks ? ' ' : '\n') // adding on current index will still insert right in front of it
        // to add after, add on next index
      }
      // Catch opening script tag, "<script"
      if (str[i + 1] + str[i + 2] + str[i + 3] + str[i + 4] + str[i + 5] + str[i + 6] === 'script') {
        scriptTagStarts = i
        allOK = false
      }
    } else if ((numCode === 47) && !allOK) {
      // IF RIGHT SLASH, /
      // Catch closing script tag, "/script"
      // Specifically we don't rely on left bracket because there might be spaces
      // between opening < and right slash (of "/script").
      // But we don't care about opening part of the tag, it will go anyway.
      // We care about closing </script> closing bracket, ">". We'll delete until here.
      if (
        (scriptTagStarts !== null) &&
        (str[i + 1] + str[i + 2] + str[i + 3] + str[i + 4] + str[i + 5] + str[i + 6] === 'script')
      ) {
        allOK = true
        if (str[i + 7] === '>') {
          rangesArr.add(scriptTagStarts, i + 8)
        } else if (str[i + 7] === undefined) {
          rangesArr.add(scriptTagStarts, i + 7)
        } else {
          // traverse forward and find the bloody closing bracket
          for (let y = i + 7; y < len; y++) {
            if ((str[y] === '>') || str[y + 1] === undefined) {
              rangesArr.add(scriptTagStarts, y + 1)
              break
            }
          }
        }
        scriptTagStarts = null
      }
    } else if ((numCode === 8230) && allOK) {
      // IF UNENCODED HORIZONTAL ELLIPSIS CHARACTER &hellip;
      if (!o.convertDotsToEllipsis) {
        rangesArr.add(i, i + 1, '...')
      }
    } else if (numCode === 8202) {
      // replace all hairspace chars, '\u200A' with spaces
      rangesArr.add(i, i + 1, ' ')
    } else if (numCode === 65533) {
      // Delete all cases of Replacement character, \uFFFD:
      rangesArr.add(i, i + 1)
    } else if (numCode === 65279) {
      // BOM, '\uFEFF'
      rangesArr.add(i, i + 1)
    } else if (numCode === 173) {
      // soft hyphen, '\u00AD'
      if (o.removeSoftHyphens) {
        rangesArr.add(i, i + 1)
      }
    }

    if (lastIndexOfTheLastOfDotsInRow < i) {
      lastIndexOfTheLastOfDotsInRow = null
    }

    // PART II.
    // add missing space after full stop or comma except on extensions and URL's
    if (str[i] === '.') {
      var first = existy(str[i + 1]) ? str[i + 1].toLowerCase() : ''
      var second = existy(str[i + 2]) ? str[i + 2].toLowerCase() : ''
      var third = existy(str[i + 3]) ? str[i + 3].toLowerCase() : ''
      var fourth = existy(str[i + 4]) ? str[i + 4].toLowerCase() : ''
      var nextThreeChars = first + second + third
      if (
        ((first + second) !== 'js') &&
        (nextThreeChars !== 'jpg') &&
        (nextThreeChars !== 'png') &&
        (nextThreeChars !== 'gif') &&
        (nextThreeChars !== 'svg') &&
        (nextThreeChars !== 'htm') &&
        (nextThreeChars !== 'pdf') &&
        (nextThreeChars !== 'psd') &&
        (nextThreeChars !== 'tar') &&
        (nextThreeChars !== 'zip') &&
        (nextThreeChars !== 'rar') &&
        (nextThreeChars !== 'otf') &&
        (nextThreeChars !== 'ttf') &&
        (nextThreeChars !== 'eot') &&
        (nextThreeChars !== 'php') &&
        (nextThreeChars !== 'rss') &&
        (nextThreeChars !== 'asp') &&
        (nextThreeChars !== 'ppt') &&
        (nextThreeChars !== 'doc') &&
        (nextThreeChars !== 'txt') &&
        (nextThreeChars !== 'rtf') &&
        (nextThreeChars !== 'git') &&
        ((nextThreeChars + fourth) !== 'jpeg') &&
        ((nextThreeChars + fourth) !== 'html') &&
        ((nextThreeChars + fourth) !== 'woff')
      ) {
        // two tasks: deleting any spaces before and adding spaces after
        //
        // 1. ADDING A MISSING SPACE AFTER IT:
        if (
          o.addMissingSpaces &&
          (str[i + 1] !== undefined) &&
          (
            // - When it's not within a URL, the requirement for next letter to be uppercase letter. This prevents both numbers with decimal digits and short url's like "detergent.io"
            // - When it's within URL, it's stricter:
            //   next letter has to be an uppercase letter, followed by lowercase letter.
            (!onUrlCurrently && isUppercaseLetter(str[i + 1])) ||
            (
              onUrlCurrently &&
              isLetter(str[i + 1]) &&
              isUppercaseLetter(str[i + 1]) &&
              isLetter(str[i + 2]) &&
              isLowercaseLetter(str[i + 2])
            )
          ) &&
          (str[i + 1] !== ' ') &&
          (str[i + 1] !== '.') &&
          (str[i + 1] !== '\n')
        ) {
          rangesArr.add(i + 1, i + 1, ' ')
        }

        // 2. REMOVING SPACES BEFORE IT:
        if (
          (str[i - 1] !== undefined) &&
          (str[i - 1].trim() === '') &&
          (str[i + 1] !== '.') &&
          ((str[i - 2] === undefined) || (str[i - 2] !== '.')) // that's for cases: "aaa. . " < observe second dot.
        ) {
          // march backwards
          for (y = i - 1; y--;) {
            if (str[y].trim() !== '') {
              rangesArr.add(y + 1, i)
              break
            }
          }
        }
      }
    } else if (str[i] === ',') {
      if (
        o.addMissingSpaces &&
        (str[i + 1] !== undefined) &&
        !onUrlCurrently &&
        !isNumeric(str[i + 1]) &&
        (str[i + 1] !== ' ') &&
        (str[i + 1] !== '\n')
      ) {
        // comma, not on URL, not followed by number = add space afterwards
        rangesArr.add(i + 1, i + 1, ' ')
      }
    } else if (str[i] === ';') {
      // -----
      if (
        o.addMissingSpaces &&
        (str[i + 1] !== undefined) &&
        !onUrlCurrently &&
        (str[i + 1] !== ' ') &&
        (str[i + 1] !== '\n') &&
        (str[i + 1] !== '&') &&
        (str[i + 1] !== '\xa0') &&
        allOK
      ) {
        rangesArr.add(i + 1, i + 1, ' ')
      }
      // -----
    }
  }
  // apply the result:
  if (existy(rangesArr.current()) && rangesArr.current().length > 0) {
    str = replaceSlicesArray(str, rangesArr.current())
  }
  rangesArr.wipe() // wipe the ranges, we don't need them...

  // ================= xx =================

  str = doCollapseWhiteSpace(str)

  // ================= xx =================

  // optionally preserve bold, italic, strong and em - on by default
  if (o.keepBoldEtc) {
    str = encryptBoldItalic(str)
  }

  // ================= xx =================

  // now that tags are secure, let's strip all the remaining HTML
  str = S(str).stripTags().s

  // ================= xx =================

  // trim leading and trailing white space on each line
  str = trimTrailingSpaces(str)

  // ================= xx =================

  // optionally, fix widow words (on by default)
  if (o.removeWidows) {
    str = doRemoveWidows(str)
    // optionally, replace spaces before m dashes with non-breaking spaces
    str = doRemoveWidowDashes(str)
  }

  // ================= xx =================

  // convert apostrophes and quotation marks into fancy ones
  if (o.convertApostrophes) {
    str = curl(str)
  }

  // ================= xx =================

  // optionally, convert dashes to typographically correct-ones (on by default)
  if (o.convertDashes) {
    str = doConvertDashes(str, o.removeWidows)
  }

  // ================= xx =================

  // optionally, encode non-ASCII characters into named entities (on by default)
  if (o.convertEntities) {
    str = doConvertEntities(str, o.dontEncodeNonLatin)
    str = S(str).replaceAll('&mldr;', '&hellip;').s
    str = S(str).replaceAll('&apos;', '\'').s
  }

  // ================= xx =================

  // clean up after converting entities:
  // some entities can't be emailed in named form, only
  // in numeric-one:

  if (o.convertEntities) {
    var numerics = Object.keys(numericEnt)
    for (y = numerics.length; y--;) { // loop backwards for better efficiency
      str = S(str).replaceAll(numerics[y], numericEnt[numerics[y]]).s
    }
  }

  // ================= xx =================

  // optionally, replace line breaks with BR (on by default)
  if ((o.replaceLineBreaks) && (!o.removeLineBreaks)) {
    if (o.useXHTML) {
      str = S(str).replaceAll('\n', '<br />\n').s
    } else {
      str = S(str).replaceAll('\n', '<br>\n').s
    }
  }

  // ================= xx =================

  // now restore any encrypted b, strong, em and i tags - on by default
  if (o.keepBoldEtc) {
    str = decryptBoldItalic(str)
  }

  // ================= xx =================

  // final trims:
  str = doCollapseWhiteSpace(str)
  str = trimTrailingSpaces(str)

  // ================= xx =================
  return {
    res: str
  }
}

module.exports = {
  detergent,
  opts: defaultsObj
}
