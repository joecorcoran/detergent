'use strict'

const he = require('he')
const S = require('string')
const curl = require('curl-quotes')
const unicodeDragon = require('unicode-dragon')
const numericEnt = require('./enforced-numeric-entities-list.json')
const er = require('easy-replace')
const objectAssign = require('object-assign')
const clone = require('lodash.clonedeep')
const isObj = require('lodash.isplainobject')

const util = require('./util')
const doRemoveInvisibles = util.doRemoveInvisibles
const doRemoveSoftHyphens = util.doRemoveSoftHyphens
const doDecodeBRs = util.doDecodeBRs
const encryptBoldItalic = util.encryptBoldItalic
const decryptBoldItalic = util.decryptBoldItalic
const trimTrailingSpaces = util.trimTrailingSpaces
const trimTrailingLineBreaks = util.trimTrailingLineBreaks
const doCollapseWhiteSpace = util.doCollapseWhiteSpace
const doConvertEntities = util.doConvertEntities
const doRemoveWidows = util.doRemoveWidows
const doRemoveWidowDashes = util.doRemoveWidowDashes
const doConvertDashes = util.doConvertDashes
const doAddSpaceAfterDashes = util.doAddSpaceAfterDashes
const doInterpretErroneousNBSP = util.doInterpretErroneousNBSP
const fixMissingAmpsAndSemicols = util.fixMissingAmpsAndSemicols
const addMissingSpaces = util.addMissingSpaces
const defaultsObj = util.defaultsObj

/**
 * detergent - main function
 *
 * @param  {string} textToClean   some text
 * @param  {object} o             an optional options object
 * @return {string}               cleaned text
 */
function detergent (textToClean, o) {
  function isBool (something) { return typeof something === 'boolean' }
  var cleanedText = String(textToClean)
  if ((arguments.length > 1) && !isObj(o)) {
    throw new Error('detergent(): [THROW_ERROR_ID01] Options object must be a plain object, not ' + typeof o)
  }
  // defaults object is in util.js to keep it DRY
  o = objectAssign(clone(defaultsObj), o)
  Object.keys(o).forEach(function (key, i) {
    if (!isBool(o[key])) {
      throw new Error('detergent(): [THROW_ERROR_ID0' + (2 + i) + '] Options object\'s key ' + key + ' should be Boolean, not ' + typeof key + ', equal to: ' + JSON.stringify(o[key], null, 4))
    }
  })

  var lineBreakCharacters = [
    '\u000a', '\u000b', '\u000c', '\u000d', '\u0085', '\u2028', '\u2029', '\u0003'
  ] // CR+LF, (U+000D and U+000A) combination will yield two line breaks on Detergent.

  // first three characters only:
  var knownExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'jso', 'htm', 'pdf', 'psd', 'tar', 'zip', 'rar', 'otf', 'ttf', 'jsp', 'php', 'rss', 'asp', 'ppt', 'doc', 'txt', 'rtf', 'git']

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
    for (let i = 0, len = lineBreakCharacters.length; i < len; i++) {
      cleanedText = S(cleanedText).replaceAll(lineBreakCharacters[i], '\n').s
    }
  } else {
    for (let i = 0, len = lineBreakCharacters.length; i < len; i++) {
      if (lineBreakCharacters[i] !== '\u000A') {
        cleanedText = S(cleanedText).replaceAll(lineBreakCharacters[i], '').s
      }
    }
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
  if (o.addMissingSpaces) {
    cleanedText = addMissingSpaces(cleanedText)
  }

  // ================= xx =================

  // fix clearly wrong things, such as space-full stop occurencies:
  cleanedText = er(
    cleanedText,
    {
      leftOutsideNot: '',
      leftOutside: '',
      leftMaybe: '',
      searchFor: ' .',
      rightMaybe: '',
      rightOutside: '',
      rightOutsideNot: knownExtensions
    },
    '.'
  )
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
    cleanedText = doConvertEntities(cleanedText, o.dontEncodeNonLatin)
    cleanedText = S(cleanedText).replaceAll('&hairsp;', ' ').s
  }

  // ================= xx =================

  // clean up after converting entities:
  // some entities can't be emailed in named form, only
  // in numeric-one:

  if (o.convertEntities) {
    // cleanedText = S(cleanedText).replaceAll('&hairsp;', ' ').s
    let numerics = Object.keys(numericEnt)
    for (let i = 0, len = numerics.length; i < len; i++) {
      cleanedText = S(cleanedText).replaceAll(numerics[i], numericEnt[numerics[i]]).s
    }
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
  cleanedText = er(
    cleanedText,
    {
      leftOutsideNot: '',
      leftOutside: '',
      leftMaybe: '',
      searchFor: ' .',
      rightMaybe: '',
      rightOutside: '',
      rightOutsideNot: knownExtensions
    },
    '.'
  )
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
