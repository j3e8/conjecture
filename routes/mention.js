const MentionApi = require('../api/mention');

module.exports = (app) => {
  app.get('/api/mention', (req, res, next) => {
    MentionApi.getRandomMention(req)
      .then(result => res.json(result))
      .catch(next);
  });
};
