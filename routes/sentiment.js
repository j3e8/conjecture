const SentimentApi = require('../api/sentiment');

module.exports = (app) => {
  app.post('/api/sentiment/analyze', (req, res, next) => {
    SentimentApi.analyzeForSentiment(req)
      .then(result => res.json(result))
      .catch(next);
  });

  app.post('/api/sentiment/train', (req, res, next) => {
    SentimentApi.trainForSentiment(req)
      .then(result => res.json(result))
      .catch(next);
  });
};
