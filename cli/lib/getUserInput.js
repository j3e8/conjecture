const Readline = require('readline');

module.exports = function getUserInput (text, analysis, instructions) {
  const rl = Readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    console.log('-------------------------------------------------------------------------');
    console.log(analysis);
    console.log('-------------------------------------------------------------------------');
    rl.question(`\n${text}\n\n${instructions} `, (answer) => {
      resolve(answer);
      rl.close();
    });
  });
}
