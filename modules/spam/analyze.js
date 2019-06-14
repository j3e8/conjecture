const pool = require('../../lib/database').pool;
const TokenizerModule = require('../tokenizer');
const SpamConstants = require('./constants');

module.exports = (text) => {
  return Promise.all([
    getGlobalSpaminess(),
    getSpaminess(text),
  ])
    .then((results) => {
      const globalResults = results[0];
      const tokenResults = results[1];
      return tokenResults * globalResults / (tokenResults * globalResults + (1 - tokenResults) * (1 - globalResults));
    });
}

function getGlobalSpaminess () {
  return pool.query(`select AVG(score::decimal / occurrences) as avgscore from spam`)
    .then((result) => result.rows[0].avgscore);
}

function getSpaminess (text) {
  const tokens = TokenizerModule.tokenize(text, SpamConstants.tokenGroupingLimit);
  const params = tokens.map((tok, i) => `$${i+1}`);

  return pool.query(`select AVG(score::decimal / occurrences) as avgscore
    from spam where token in (${params})`, tokens)
    .then((result) => result.rows[0].avgscore);
}
