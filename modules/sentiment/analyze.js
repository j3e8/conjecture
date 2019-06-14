const pool = require('../../lib/database').pool;
const TokenizerModule = require('../tokenizer');
const SentimentConstants = require('./constants');

const NEUTRAL_POSITIVE_THRESHOLD = 0.6;
const NEUTRAL_NEGATIVE_THRESHOLD = 0.4;

module.exports = (text) => {
  return getPositivity(text)
    .then((positivity) => {
      let sentiment = 'neutral';
      if (positivity > NEUTRAL_POSITIVE_THRESHOLD) {
        sentiment = 'positive';
      } else if (positivity < NEUTRAL_NEGATIVE_THRESHOLD) {
        sentiment = 'negative';
      }
      return {
        positivity,
        negativity: 1 - positivity,
        sentiment,
      };
    });
}


function getPositivity (text) {
  if (!text) {
    return null;
  }
  const tokens = TokenizerModule.tokenizeWithPunctuation(text, SentimentConstants.tokenGroupingLimit);
  const params = tokens.map((tok, i) => `$${i+1}`);

  if (!params.length) {
    return null;
  }

  return pool.query(`select token, occurrences, positivity, negativity, n_count
      from sentiment where token in (${params})`, tokens)
    .then((result) => {
      if (!result.rows.length) {
        return Promise.resolve();
      }
      const weightedSum = result.rows.reduce((total, row) => {
        const weightedPositivity = (row.positivity / row.occurrences);
        return total + weightedPositivity;
      }, 0);

      return weightedSum / result.rows.length;
    })
    .catch((err) => {
      console.error("Couldn't analyze tokens", err, tokens);
      return null;
    });
}
