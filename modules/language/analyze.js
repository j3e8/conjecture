const pool = require('../../lib/database').pool;
const TokenizerModule = require('../tokenizer');

const CONFIDENCE_THRESHOLD = 0.5;

module.exports = (text) => {
  if (!text) {
    return null;
  }
  return getLanguage(text);
}

function getLanguage (text) {
  const tokens = TokenizerModule.tokenizeWords(text);
  console.log('analyze', tokens);
  if (!tokens.length) {
    return Promise.resolve({
      language_code: '__',
      probability: 1,
    });
  }
  const params = tokens.map((tok, i) => `$${i+1}`);

  if (!params.length) {
    return null;
  }

  return pool.query(`select language_code, SUM(occurrences) as num_occurrences
      from language where token in (${params})
      group by language_code
      order by num_occurrences desc`, tokens)
    .then((result) => {
      if (!result.rows.length) {
        return Promise.resolve();
      }
      const total = result.rows.reduce((total, row) => {
        return total + Number(row.num_occurrences);
      }, 0);
      const probability = Number(result.rows[0].num_occurrences) / total;
      return {
        language_code: probability > CONFIDENCE_THRESHOLD ? result.rows[0].language_code : null,
        probability,
      }
    })
    .catch((err) => {
      console.error("Couldn't analyze tokens", err, tokens);
      return null;
    });
}
