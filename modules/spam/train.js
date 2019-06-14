const pool = require('../../lib/database').pool;
const TokenizerModule = require('../tokenizer');
const SpamConstants = require('./constants');

module.exports = (text, score) => {
  const tokens = TokenizerModule.tokenize(text, SpamConstants.tokenGroupingLimit);

  const iter = tokens.entries();
  return iterateTokens(iter, score);
}

function iterateTokens (iter, score) {
  const iteration = iter.next();
  if (iteration.done) {
    return Promise.resolve();
  }
  const token = iteration.value[1];

  return updateToken(token, score)
    .then((result) => {
      if (!result.rowCount) {
        return insertToken(token, score);
      }
    })
    .then(() => iterateTokens(iter, score));
}

function updateToken (token, score) {
  return pool.query(`UPDATE spam
    SET occurrences = occurrences + 1,
    score = score + $1
    WHERE token=$2
  `, [score, token]);
}

function insertToken (token, score) {
  return pool.query(`INSERT INTO spam
    (token, occurrences, score)
    VALUES($1, 1, $2)
  `, [token, score]);
}
