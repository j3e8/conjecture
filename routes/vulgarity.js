const VulgarityApi = require('../api/vulgarity');

module.exports = (app) => {
  app.post('/api/vulgarity/analyze', (req, res, next) => {
    VulgarityApi.analyzeForVulgarity(req)
      .then(result => res.json(result))
      .catch(next);
  });

  app.post('/api/vulgarity/train', (req, res, next) => {
    VulgarityApi.trainForVulgarity(req)
      .then(result => res.json(result))
      .catch(next);
  });
};
