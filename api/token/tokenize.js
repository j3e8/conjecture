const HttpError = require('../../lib/httperror');
const TokenizerModule = require('../../modules/tokenizer');

module.exports = (req) => {
  // do any api sanitizing that may be necessary
  if (!req.body || !req.body.text) {
    return Promise.reject(new HttpError(400, 'Must provide text to tokenize'));
  }

  if (!req.body.tokenGroupingLimit) {
    return Promise.reject(new HttpError(400, 'Must provide tokenGroupingLimit'));
  }

  const tokens = TokenizerModule.tokenizeWords(req.body.text, req.body.lang || 'en');
  return Promise.resolve(tokens);
};
