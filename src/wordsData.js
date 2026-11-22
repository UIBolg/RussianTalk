import rawWords from './data/words.json';

// Strips stress marks (the combining acute accent U+0301) and normalizes ё
// to е, so search works whether or not a student types the accent - the
// same idea as the rest of the app treating "please" as one word no matter
// where it's typed from.
function strip(s) {
  return s.replace(/́/g, '').toLowerCase().replace(/ё/g, 'е');
}

export const WORDS = rawWords.map(([r, ru, en, pos, lv, g, t, asp]) => ({
  r, ru, plain: strip(ru), en, pos, lv, g, t, asp,
}));

export const WORDS_BY_RANK = Object.fromEntries(WORDS.map((w) => [w.r, w]));

export const TOPIC_LABELS = {
  gr: 'Grammar essentials', talk: 'Greetings & expressions', link: 'Linking & discourse',
  ppl: 'People & family', body: 'Body & health', food: 'Food & drink', home: 'Home & things',
  city: 'City & places', trav: 'Travel & transport', dir: 'Place & direction',
  shop: 'Money & shopping', abs: 'Ideas & concepts', time: 'Time & calendar',
  nat: 'Nature & weather', work: 'Work & study', arts: 'Culture & leisure',
  soc: 'Society & politics', feel: 'Feelings & character', mind: 'Thinking & talking',
  act: 'Everyday actions', move: 'Motion verbs', desc: 'Descriptions & colours',
  num: 'Numbers & amounts',
};

export const POS_LABELS = {
  n: 'Noun', v: 'Verb', a: 'Adjective', av: 'Adverb', pn: 'Pronoun', pr: 'Preposition',
  cj: 'Conjunction', pt: 'Particle', d: 'Determiner', nu: 'Number', i: 'Interjection',
};

export const LEVELS = ['A1', 'A2', 'B1', 'B2'];

export const GENDER_LABELS = { m: 'masculine', f: 'feminine', n: 'neuter' };

// These exact hex values come from the handoff doc's already-tested
// standalone prototype - kept as given rather than mapped onto the app's
// amber/frost/sage tokens, the same way HACK_COLORS in languageHacks.js
// kept its own small palette rather than overloading existing ones.
export const STATUS_COLORS = { new: '#9AA0A6', learning: '#D9822B', reviewing: '#3A78B5', mastered: '#16705F' };
export const GENDER_COLORS = { m: '#3A78B5', f: '#C0415A', n: '#D9822B' };

export const FREQUENCY_BANDS = [
  { id: '1-100', label: '1–100', min: 1, max: 100 },
  { id: '101-250', label: '101–250', min: 101, max: 250 },
  { id: '251-500', label: '251–500', min: 251, max: 500 },
  { id: '501-750', label: '501–750', min: 501, max: 750 },
  { id: '751-1000', label: '751–1000', min: 751, max: 1000 },
];

export const TRIP_KIT_TOPICS = ['talk', 'trav', 'food', 'shop', 'dir', 'city', 'num'];
