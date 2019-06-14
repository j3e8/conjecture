const _ = require('lodash');
const fs = require('fs-promise');
const parseString = require('xml2js').parseString;

const filepath = process.argv[2];
if (!filepath) {
  console.error('You must supply a path to the kanjidic file as the only argument');
  process.exit(1);
}

fs.readFile(filepath)
  .then((filestr) => parseXml(filestr))
  .then((data) => {
    const dict = _.get(data, 'kanjidic2.character');
    const map = dict.reduce((obj, ch) => {
      const kanji = _.get(ch, 'literal[0]');
      if (!kanji) {
        return obj;
      }
      const readingMeaning = _.get(ch, 'reading_meaning[0]');
      if (!readingMeaning) {
        return obj;
      }
      const hiragana = findTransliterationInMeanings(readingMeaning);
      if (!hiragana) {
        console.warn(`Couldn't find transliteration for ${kanji}`, JSON.stringify(ch['reading_meaning'], null, 2));
        return obj;
      }
      obj[kanji] = hiragana;
      return {
        ...obj,
        [kanji]: hiragana,
      }
    }, {});
    console.log(map);
    console.log(Object.keys(map).length);
    return map;
  })
  .then((map) => {
    if (!process.argv.length < 4) {
      return;
    }
    const outfile = process.argv[3];
    return fs.writeFile(outfile, JSON.stringify(map, null, 2));
  })
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("FATAL ERROR", err);
    process.exit(1);
  })

function parseXml (xml) {
  return new Promise((resolve, reject) => {
    parseString(xml, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
}

function findTransliterationInMeanings (readingMeaning) {
  const readings = _.get(readingMeaning, 'rmgroup[0]reading');
  if (readings) {
    // prefer the japanese pronunciation first (as if it matters)
    let transliteration = readings.find(r => _.get(r, '$.r_type') === 'ja_kun');
    if (!transliteration) {
      // if not, use the traditional chinese pronunciation
      transliteration = readings.find(r => _.get(r, '$.r_type') === 'ja_on');
    }
    if (transliteration) {
      return transliteration['_'];
    }
  } else {
    // if still no transliteration exists, let's try nanori (which are strange, unique ways to read kanji when they exist in someone's name)
    // because this is so edge case and only found in names of people, our best bet is to use the first given nanori
    const nanori = _.get(readingMeaning, 'nanori[0]');
    return nanori;
  }
  return null;
}
