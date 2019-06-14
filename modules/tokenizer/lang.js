const punctuation = {
  en: /([.!?;]+)/gm,
}

const punctuationReducer = {
  en: /([.!?;])(?=\1{1})/gm,
}

const wordBoundaries = {
  all: /[\u3001-\u3002\u2800\s\-–—\(\)"“”=\+*^«»,\!\?\.\\\/:;|`~•™]+/gm,
  en: /[\u2800\s\-–—\(\)"“”=\+*^«»,\!\?\.\\\/:;|`~•™]+/gm,
}

const wordBoundariesWithoutPunctuation = {
  en: /[\u2800\s\-–—\(\)"“”=\+*^«»,\\\/:;|`~•]+/gm,
}

module.exports = {
  punctuation,
  punctuationReducer,
  wordBoundaries,
  wordBoundariesWithoutPunctuation,
}
