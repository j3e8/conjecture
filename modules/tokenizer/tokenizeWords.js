const { union } = require('lodash');
const Entities = require('html-entities').AllHtmlEntities;
const Lang = require('./lang');
const characterTokens = require('../language/characterTokens');

const entities = new Entities();

module.exports = function (text) {
  // remove all emails
  let formatted = text.replace(/[a-z0-9_\-\.]+@[a-z0-9_\-\.]+\.[a-z]+/gmi, '');

  // remove #hashtags
  formatted = formatted.replace(/(#[\S]+)/gmi, ' ');

  // remove @mentions
  formatted = formatted.replace(/(@[\S]+)/gmi, ' ');

  // remove rtl #hashtags and @mentions
  formatted = formatted.replace(/([a-z0-9_\.]+)[#@]/gmi, ' ');

  // remove all emojis
  formatted = formatted.replace(/([\uD83C-\uDBFF\uDC00-\uDFFF]{2})/gm, ' ');

  // replace html entities
  formatted = entities.decode(formatted);

  // remove all parentheses, braces and brackets
  formatted = formatted.replace(/[\(\)\[\]\{\}<>]/gm, ' ');

  // remove all urls
  formatted = formatted.replace(/(http|https|ws|wss|ftp|ftps):\/\/[\S]+/gmi, '');

  // coerce all language-specific characters into their own 'words' so they become tokens
  characterTokens.forEach((regex) => {
    formatted = formatted.replace(regex, ' $1 ');
  });

  // replace all word boundaries with a single space
  formatted = formatted.replace(Lang.wordBoundaries['all'], ' ');

  // split on spaces (now the only word boundary)
  const words = formatted.split(' ').filter((w) => w).map((word) => {
    // remove random quotes but leave apostrophes
    return word.replace(/^[‘’']/, '').replace(/[‘’']$/, '');
  });

  const tokens = words.slice(0);

  return tokens.filter(token => token && token.length <= 100);
}
