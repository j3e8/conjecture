const { union } = require('lodash');
const Entities = require('html-entities').AllHtmlEntities;
const Lang = require('./lang');

const entities = new Entities();

module.exports = function (text, num, lang = 'en') {
  // coerce #hashtags and @mentions into their own words
  let formatted = text.replace(/([#@])/gm, ' $1');

  // coerce all emojis into their own words
  formatted = formatted.replace(/([\uD83C-\uDBFF\uDC00-\uDFFF]{2})/gm, ' $1');

  // replace html entities
  formatted = entities.decode(formatted);

  // remove all parentheses, braces and brackets
  formatted = formatted.replace(/[\(\)\[\]\{\}<>]/gm, ' ');

  // replace all emails with '<email>'
  formatted = formatted.replace(/[a-z0-9_\-\.]+@[a-z0-9_\-\.]+\.[a-z]+/gmi, '<email>');

  // replace all @mentions with '<user>'
  formatted = formatted.replace(/@[a-z0-9_\-\.]+/gmi, '<user>');

  // replace all urls with '<url>' which is now a special token since all < and > have been removed
  formatted = formatted.replace(/(http|https|ws|wss|ftp|ftps):\/\/[\S]+/gmi, '<url>');

  // replace all word boundaries with a single space
  formatted = formatted.replace(Lang.wordBoundaries[lang], ' ');

  // split on spaces (now the only word boundary)
  const words = formatted.split(' ').filter(w => w);
  let tokens = words.slice(0);
  if (num >= 2) {
    for (let i=2; i <= num; i++) {
      const groupings = combineTokens(words, i);
      tokens = union(tokens, groupings);
    }
  }

  // console.log(tokens);

  return tokens.filter(token => token && token.length <= 100);
}

function combineTokens (words, n) {
  if (words.length < n) {
    return [];
  }
  const numberOfGroups = words.length - (n - 1);
  const groups = new Array(numberOfGroups);
  for (var i=0; i < numberOfGroups; i++) {
    groups[i] = words.slice(i, i + n).join(' ');
  }
  return groups;
}
