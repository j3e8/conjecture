const HttpError = require('../../lib/httperror');
const VulgarityModule = require('../../modules/vulgarity');

module.exports = (req) => {
  // do any api sanitizing that may be necessary
  if (!req.body || !req.body.text || req.body.score === undefined) {
    return Promise.reject(new HttpError(400, 'Must provide text and score'));
  }

  // create sample
  return VulgarityModule.train(req.body.text, req.body.score ? 1 : 0);
};
