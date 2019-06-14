require('dotenv').load();

const fs = require('fs-promise');
const Readline = require('readline');
const SentimentModule = require('../modules/sentiment');

const pathToTweets = process.argv[2];
if (!pathToTweets) {
  console.error("Missing path to tweets");
  process.exit(1);
}


fs.readFile(`${pathToTweets}`, 'utf8')
  .then((str) => {
    console.log('parsing input file');

    const data = str.split('\n').slice(1);

    const line_r = /^([0-9]+),([01]),([^,]+),(.*)$/mi;

    const tweets = data.map((d, i) => {
      if (!d) {
        return;
      }
      const match = d.match(line_r);
      return {
        sentiment: match[2],
        text: match[4],
      };
    }).filter((tweet) => tweet && tweet.text);

    const TRAIN_EVERY_N = 1;
    const dataset = tweets.filter((t, i) => i % TRAIN_EVERY_N === 0);

    const training = dataset.filter((t, i) => i % 10 !== 0);
    const validating = dataset.filter((t, i) => i % 10 === 0);

    console.log('parsed. ready to train');

    return trainOnTweets(training)
      .then(() => validateTweets(validating));

    return validateTweets(validating);
  })
  .then((results) => {
    const pct = (results.correct / (results.correct + results.incorrect) * 100).toFixed(2);
    console.log(results, `${pct}%`);
    console.log('done');
    process.exit(0);
  })
  .catch((ex) => {
    console.error("Couldn't parse tweet file", ex);
  });

function trainOnTweets(tweets) {
  console.log(`training on ${tweets.length} mentions`);
  const iter = tweets.entries();
  return train(iter, tweets.length);
}

function train (iter, length) {
  const iteration = iter.next();
  if (iteration.done) {
    return Promise.resolve();
  }

  const i = iteration.value[0];
  if (i && i % 10000 === 0) {
    console.log(`${(i / length * 100).toFixed(1)}%`);
  }
  const tweet = iteration.value[1];
  const sentiment = Number(tweet.sentiment);
  return SentimentModule.train(tweet.text, sentiment, 1 - sentiment) // positive and negative are inverse
  .then(() => train(iter, length));
}

function validateTweets(tweets) {
  console.log(`validating on ${tweets.length} mentions`);
  const iter = tweets.entries();
  return validate(iter, {
    count: 0,
    correct: 0,
    incorrect: 0,
  });
}

function validate (iter, results) {
  const iteration = iter.next();
  if (iteration.done) {
    return Promise.resolve(results);
  }

  const tweet = iteration.value[1];
  return SentimentModule.analyze(tweet.text)
  .then((analysis) => {
    results.count++;
    if ((analysis.sentiment === 'positive' && tweet.sentiment == 1) || (analysis.sentiment === 'negative' && tweet.sentiment == 0)) {
      results.correct++;
    } else {
      results.incorrect++;
    }
    return validate(iter, results);
  });
}
