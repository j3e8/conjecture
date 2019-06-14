/** *
* All the API end points that relate to a Spam can be defined here
** */

const SpamApi = require('../api/spam');

module.exports = (app) => {
  app.post('/api/spam/analyze', (req, res, next) => {
    SpamApi.analyzeForSpam(req)
      .then(result => res.json(result))
      .catch(next);
  });

  app.post('/api/spam/train', (req, res, next) => {
    SpamApi.trainForSpam(req)
      .then(result => res.json(result))
      .catch(next);
  });
};
