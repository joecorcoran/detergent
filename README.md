# Detergent

<a href="https://detergent.io" style="float: left; padding: 0 20px 20px 0;"><img src="https://cdn.rawgit.com/codsen/detergent/edaacff8/media/detergent_200x200.png" alt="Detergent.io" width="200" align="left"></a>

All-in-one: HTML special character encoder, invisible character cleaner and English style improvement tool - and fully customisable.

[![Link to npm page][npm-img]][npm-url]
[![bitHound Overall Score][overall-img]][overall-url]
[![bitHound Dependencies][deps-img]][deps-url]
[![bitHound Dev Dependencies][dev-img]][dev-url]
[![Coverage Status][cov-img]][cov-url]
[![Known Vulnerabilities][vulnerabilities-img]][vulnerabilities-url]
[![Downloads/Month][downloads-img]][downloads-url]
[![View dependencies as 2D chart][deps2d-img]][deps2d-url]
[![Test in browser][runkit-img]][runkit-url]


Detergent is a smart HTML entity encoder, specifically tailored for email template development. It is a JavaScript library that prepares text to be pasted into email's or website's HTML code. There is also a web app on [Detergent.io](http://detergent.io) which is driven by this JS library.

For manual HTML character encoding, the website [Detergent.io](https://detergent.io) is the best. For automation purposes (for example, automated email template builds using Gulp/Grunt/npm_scripts), this, _JS-library-Detergent_ (this library you see here) is the best.

If you don't know any JavaScript, calm down, close this web page and continue to use [Detergent.io](https://detergent.io).

## Install

```bash
$ npm install --save detergent
```

```js
// ES6 flavour:
const detergent = require('detergent').detergent
// or use ES6 destructuring:
const { detergent, opts: exportedOpts } = require('./detergent.js')
// this would give you `detergent` function and `exportedOpts` plain object with default settings.

// ES5 flavour, transpiled using Babel `babel-preset-es2015`:
var detergent = require('detergent/es5').detergent
```

Main source `./detergent.js` is in ES6 but if you want transpiled ES5 version, just append `/es5` on the `require`d path.

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Rationale](#rationale)
- [API](#api)
  - [API - Input for `detergent()`](#api---input-for-detergent)
  - [Options object](#options-object)
  - [API - Output object](#api---output-object)
- [Example](#example)
- [Contributing & testing](#contributing--testing)
- [Licence](#licence)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Rationale

Detergent is three things: 1) HTML special character encoder and 2) invisible special character remover, and 3) English grammar style improving tool. Detergent was created to be robust and accept any kinds of text as an input, including HTML code. Yes, you can be lazy and paste "dirty" unencoded HTML into Detergent, and it will decode, clean and encode the HTML.

If you copy-paste text from creative files or Excel spreadsheets or Word into your email templates, you need to clean the text first using Detergent because that text might contain invisible Unicode characters (such as [ETX](https://en.wikipedia.org/wiki/End-of-Text_character) coming from Adobe software) and strange white spaces.

Detergent improves the English style, and all features are optional and automated:

* [widow word](https://en.wikipedia.org/wiki/Widows_and_orphans) prevention adding `&nbsp;` between last [two words](http://practicaltypography.com/widow-and-orphan-control.html)
* [M-dash and N-dash](http://practicaltypography.com/hyphens-and-dashes.html) recognition and automatic replacement where typographically appropriate
* Adding fancy [apostrophes](http://practicaltypography.com/apostrophes.html) and [curly quotes](http://practicaltypography.com/straight-and-curly-quotes.html)
* Adding missing spaces after full stops, commas and semicolons, except when it's a number.

Extra features are:

* You can skip the HTML encoding of non-Latin language letters. Useful when you are deploying Japanese or Chinese emails, because otherwise _everything_ will be HTML-encoded.
* Detergent is both XHTML and HTML-friendly. You can set which way you want your `<BR>`'s to appear: with closing slash (XHTML) or without (HTML), so your HTML code should be passing the W3C validator.
* Detergent handles the full range of Unicode code points. In other words, it's emoji-friendly.

## API

Since `v.3` release, the main function is exported in a plain object under key `detergent`, so please import it like that:

```js
const detergent = require('detergent').detergent;
// or request everything:
const { detergent, opts: exportedOpts } = require('./detergent.js')
// this gives extra plain object `exportedOpts` with default options. Handy when
// developing front-ends that consume the Detergent.
```

### API - Input for `detergent()`

Input argument   | Type     | Obligatory? | Description
-----------------|----------|-------------|-----------
`input`          | String   | yes         | The string you want to clean.
`options`        | Object   | no          | Options object. See its key arrangement below.

### Options object

options object's key    | Type of its value | Default     | Description
------------------------|-------------------|-------------|----------------------
{                       |                   |             |
`removeWidows`          | Boolean           | True        | replace the last space in paragraph with `&nbsp;`
`convertEntities`       | Boolean           | True        | encode all non-ASCII chars
`convertDashes`         | Boolean           | True        | typographically-correct the n/m-dashes
`convertApostrophes`    | Boolean           | True        | typographically-correct the apostrophes
`replaceLineBreaks`     | Boolean           | True        | replace all line breaks with `br`'s
`removeLineBreaks`      | Boolean           | False       | put everything on one line
`useXHTML`              | Boolean           | True        | add closing slashes on `br`'s
`removeSoftHyphens`     | Boolean           | True        | remove character which encodes to `&#173;` or `&shy;`
`dontEncodeNonLatin`    | Boolean           | True        | skip non-latin character encoding
`keepBoldEtc`           | Boolean           | True        | any `bold`, `strong`, `i` or `em` tags are stripped of attributes and retained
`addMissingSpaces`      | Boolean           | True        | adds missing spaces after dots/colons/semicolons, unless it's URL
`convertDotsToEllipsis` | Boolean           | True        | convert three dots into `&hellip;` - ellipsis character
}                       |                   |             |

Here it is in one place:

```js
detergent('text to clean', {
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
});
```

The default settings are specifically chosen to be the most common scenario. Unless you want something specific, default set is a wise choice.

You can also set the options to numeric `0` or `1`, that's shorter than Boolean `true` or `false`.

### API - Output object

output object's key | Type of its value | Description
--------------------|-------------------|-----------
{                   |                   |
`res`               | String            | The cleaned string
}                   |                   |

## Example

Simple encoding using default settings:

```js
const detergent = require('detergent').detergent;
let res = detergent('clean this text £').res;
console.log(res);
// > 'clean this text &pound;'
```

Using custom settings object:

```js
const detergent = require('detergent').detergent;
let result = detergent('clean this text £',{
  convertEntities: 0
}).res;
console.log(result);
// > 'clean this text £'
```

## Contributing & testing

Flush the repo onto your SSD and have a butchers at `test.js`. It's using [AVA](https://www.npmjs.com/package/ava) to run unit tests and [Istanbul CLI](https://github.com/istanbuljs/nyc) to calculate the unit test code coverage. Currently, Detergent has twelve options and each option can affect the output of the library. This means, we have to test each feature against every possible (relevant) combination of the settings - that's 2^12=4096 tests for each unit test! (in worst case). Some unit tests are specific-enough not to require _all_ the settings permutations tested, for example [BOM](https://en.wikipedia.org/wiki/Byte_order_mark) removal.

I coded up an auxiliary library, [object-boolean-combinations](https://github.com/codsen/object-boolean-combinations) which generates an array of all possible options' variations and feeds that into loops ran by AVA. See its [readme file](https://github.com/codsen/object-boolean-combinations) to learn more how it works.

Tests take around 15 minutes to complete on average laptop because there are around 250,000 assertions:

```bash
npm test
```

If you want to contribute, don't hesitate. If it's a code contribution, please supplement `test.js` with tests covering your code. This library uses `airbnb-base` rules preset of `eslint` with two exceptions^ and follows the Semver rules.

<small>^ 1. No semicolons. 2. Allow plus-plus in `for` loops. See `./eslintrc`</small>

## Licence

> MIT License (MIT)

> Copyright (c) 2015-2017 Codsen Ltd, Roy Revelt

> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[npm-img]: https://img.shields.io/npm/v/detergent.svg
[npm-url]: https://www.npmjs.com/package/detergent

[cov-img]: https://coveralls.io/repos/github/codsen/detergent/badge.svg?branch=master
[cov-url]: https://coveralls.io/github/codsen/detergent?branch=master

[overall-img]: https://www.bithound.io/github/codsen/detergent/badges/score.svg
[overall-url]: https://www.bithound.io/github/codsen/detergent

[deps-img]: https://www.bithound.io/github/codsen/detergent/badges/dependencies.svg
[deps-url]: https://www.bithound.io/github/codsen/detergent/master/dependencies/npm

[dev-img]: https://www.bithound.io/github/codsen/detergent/badges/devDependencies.svg
[dev-url]: https://www.bithound.io/github/codsen/detergent/master/dependencies/npm

[downloads-img]: https://img.shields.io/npm/dm/detergent.svg
[downloads-url]: https://npm-stat.com/charts.html?package=detergent

[vulnerabilities-img]: https://snyk.io/test/github/codsen/detergent/badge.svg
[vulnerabilities-url]: https://snyk.io/test/github/codsen/detergent

[deps2d-img]: https://img.shields.io/badge/deps%20in%202D-see_here-08f0fd.svg
[deps2d-url]: http://npm.anvaka.com/#/view/2d/detergent

[runkit-img]: https://img.shields.io/badge/runkit-test_in_browser-a853ff.svg
[runkit-url]: https://npm.runkit.com/detergent
