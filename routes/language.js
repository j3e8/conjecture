const LanguageApi = require('../api/language');

module.exports = (app) => {
  app.post('/api/language/analyze', (req, res, next) => {
    LanguageApi.analyzeForLanguage(req)
      .then(result => res.json(result))
      .catch(next);
  });

  app.post('/api/language/train', (req, res, next) => {
    LanguageApi.trainForLanguage(req)
      .then(result => res.json(result))
      .catch(next);
  });
};
