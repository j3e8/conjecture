const pool = require('../../lib/database').pool;
const TokenizerModule = require('../tokenizer');
const VulgarityConstants = require('./constants');
const ztable = require('ztable');

let globalVulgarness, globalStdDev;

module.exports = (text) => {
  return Promise.all([
    getGlobalVulgarness(),
    getStandardDeviation(),
    getVulgarness(text),
  ])
    .then((results) => {
      const globalResults = Number(results[0]);
      const stddev = Number(results[1]);
      const tokenResults = Number(results[2].avgScore || globalResults);
      const zscore = Math.abs(tokenResults - globalResults) / stddev;
      const confidence = ztable(zscore);
      const vulgarity = (confidence - 0.5) * 2;
      const isVulgar = tokenResults > globalResults && vulgarity >= 0.5;
      return {
        score: tokenResults,
        mean: globalResults,
        stddev,
        zscore,
        confidence,
        vulgarity,
        avgSampleSize: results[2].sampleSize,
        isVulgar,
      };
    });
}

function getGlobalVulgarness () {
  if (globalVulgarness) {
    return Promise.resolve(globalVulgarness);
  }
  return pool.query(`select AVG(score::decimal / occurrences) as avgscore from vulgarity`)
    .then((result) => {
      globalVulgarness = result.rows[0].avgscore;
      return globalVulgarness;
    });
}

function getVulgarness (text) {
  if (!text) {
    return null;
  }
  const tokens = TokenizerModule.tokenize(text, VulgarityConstants.tokenGroupingLimit);
  const params = tokens.map((tok, i) => `$${i+1}`);

  if (!params.length) {
    return null;
  }

  console.log('getVulgarness');

  return pool.query(`select
      AVG(score::decimal / occurrences) as avg_score,
      SUM(occurrences) as total_occurrences
    from vulgarity where token in (${params})`, tokens)
    .then((result) => {
      const row = result.rows[0];
      return {
        avgScore: row.avg_score,
        sampleSize: Number(row.total_occurrences) / tokens.length,
      };
    })
    .catch((err) => {
      console.error("Couldn't analyze tokens", err, tokens);
      return null;
    });
}

function getStandardDeviation () {
  if (globalStdDev) {
    return Promise.resolve(globalStdDev);
  }

  return getGlobalVulgarness()
    .then((gv) => pool.query(`select SUM( ($1 - (score::decimal / occurrences)) * ($1 - (score::decimal / occurrences)) ) / COUNT(*) as stddev from vulgarity`, [ gv ]))
    .then((result) => {
      globalStdDev = Math.sqrt(result.rows[0].stddev);
      return globalStdDev;
    });
}
