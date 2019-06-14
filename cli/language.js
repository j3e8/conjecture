require('dotenv').load();

const fs = require('fs-promise');
const LanguageModule = require('../modules/language');
const tweetArchiveParser = require('./lib/tweetArchiveParser');
const getUserInput = require('./lib/getUserInput');

const pathToTweets = process.argv[2];
if (!pathToTweets) {
  console.error("Missing path to tweets");
  process.exit(1);
}


tweetArchiveParser.parseFor(pathToTweets, 'language')
  .then((tweets) => askAboutTweets(tweets, 0))
  .then(() => {
    console.log('done');
    process.exit(0);
  })
  .catch((ex) => {
    console.error("Couldn't parse tweet file", ex);
  });



function askAboutTweets (tweets, tweetIndex) {
  if (tweetIndex >= tweets.length) {
    return writeTweets(tweets).then(() => Promise.resolve());
  }

  const text = tweets[tweetIndex].text;
  return LanguageModule.analyze(text)
    .then((analysis) => {
      console.log('3');
      return getUserInput(text, analysis, 'Language (en, es, zh, q to quit)?');
    })
    .then((answer) => {
      if (!answer) {
        tweets[tweetIndex].language = null;
        return askAboutTweets(tweets, tweetIndex + 1);
      } else if (answer.toLowerCase() === 'q') {
        return writeTweets(tweets)
          .then(() => Promise.resolve());
      } else if (LanguageModule.languages.find(l => l.code === answer)) {
        tweets[tweetIndex].language = answer;
        return writeTweets(tweets)
          .then(() => LanguageModule.train(text, answer))
          .then(() => askAboutTweets(tweets, tweetIndex + 1));
      } else {
        tweets[tweetIndex].language = null;
        return askAboutTweets(tweets, tweetIndex + 1);
      }
    });
}

function writeTweets (tweets) {
  const data = tweets.map((tweet) => JSON.stringify(tweet)).join('\n');
  return fs.writeFile(pathToTweets, data);
}
