const HttpError = require('../../lib/httperror');
const SpamModule = require('../../modules/spam');

module.exports = (req) => {
  // do any api sanitizing that may be necessary
  if (!req.body || !req.body.text) {
    return Promise.reject(new HttpError(400, 'Must provide text to analyze'));
  }

  // create sample
  return SpamModule.analyze(req.body.text);
};
