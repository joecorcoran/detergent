# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [3.0.0] - 2017-09-13
### 3 Things Changed
- ✨💥✨ Main exports of the module is not the main `detergent()` function, but an object which contains `detergent()` function and default options object as two separate keys:

```js
module.exports = {
  detergent: detergent,
  opts: defaultsObj
}
```

This means, from now on, import Deterent like this:

```js
const detergent = require('detergent').detergent;
```

I'm building a new front-end for detergent.io and I want to automate the options list, that's why I need the `opts` exported.

- ✨💥✨ The result of the main function `detergent()` is now not a string but an object. Result is now placed under key `res`. This is done so I can place additional info in the future, what was added or removed exactly, what kinds of invisible characters were encountered and so on.
- ✨ Removed `JS Standard` and switched to raw `eslint` with `airbnb-base` config preset with 2 overrides: 1. no semicolons. 2. allowing plus-plus in `for` loops. For posterity JS Standard is using half-year old version of ESLint and its config is too relaxed, it's ignoring many good practice rules.

## [2.32.0] - 2017-09-07

The previous algorithm was not aiming for anything specific, which led to a goal of easy to read and develop code. Rest was secondary (correctness aside of course). In this rebase issue, the main aim is efficiency (besides correctness): both when ran by JS engine as well as algorithm's in general.

I implemented JS optimisations like `for` looping backward (optimisation for JS engine) and general ones like cutting down on operations and making them only when it's the best time to do so. I reviewed all locations of all functions and weighed are they necessary at all (or can they be replaced by something more efficient).

I separated all the operations performed on input into three stages: **the first stage** is blanket operations to prepare text, like decoding and broken code patching. **Second stage** is new, we traverse the string character-by-character and perform all the operations that can be performed at such level. **Third stage** is the rest, a set of consecutive functions mutating the result one-after-another until it's done.

This second stage relieved us from roughly half of the blanked functions that previously mutated the string again and again. Now, all deletion/insertion procedures are recorded during (a single) traversal in Step 2; then a string is crunched in one go. It's done using combo of [string-slices-array-push](https://github.com/codsen/string-slices-array-push) and [string-replace-slices-array](https://github.com/codsen/string-replace-slices-array).

### Added
- ✨ Horizontal ellipsis is converted only when there are three dots in one lump, not more and setting is on. Gung-ho regex replacements would not do this correctly by the way.
- ✨ Horizontal ellipsis switch makes the journey strictly either way: either all kinds of what could be interpreted as ellipsis are converted to fancy &hellip; (or unencoded character if the encoding is turned off) OR those above are converted to dot dot dot. There are no gray cases. Unlike before.
- ✨ Script tags are now stripped together with their contents. Solves #15, thanks @nacimgoura
- ✨ More tests to thoroughly prove that single quotes in any format (`'`) are not encoded. Ever. They can be converted to fancy single quote, but in a single straight shape, they should always stay the same.
### Removed
- 💥 `upper-case` dependency. It was buggy, by the way, reporting '1' as uppercase. For those concerned that didn't affect Detergent's correctness.
- 💥 `lower-case` dependency. It was buggy as well. Same thing.

