# Detergent

<a href="https://github.com/feross/standard" style="float: right; padding: 0 0 20px 20px;"><img src="https://cdn.rawgit.com/feross/standard/master/sticker.svg" alt="Standard JavaScript" width="100" align="right"></a>

> All-in-one: HTML special character encoder, invisible character cleaner and English style improvement tool — and fully customisable

<a href="https://detergent.io" style="float: left; padding: 0 20px 20px 0;"><img src="https://detergent.io/images/code-and-send-detergent-io_108x204.gif" alt="Detergent.io" width="100" align="left"></a>

[![Build Status][travis-img]][travis-url]
[![Coverage Status][cov-img]][cov-url]
[![bitHound Overall Score][overall-img]][overall-url]
[![bitHound Dependencies][deps-img]][deps-url]
[![bitHound Dev Dependencies][dev-img]][dev-url]
[![Downloads/Month][downloads-img]][downloads-url]

Detergent is a smart HTML entity encoder, specifically tailored for email template development. It is a JavaScript library that prepares text to be pasted into email's or website's HTML code. There is also a web app on [Detergent.io](http://detergent.io) which is driven by this JS library.

For manual HTML character encoding, website [Detergent.io](https://detergent.io) is the best. For automation purposes (for example, automated email template builds using Gulp/Grunt/npm_scripts), this, _JS-library-Detergent_ (this library you see here) is the best.

If you don't know any JavaScript, calm down, close this web page and continue to use [Detergent.io](https://detergent.io).

## Install

```bash
$ npm install --save detergent
```

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Rationale](#rationale)
- [API](#api)
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

Optionally, you can customise the Detergent's functionality by providing an options object. Here's an overview of the default settings object's values.

```js
detergent('text to clean', {
  removeWidows: true,             // replace the last space in paragraph with &nbsp;
  convertEntities: true,          // encode all non-ASCII chars
  convertDashes: true,            // typographically-correct the n/m-dashes
  convertApostrophes: true,       // typographically-correct the apostrophes
  replaceLineBreaks: true,        // replace all line breaks with BR's
  removeLineBreaks: false,        // put everything on one line
  useXHTML: true,                 // add closing slashes on BR's
  removeSoftHyphens: true,        // remove character which encodes to &#173; or &shy;
  dontEncodeNonLatin: true,       // skip non-latin character encoding
  keepBoldEtc: true,              // any bold, strong, i or em tags are stripped of attributes and retained
  addMissingSpaces: true          // adds missing spaces after dots/colons/semicolons, unless it's URL
});
```

The default settings are specifically chosen to be the most common scenario: _decode, encode and apply all available fixes_. This way, when I set up wiring in automated email build systems in Gulp, I don't even set any settings and run on default-ones.

## Example

Simple encoding using default settings:

```js
detergent('clean this text £');
// > 'clean this text &pound;'
```

Using custom settings object:

```js
detergent('clean this text £',{
    convertEntities: false
});
// > 'clean this text £'
```

## Contributing & testing

Flush the repo onto your SSD and have a butchers at `test.js`. It's very minimalistic testing setup using [AVA](https://github.com/avajs/ava) and [Istanbul CLI](https://github.com/istanbuljs/nyc). Currently the Detergent has ten options and each option can affect the output of the library. This means, we have to test each feature against every possible combination of the settings — that's 2^11=2048 tests for each unit test! I coded up an auxiliary library, [object-boolean-combinations](https://github.com/revelt/object-boolean-combinations) which generates an array of all possible variations and feeds that into AVA. See its readme file to learn more how it works.

Tests take around 5 minutes to complete:

```bash
npm test
```

If you want to contribute, don't hesitate. If it's a code contribution, please supplement `test.js` with tests covering your code. This library uses JS Standard notation and follows the Semver rules.

## Licence

> MIT License (MIT)

> Copyright (c) 2017 Codsen Ltd, Roy Reveltas

> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[travis-img]: https://travis-ci.org/code-and-send/detergent.svg?branch=master
[travis-url]: https://travis-ci.org/code-and-send/detergent

[cov-img]: https://coveralls.io/repos/github/code-and-send/detergent/badge.svg?branch=master
[cov-url]: https://coveralls.io/github/code-and-send/detergent?branch=master

[overall-img]: https://www.bithound.io/github/code-and-send/detergent/badges/score.svg
[overall-url]: https://www.bithound.io/github/code-and-send/detergent

[deps-img]: https://www.bithound.io/github/code-and-send/detergent/badges/dependencies.svg
[deps-url]: https://www.bithound.io/github/code-and-send/detergent/master/dependencies/npm

[dev-img]: https://www.bithound.io/github/code-and-send/detergent/badges/devDependencies.svg
[dev-url]: https://www.bithound.io/github/code-and-send/detergent/master/dependencies/npm

[downloads-img]: https://img.shields.io/npm/dm/detergent.svg
[downloads-url]: https://npm-stat.com/charts.html?package=detergent
