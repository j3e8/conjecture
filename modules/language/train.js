const pool = require('../../lib/database').pool;
const TokenizerModule = require('../tokenizer');

module.exports = (text, language_code) => {
  const tokens = TokenizerModule.tokenizeWords(text);

  const iter = tokens.entries();
  return iterateTokens(iter, language_code);
}

function iterateTokens (iter, language_code) {
  const iteration = iter.next();
  if (iteration.done) {
    return Promise.resolve();
  }
  const token = iteration.value[1];

  return updateToken(token, language_code)
    .then((result) => {
      if (!result.rowCount) {
        return insertToken(token, language_code);
      }
    })
    .then(() => iterateTokens(iter, language_code));
}

function updateToken (token, language_code) {
  return pool.query(`UPDATE language
    SET occurrences = occurrences + 1
    WHERE token=$1 and language_code=$2
  `, [token, language_code]);
}

function insertToken (token, language_code) {
  return pool.query(`INSERT INTO language
    (token, language_code, occurrences)
    VALUES($1, $2, 1)
  `, [token, language_code]);
}