## [2.31.0] - 2017-08-28
### Added
- ✨ `opts.convertDotsToEllipsis` - now you can customise, do you want three dots converted to horizontal ellipsis, `&hellip;`, or not.
- ✨ Tapped [check-types-mini](https://github.com/codsen/check-types-mini) to enforce peace and order within an options object. Now unrecognised options object's keys will `throw` as well.
### Removed
- 💥 Dependency `lodash.clonedeep` - the `Object.assign` against an empty object does the same job - it does not mutate the input arguments.

## [2.30.0] - 2017-07-20
### Added
- ✨ Bunch of new badges to readme.
- ✨ `.npmignore` and added `/media/` to it, along all dotfiles. This will reduce your npm installation footprint.

## [2.29.0] - 2017-07-20
### Added
- ✨ Feature for issue [#14](https://github.com/codsen/detergent/issues/14) - Detergent strips all HTML (except bolt/italic/strong/em) code, but in the process, some content might be misformatted. For example, the content in unordered lists would get bunged up together without spaces. Now that's fixed. By default, every `<li>` will be put onto a new line, as well as closing `</ul>`. If you want everything on one line, set `opts.removeLineBreaks` to `true`.
### Removed
- 💥 Some Lodash dependencies, replacing them with native ES6-ones.

## [2.28.0] - 2017-07-08
### Removed
- 💥 As the features grew, the "Builds" time on Travis grew too. Currently Travis fails around 50% of the cases because it hits 50 minutes mark while running the end-to-end unit tests. Therefore, I'm removing Travis for good. It makes no sense anyway, as there are no "Builds" for this library, only unit tests, which can be ran locally.

## [2.27.0] - 2017-07-08
### Updated
- ✨ Code refresh: updated all deps, generated up-to-date `package-lock` and did some small code rebasing related to all this.

## [2.26.0] - 2017-04-12
### Added
- ✨ Options key `o.addMissingSpaces` now allows you to control, do you want to add missing spaces after full stops/colons/semicolons, or not. This does not break the API as the new default setting matches previously non-customiseable setting.

## [2.25.0] - 2017-04-07
### Improved
- ✨ Tiny rebasing: separated all functions into util.js, added some measures to protect against options object settings in wrong type (values other type than Boolean).

## [2.24.0] - 2017-04-05
### Improved
- ✨ Widows won't be added if there's right closing slash following the space. Also, they won't be added if there's `hr` or `br` preceding the space. This is necessary to cater the cases when Detergent is being ran on a code which has concealed HTML tags where brackets are swapped with custom strings. For example, cases like `aaaaaaaaaaa%%%1br /%%%2aaaaaaaaaaa` should get identified as concealed HTML and widow removal should not be triggered.
### Removed
- 💥 `strip-bom` library dependency was redundant; '\uFEFF' was already in the invisible character list and removed along all other invisibles.

## [2.23.0] - 2017-03-24
### Improved
- ✨ Swooping in on full stop + letter fixes. I found the file names where extension is mentioned get separated into two parts. I came up with the idea: two errors rarely happen at one place. "string1.string2" is a double error because space after full stop is missing and letter that follows is in capital. This leads to the algorithm:

If there is no space after full stop, and letter that follows is uppercase, add a full stop. If lowecase letter follows full stop, leave it as it is.

Additionally, the algorithm is now checking, does any of the known extensions follow the full stop (in any case). If so, space between the full stop and extension is not added. This should cover all false positives where file names are involved.

## [2.22.0] - 2017-03-22
### Improved
- ✨ Now correctly recognises and ignores legitimate minus signs, such as `-20°C` when it comes after a space. If algorithm will detect a number of curency symbol after a dash, it will not add a space after it or turn it into an m-dash. It does not matter now, a space character precedes all that or not.
- Updated Husky to latest.
### Added
- ✨ More tests.
### Changed
- 🔧 Now consuming JS Standard linter in normal fashion, not "any latest", but within the current _major_ range.

## [2.21.0] - 2017-03-09
### Added
- ✨ Removes [byte order mark](https://en.wikipedia.org/wiki/Byte_order_mark#UTF-8) (BOM).

## [2.20.0] - 2017-02-22
### Added
- ✨ Widow removal now identifies UK postcodes and replaces the space with non-breaking space.

## [2.19.0] - 2017-01-04
### Added
- ✨ URL recognition — now Detergent won't add spaces within an URL.
- ✨ New tests — to maintain the coverage and prove the surrounded text is cleaned correctly as before.

## [2.18.0] - 2016-12-23
### Added
- ✨ JS Standard on a precommit hook to enforce an order everywhere
- ✨ Tweaks for BitHound to ignore the fact that we are going to use the _latest version_ `AVA`, `Coveralls` and `Standard` no matter what, to reduce maintenance time spent on all my libraries.
- ✨ Some tweaks to completely pass JS Standard (there were redundant regex escapes for example)

## 2.17.0 - 2016-12-21
### Added
- ✨ Test coverage and a badge
- ✨ Changelog
- ✨ Tweaked travis and bithound setup files
- ✨ Hardened the .gitignore
- ✨ Consolidated Readme badge links to svg's and url's in the footer

### Fixed
- 🔧 Renamed some tests to match better what's inside
- 🔧 The latest AVA (*) is requested with an ignore on the BitHound

[2.17.0]: https://github.com/codsen/detergent/compare/v2.16.0...v2.17.0
[2.18.0]: https://github.com/codsen/detergent/compare/v2.17.0...v2.18.0
[2.19.0]: https://github.com/codsen/detergent/compare/v2.18.0...v2.19.0
[2.20.0]: https://github.com/codsen/detergent/compare/v2.19.0...v2.20.0
[2.21.0]: https://github.com/codsen/detergent/compare/v2.20.0...v2.21.0
[2.22.0]: https://github.com/codsen/detergent/compare/v2.21.0...v2.22.0
[2.23.0]: https://github.com/codsen/detergent/compare/v2.22.0...v2.23.0
[2.24.0]: https://github.com/codsen/detergent/compare/v2.23.0...v2.24.0
[2.25.0]: https://github.com/codsen/detergent/compare/v2.24.0...v2.25.0
[2.26.0]: https://github.com/codsen/detergent/compare/v2.25.0...v2.26.0
[2.27.0]: https://github.com/codsen/detergent/compare/v2.26.0...v2.27.0
[2.28.0]: https://github.com/codsen/detergent/compare/v2.27.0...v2.28.0
[2.29.0]: https://github.com/codsen/detergent/compare/v2.28.0...v2.29.0
[2.30.0]: https://github.com/codsen/detergent/compare/v2.29.0...v2.30.0
[2.31.0]: https://github.com/codsen/detergent/compare/v2.30.0...v2.31.0
[2.32.0]: https://github.com/codsen/detergent/compare/v2.31.0...v2.32.0
[3.0.0]: https://github.com/codsen/detergent/compare/v2.32.0...v3.0.0
