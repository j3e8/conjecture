const HttpError = require('../../lib/httperror');
const LanguageModule = require('../../modules/language');

module.exports = (req) => {
  // do any api sanitizing that may be necessary
  if (!req.body || !req.body.text || !req.body.language_code) {
    return Promise.reject(new HttpError(400, 'Must provide text and language_code'));
  }

  const language_code = req.body.language_code.toLowerCase();

  const language = LanguageModule.languages.find(l => l.code === language_code);
  if (!language) {
    return Promise.reject(new HttpError(400, 'Invalid language_code'));
  }

  return LanguageModule.train(req.body.text, language_code);
};
