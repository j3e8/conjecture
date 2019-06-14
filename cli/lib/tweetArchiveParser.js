const fs = require('fs-promise');

function parseFor (pathToTweets, key) {
  return fs.readFile(`${pathToTweets}`, 'utf8')
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
      }).filter((tweet) => tweet && tweet.text && tweet[key] === undefined);

      return tweets;
    });
}

module.exports = {
  parseFor,
}
