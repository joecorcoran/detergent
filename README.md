![Detergent](http://cdn.detergent.io/images/code-and-send-detergent-io_108x204.gif)

# Detergent

Detergent is a JavaScript library that prepares text to be pasted into email HTML code. There is also a front-end shell (internally called "the plastic") on [Detergent.io](http://detergent.io) with all current features implemented.

## Rationale

Clients can provide text for email newsletters in various forms. Adobe Products (PS, IL for example) are notorious for adding invisible characters such as ETX as line breaks. Ideally, we need a tool to replace them with `<BR>`'s. To my best knowledge no tool on the market can do that currently besides Detergent.

Email messages' RAW source is in ASCII. If you use any other characters in your email newsletter outside of it, you need to encode them. Ideally, we need a tool to encode all the special characters within Unicode, including astral-ones (such as `𝌆`). There are few character converters but some either fail at high-end of Unicode; or [don't](http://textcleaner.lutesonline.com/) offer the option to encode using named entities or [both](http://www.emailonacid.com/character_converter/).

If you take care to encode your copy, your converter must be smart-enough to:
* strip the HTML, retaining bold/italic/strong/em tags
* offer to typographically-correct the text (to set typographically-correct dashes, quotes etc.)
* skip the entity encoding on non-latin characters because there is not point to work on soup of entities — email will surely be sent in UTF-8 anyway. Yet, unencoded pound signs will trigger email code linters, so proper converter should encode what is _usually_ encoded (although, technically, not required in non-latin email).

## API

Optionally, you can customize the Detergent's functionality by providing an options object. Here's an overview of the default settings object's values.

```js
detergent('text to clean', {
  removeWidows: true,						// replace the last space in paragraph with &nbsp;
	convertEntities: true,				// encode all non-ASCII chars
	convertDashes: true,					// typographically-correct the n/m-dashes
	convertApostrophes: true,			// typographically-correct the apostrophes
	replaceLineBreaks: true,			// replace all line breaks with BR's
	removeLineBreaks: false,			// put everything on one line
	useXHTML: true,								// add closing slashes on BR's
	removeSoftHyphens: true,			// remove character which encodes to &#173; or &shy;
	dontEncodeNonLatin: true,			// skip non-latin character encoding
	keepBoldEtc: true							// any bold, strong, i or em tags are stripped of attributes and retained
});
```

## Example

Simple encoding using default settings:

```js
detergent('clean this text £');
```

Using custom settings object:

```js
detergent('clean this text £',{
	convertEntities: false
});
```

## Contributing & testing

Test, flush the repo onto your HDD, and test the Detergent via Tap and Faucet. There will be more than 40K tests, mind you.

```bash
node tests/detergent.js | faucet
```

If you want to contribute, you're more than welcome to do so. Please write tests for all the code you wish add. All help is welcome, including documentation improvement, new features and tightening tests even more.

## Licence

MIT
