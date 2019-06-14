const HttpError = require('../../lib/httperror');
const SentimentModule = require('../../modules/sentiment');

module.exports = (req) => {
  // do any api sanitizing that may be necessary
  if (!req.body || !req.body.text || req.body.score === undefined) {
    return Promise.reject(new HttpError(400, 'Must provide text and score'));
  }

  // create sample
  return SentimentModule.train(req.body.text, req.body.positivity ? 1 : 0, req.body.negativity ? 1 : 0);
};
