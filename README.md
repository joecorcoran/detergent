![Detergent](https://detergent.io/images/code-and-send-detergent-io_108x204.gif)

# Detergent

> All-in-one special character encoder and text cleaner for pasting into HTML

[![Build Status](https://travis-ci.org/code-and-send/detergent.svg?branch=master)](https://travis-ci.org/code-and-send/detergent) [![Dependency Status](https://david-dm.org/code-and-send/detergent.svg)](https://david-dm.org/code-and-send/detergent) [![devDependency Status](https://david-dm.org/code-and-send/detergent/dev-status.svg)](https://david-dm.org/code-and-send/detergent#info=devDependencies) [![Downloads/Month](https://img.shields.io/npm/dm/detergent.svg)](https://www.npmjs.com/package/detergent)

<a href="https://github.com/feross/standard"><img src="https://cdn.rawgit.com/feross/standard/master/sticker.svg" alt="Standard JavaScript" width="100"></a>


Detergent is a smart HTML entity encoder, specifically tailored for email templates. It is a JavaScript library that prepares text to be pasted into email's or website's HTML code. There is also a web app on [Detergent.io](http://detergent.io) which is driven by this JS library.

For manual HTML character encoding, website [Detergent.io](https://detergent.io) is the best. For automation purposes (for example, automated email builds using Gulp/Grunt/npm_scripts), this, _JS-library-Detergent_ (this library you see here) is the best.

If you don't know any JavaScript, calm down, close this web page and continue to use [Detergent.io](https://detergent.io).

## Install

```bash
$ npm install --save detergent
```

## Test

```
$ npm test
```

## Rationale

Detergent is three things: 1) HTML special character encoder and 2) invisible special character remover, and 3) English grammar style improving tool. Detergent was created to be robust and accept any kinds of text as an input, including HTML code. Yes, you can be lazy and paste "dirty" unencoded HTML into Detergent, and it will decode, clean and encode the HTML.

If you copy-paste text from creative files or Excel spreadsheets or Word into your email templates, you need to clean the text first using Detergent because that text might contain invisible Unicode characters (such as ETX coming from Adobe software) and strange white spaces.

Detergent improves the English style, and all features are optional and automated:

* [widow word](https://en.wikipedia.org/wiki/Widows_and_orphans) prevention adding `&nbsp;` between last two words
* M-dash and N-dash recognition and automatic replacement
* Adding fancy apostrophes

Extra features are:

* You can skip the encoding of non-Latin language letters. Useful when you are deploying Japanese or Chinese emails.
* Detergent is both XHTML and HTML-friendly. You can set which way you want your `<BR>`'s to appear: with closing slash (XHTML) or without (HTML), so your HTML code should be passing the W3C validator.
* Detergent is Emoji-friendly and accepts any and all Unicode characters.

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
  keepBoldEtc: true               // any bold, strong, i or em tags are stripped of attributes and retained
});
```

The default settings are specifically chosen to be the most common scenario: _decode, encode and apply all available fixes_. This way, when I set up wiring in automated email build systems in Gulp, I don't even set any settings and run on default-ones.

## Example

Simple encoding using default settings:

```js
detergent('clean this text £');
// > &pound;
```

Using custom settings object:

```js
detergent('clean this text £',{
    convertEntities: false
});
// > &
```

## Contributing & testing

Flush the repo onto your SSD and have a butchers at `test.js`. It's very minimalistic testing setup using [AVA](https://github.com/avajs/ava), with TAP output (formatter via Faucet).

```bash
npm test
```

If you want to contribute, please do. If it's code contribution, please supplement `test.js` with tests covering your code.

## Licence

MIT © Roy Reveltas
