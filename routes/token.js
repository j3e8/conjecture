const TokenApi = require('../api/token');

module.exports = (app) => {
  app.post('/api/tokenize', (req, res, next) => {
    TokenApi.tokenize(req)
      .then(result => res.json(result))
      .catch(next);
  });
};
