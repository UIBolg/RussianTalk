import { strip } from './wordsData.js';

// A deliberately simple, local, no-network check for the "write a sentence
// using this word" practice step on Reviewing-stage words in 1000 Words.
// Honest about what it is NOT: a grammar checker. It can't tell you if a
// case ending, word order, or verb conjugation is correct - it only
// checks (a) that the sentence actually contains some form of the target
// word, and (b) that it's a real sentence, not just the bare word typed
// back. Real grammar verification would need an outside service or an AI
// call - a deliberate scope decision, not an oversight; see
// ARCHITECTURE.md.
//
// "Some form of the word" is approximated by stripping stress marks/ё the
// same way search does, then matching a truncated stem rather than the
// exact word, so a different case/tense ending (e.g. "работаю" for
// "работать") still counts. The amount trimmed grows with word length -
// short words lose fewer letters, since trimming too much off a short
// word would match almost anything.
function stemOf(word) {
  if (word.length <= 3) return word;
  const trim = word.length <= 6 ? 1 : word.length <= 9 ? 2 : 3;
  return word.slice(0, word.length - trim);
}

export function checkSentence(sentenceText, wordRu) {
  const stem = stemOf(strip(wordRu));
  const tokens = strip(sentenceText).match(/[а-яё]+/gi) || [];
  const usesWord = tokens.some((t) => t.startsWith(stem));
  const looksLikeSentence = tokens.length >= 3;

  let message;
  if (!tokens.length) {
    message = 'Write a sentence to check.';
  } else if (!looksLikeSentence) {
    message = 'Try writing a full sentence, not just the word by itself.';
  } else if (!usesWord) {
    message = `Make sure your sentence actually uses a form of "${wordRu}".`;
  } else {
    message = 'Looks good — you used the word in a real sentence!';
  }

  return { ok: usesWord && looksLikeSentence, usesWord, looksLikeSentence, message };
}
