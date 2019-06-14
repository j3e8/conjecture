const pool = require('../../lib/database').pool;
const TokenizerModule = require('../tokenizer');
const SentimentConstants = require('./constants');

module.exports = (text, positivity, negativity) => {
  const tokens = TokenizerModule.tokenizeWithPunctuation(text, SentimentConstants.tokenGroupingLimit);

  const iter = tokens.entries();
  return iterateTokens(iter, positivity, negativity);
}

function iterateTokens (iter, positivity, negativity) {
  const iteration = iter.next();
  if (iteration.done) {
    return Promise.resolve();
  }
  const token = iteration.value[1];

  return updateToken(token, positivity, negativity)
    .then((result) => {
      if (!result.rowCount) {
        return insertToken(token, positivity, negativity);
      }
    })
    .then(() => iterateTokens(iter, positivity, negativity));
}

function updateToken (token, positivity, negativity) {
  return pool.query(`UPDATE sentiment
    SET occurrences = occurrences + 1,
    positivity = positivity + $1,
    negativity = negativity + $2
    WHERE token=$3
  `, [positivity, negativity, token]);
}

function insertToken (token, positivity, negativity) {
  const nCount = token.split(' ').length;
  return pool.query(`INSERT INTO sentiment
    (token, occurrences, positivity, negativity, n_count)
    VALUES($1, 1, $2, $3, $4)
  `, [token, positivity, negativity, nCount]);
}
