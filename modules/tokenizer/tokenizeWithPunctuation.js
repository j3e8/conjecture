const { union } = require('lodash');
const Entities = require('html-entities').AllHtmlEntities;
const Lang = require('./lang');

const entities = new Entities();
const toEmoji = require('../emoticons/toEmoji');

const email_r = /[a-z0-9_\-\.]+@[a-z0-9_\-\.]+\.[a-z]+/gmi;
const emoji_r = /([\uD83C-\uDBFF\uDC00-\uDFFF]{2})/gm;
const mention_r = /@[a-z0-9_\-\.]+/gmi;
const parentheses_r = /[\(\)\[\]\{\}<>]/gm;
const url_r = /(http|https|ws|wss|ftp|ftps):\/\/[\S]+/gmi;

module.exports = function (text, num, lang = 'en') {
  // coerce all emojis into their own words
  let formatted = text.replace(emoji_r, ' $1');

  // coerce old-school emoticons into emojis
  formatted = toEmoji(formatted);

  // coerce #hashtags and @mentions into their own words
  formatted = formatted.replace(/([#@])/gm, ' $1');

  // replace html entities
  formatted = entities.decode(formatted);

  // remove all parentheses, braces and brackets
  formatted = formatted.replace(parentheses_r, ' ');

  // replace all emails with '<email>'
  formatted = formatted.replace(email_r, '<email>');

  // replace all @mentions with '<user>'
  formatted = formatted.replace(mention_r, '<user>');

  // replace all urls with '<url>' which is now a special token since all < and > have been removed
  formatted = formatted.replace(url_r, '<url>');

  // add a space before all punctuation to coerce it into its own word
  formatted = formatted.replace(Lang.punctuation[lang], ' $1 ');

  // reduce all punctuation to single instances of each character
  formatted = formatted.replace(Lang.punctuationReducer[lang], '');

  // replace all word boundaries with a single space
  formatted = formatted.replace(Lang.wordBoundariesWithoutPunctuation[lang], ' ');

  // split on spaces (now the only word boundary)
  const words = formatted.split(' ').filter(w => w).map(w => w.toLowerCase()).map((word) => {
    // remove random quotes but leave apostrophes
    return word.replace(/^[‘’']/, '').replace(/[‘’']$/, '');
  });

  let tokens = words.slice(0)
                    .map(w => w.replace(Lang.punctuation[lang], '')).filter(w => w); // filter out punctuation from single words

  const filteredWords = words.filter(w => !url_r.test(w)); // filter out urls for n-grams

  if (num >= 2) {
    for (let i=2; i <= num; i++) {
      const groupings = combineTokens(filteredWords, i, lang);
      tokens = union(tokens, groupings);
    }
  }

  return tokens.filter(token => token && token.length <= 100);
}

function combineTokens (words, n, lang) {
  if (words.length < n) {
    return [];
  }
  const numberOfGroups = words.length - (n - 1);
  const groups = new Array(numberOfGroups);
  for (var i=0; i < numberOfGroups; i++) {
    const tokens = words.slice(i, i + n);
    if (containsPunctuation(tokens/*.slice(0, tokens.length - 1)*/, lang)) {
      groups[i] = null;
      continue;
    }
    groups[i] = tokens.join(' ');
  }
  return groups.filter(g => g);
}

function containsPunctuation (tokens, lang) {
  return tokens.find((token) => Lang.punctuation[lang].test(token)) ? true : false;
}
