require('dotenv').load();

const fs = require('fs-promise');
const Readline = require('readline');
const VulgarityModule = require('../modules/vulgarity');

const pathToTweets = process.argv[2];
if (!pathToTweets) {
  console.error("Missing path to tweets");
  process.exit(1);
}


fs.readFile(`${pathToTweets}`, 'utf8')
  .then((str) => {
    const data = str.split('\n');

    const tweets = data.map((d, i) => {
      if (!d) {
        return;
      }
      let result;
      try {
        result = JSON.parse(d);
      } catch (ex) {
        // consoleq.warn(`Couldn't parse line ${i}`, ex, d);
      }
      return result;
    }).filter((tweet) => tweet && tweet.text && tweet.vulgarity === undefined);

    return askAboutTweets(tweets, 0);
  })
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
  return getUserInput(text)
    .then((answer) => {
      if (!answer) {
        tweets[tweetIndex].vulgarity = null;
        return askAboutTweets(tweets, tweetIndex + 1);
      } else if (answer.toLowerCase() === 'q') {
        return writeTweets(tweets)
          .then(() => Promise.resolve());
      } if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'v') {
        tweets[tweetIndex].vulgarity = 1;
        return writeTweets(tweets)
          .then(() => VulgarityModule.train(text, 1))
          .then(() => askAboutTweets(tweets, tweetIndex + 1));
      } else if (answer.toLowerCase() === 'n') {
        tweets[tweetIndex].vulgarity = 0;
        return writeTweets(tweets)
          .then(() => VulgarityModule.train(text, 0))
          .then(() => askAboutTweets(tweets, tweetIndex + 1));
      }
    });
}

function getUserInput (text) {
  const rl = Readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    return VulgarityModule.analyze(text)
      .then((results) => {
        console.log('-------------------------------------------------------------------------');
        console.log(results);
        console.log('-------------------------------------------------------------------------');
        rl.question(`\n${text}\n\nIs this text vulgar or not (v/n/q)? `, (answer) => {
          resolve(answer);
          rl.close();
        });
      })
      .catch((err) => {
        console.error(err);
        resolve();
      });
  });
}

function writeTweets (tweets) {
  const data = tweets.map((tweet) => JSON.stringify(tweet)).join('\n');
  return fs.writeFile(pathToTweets, data);
}
