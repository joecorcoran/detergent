# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [2.31.0] - 2017-08-18
### Added
- `.npmignore` and added `/media/` to it, along all dotfiles. This will reduce your npm installation footprint.
- Bunch of new badges to readme.

## [2.29.0] - 2017-07-20
### Added
- Feature for issue [#14](https://github.com/codsen/detergent/issues/14) - Detergent strips all HTML (except bolt/italic/strong/em) code, but in the process, some content might be misformatted. For example, the content in unordered lists would get bunged up together without spaces. Now that's fixed. By default, every `<li>` will be put onto a new line, as well as closing `</ul>`. If you want everything on one line, set `opts.removeLineBreaks` to `true`.
### Removed
- Some Lodash dependencies, replacing them with native ES6-ones.

## [2.28.0] - 2017-07-08
### Removed
- As the features grew, the "Builds" time on Travis grew too. Currently Travis fails around 50% of the cases because it hits 50 minutes mark while running the end-to-end unit tests. Therefore, I'm removing Travis for good. It makes no sense anyway, as there are no "Builds" for this library, only unit tests, which can be ran locally.

## [2.27.0] - 2017-07-08
### Updated
- Code refresh: updated all deps, generated up-to-date `package-lock` and did some small code rebasing related to all this.

## [2.26.0] - 2017-04-12
### Added
- Options key `o.addMissingSpaces` now allows you to control, do you want to add missing spaces after full stops/colons/semicolons, or not. This does not break the API as the new default setting matches previously non-customiseable setting.

## [2.25.0] - 2017-04-07
### Improved
- Tiny rebasing: separated all functions into util.js, added some measures to protect against options object settings in wrong type (values other type than Boolean).

## [2.24.0] - 2017-04-05
### Improved
- Widows won't be added if there's right closing slash following the space. Also, they won't be added if there's `hr` or `br` preceding the space. This is necessary to cater the cases when Detergent is being ran on a code which has concealed HTML tags where brackets are swapped with custom strings. For example, cases like `aaaaaaaaaaa%%%1br /%%%2aaaaaaaaaaa` should get identified as concealed HTML and widow removal should not be triggered.
### Removed
- `strip-bom` library dependency was redundant; '\uFEFF' was already in the invisible character list and removed along all other invisibles.

## [2.23.0] - 2017-03-24
### Improved
- Swooping in on full stop + letter fixes. I found the file names where extension is mentioned get separated into two parts. I came up with the idea: two errors rarely happen at one place. "string1.string2" is a double error because space after full stop is missing and letter that follows is in capital. This leads to the algorithm:

If there is no space after full stop, and letter that follows is uppercase, add a full stop. If lowecase letter follows full stop, leave it as it is.

Additionally, the algorithm is now checking, does any of the known extensions follow the full stop (in any case). If so, space between the full stop and extension is not added. This should cover all false positives where file names are involved.

## [2.22.0] - 2017-03-22
### Improved
- Now correctly recognises and ignores legitimate minus signs, such as `-20°C` when it comes after a space. If algorithm will detect a number of curency symbol after a dash, it will not add a space after it or turn it into an m-dash. It does not matter now, a space character precedes all that or not.
- Updated Husky to latest.
### Added
- More tests.
### Changed
- Now consuming JS Standard linter in normal fashion, not "any latest", but within the current _major_ range.

## [2.21.0] - 2017-03-09
### Added
- Removes [byte order mark](https://en.wikipedia.org/wiki/Byte_order_mark#UTF-8) (BOM).

## [2.20.0] - 2017-02-22
### Added
- Widow removal now identifies UK postcodes and replaces the space with non-breaking space.

## [2.19.0] - 2017-01-04
### Added
- URL recognition — now Detergent won't add spaces within an URL.
- New tests — to maintain the coverage and prove the surrounded text is cleaned correctly as before.

## [2.18.0] - 2016-12-23
### Added
- JS Standard on a precommit hook to enforce an order everywhere
- Tweaks for BitHound to ignore the fact that we are going to use the _latest version_ `AVA`, `Coveralls` and `Standard` no matter what, to reduce maintenance time spent on all my libraries.
- Some tweaks to completely pass JS Standard (there were redundant regex escapes for example)

## 2.17.0 - 2016-12-21
### Added
- Test coverage and a badge
- Changelog
- Tweaked travis and bithound setup files
- Hardened the .gitignore
- Consolidated Readme badge links to svg's and url's in the footer

### Fixed
- Renamed some tests to match better what's inside
- The latest AVA (*) is requested with an ignore on the BitHound

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
[2.31.0]: https://github.com/codsen/detergent/compare/v2.29.0...v2.31.0
