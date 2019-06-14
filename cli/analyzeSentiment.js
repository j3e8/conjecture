require('dotenv').load();

const fs = require('fs-promise');
const SentimentModule = require('../modules/sentiment');

const pathToTweets = process.argv[2];
if (!pathToTweets) {
  console.error("Missing path to tweets");
  process.exit(1);
}

const pathToOutput = process.argv[3];


fs.readFile(`${pathToTweets}`, 'utf8')
  .then((str) => {
    console.log('parsing input file');

    const data = str.split('\n').slice(1);
    const tweets = data.filter((tweet) => tweet).map((tweet) => {
      return {
        text: tweet,
        sentiment_category: 'neutral',
      }
    });

    console.log('parsed. ready to analyze');

    return validateTweets(tweets);
  })
  .then((results) => saveResults(results))
  .then(() => {
    console.log('done');
    process.exit(0);
  })
  .catch((ex) => {
    console.error("Couldn't parse tweet file", ex);
  });

function validateTweets(tweets) {
  console.log(`analyzing ${tweets.length} mentions`);
  const iter = tweets.entries();
  return validate(iter, tweets);
}

function validate (iter, tweets) {
  const iteration = iter.next();
  if (iteration.done) {
    return Promise.resolve(tweets);
  }

  const tweet = iteration.value[1];
  return SentimentModule.analyze(tweet.text)
  .then((analysis) => {
    tweet.sentiment_category = analysis.sentiment;
    return validate(iter, tweets);
  });
}

function saveResults (tweets) {
  if (!pathToOutput) {
    return Promise.resolve();
  }

  const lines = tweets.map((tweet) => {
    const escaped = tweet.text.replace(/"/g, '""');
    return `"${escaped}",${tweet.sentiment_category}`;
  });
  return fs.writeFile(pathToOutput, lines.join('\r\n'));
}
