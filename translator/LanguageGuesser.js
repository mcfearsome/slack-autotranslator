
const DEFAULT_THRESHOLD = 0.15;


// Attempts to guess language based on words and letters provided by user.
class LanguageGuesser {

  constructor(settings) {
    this.threshold = settings.threshold || DEFAULT_THRESHOLD;
    this.sourceLanguages = settings.languages || [
      // Example entry:
      // {
      //   code: 'en',
      //   words: ['example', 'word'],
      //   letters: ['w']
      // }
    ];
  }

  // Resolves with best matching language or rejects promise
  detect(content) {
    return new Promise((resolve, reject) => {
      const words = this._wordFrequency(content);
      const guess = this._matchLanguages(content, words)[0];

      if (guess) {
        resolve(guess);
      } else {
        reject();
      }
    });
  }


  // Calculates match for each language
  _matchLanguages(content, words) {
    return this.sourceLanguages
      .map((language) => {
        const wordScore = this._scoreWords(words, language.words);
        const letterScore = (language.letters != undefined) ? this._scoreLetters(content, language.letters) : 0;
        const averageScore = (wordScore + letterScore) / 2.0;

        return {
          code: language.code,
          score: averageScore
        };
      })
      .filter((entry) => entry.score > this.threshold)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.code);
  }

  // Counts occurrence of each word
  _wordFrequency(content) {

    const occurrence = {};
    const words = content
      .split(/[\s:;,.()\[\]\*-_`~><?!]+/)
      .filter((word) => word.length > 0);

    for (const word of words) {
      const lowerWord = word.toLowerCase();
      occurrence[lowerWord] = occurrence[lowerWord] + 1 || 1;
    }

    return occurrence;
  }

  // Scores occurrences based on words that match
  _scoreWords(occurrence, language) {
    let total = 0;
    let matching = 0;

    for (const word of Object.keys(occurrence)) {
      if (language.includes(word)) {
        matching += occurrence[word];
      }
      total += occurrence[word];
    }

    return matching / total;
  }

  // Scores letters based on number of letters that match language
  _scoreLetters(content, letters) {
    let matching = 0;

    for (let i = 0; i < content.length; i++) {
      const letter = content[i].toLowerCase();
      if (letters.includes(letter)) {
        matching += 1;
      }
    }

    return matching / content.length;
  }
}


module.exports = LanguageGuesser;
