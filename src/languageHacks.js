// Content for the "Language Hacks" section — a visual reference for the
// highest-leverage Russian patterns, aimed at an Arabic-speaking beginner.
// Kept separate from the components that render it, the same way data.js
// keeps dialog content separate from ChatPanel.jsx.

// A small accent palette for color-coding prefixes/cases across every Hacks
// component. Not new colors: five of these are the exact hex values already
// used elsewhere in the app as topic colors (see TOPICS in data.js) — reused
// here instead of inventing a second palette.
export const HACK_COLORS = {
  amber: '#C17F2B',  // = --amber
  frost: '#3D6C86',  // = --frost
  sage: '#5C7A52',   // = --sage
  plum: '#8B5E83',   // same as the hotels/smalltalk topic color
  brick: '#A6403D',  // same as the emergencies topic color
  teal: '#2F7A6E',   // same as the banksim topic color
};

export const ROOT_FAMILIES = [
  {
    id: 'kliuch',
    root: 'ключ',
    rootMeaning: 'key / lock',
    words: [
      { word: 'ключ', prefix: '', tr: 'key', breakdown: 'ключ = "key" — the root on its own.' },
      { word: 'включить', prefix: 'в-', tr: 'to switch on', breakdown: 'в- ("into") + ключ = turn the key into the locked/on position.' },
      { word: 'выключить', prefix: 'вы-', tr: 'to switch off', breakdown: 'вы- ("out of") + ключ = turn the key out of the on position.' },
      { word: 'подключить', prefix: 'под-', tr: 'to connect', breakdown: 'под- ("up to") + ключ = bring something up to the key/connection.' },
      { word: 'переключить', prefix: 'пере-', tr: 'to switch over', breakdown: 'пере- ("across") + ключ = turn across to a different setting.' },
      { word: 'заключить', prefix: 'за-', tr: 'to conclude', breakdown: 'за- ("behind/shut") + ключ = lock an agreement shut.' },
      { word: 'включение', prefix: 'в-', tr: 'activation', breakdown: 'в- ("into") + ключ + -ение (noun ending) = the act of switching on.' },
    ],
  },
  {
    id: 'nesti',
    root: 'нести',
    rootMeaning: 'to carry (on foot, one trip)',
    words: [
      { word: 'нести', prefix: '', tr: 'to carry', breakdown: 'нести = "to carry" — the root on its own.' },
      { word: 'принести', prefix: 'при-', tr: 'to bring', breakdown: 'при- ("arrival") + нести = carry here, arriving.' },
      { word: 'унести', prefix: 'у-', tr: 'to carry away', breakdown: 'у- ("away") + нести = carry away, remove.' },
      { word: 'вынести', prefix: 'вы-', tr: 'to carry out', breakdown: 'вы- ("out of") + нести = carry out of a place.' },
      { word: 'занести', prefix: 'за-', tr: 'to drop off', breakdown: 'за- ("on the way") + нести = carry somewhere in passing.' },
      { word: 'перенести', prefix: 'пере-', tr: 'to move / postpone', breakdown: 'пере- ("across") + нести = carry across, reschedule.' },
    ],
  },
];

// The 12 most productive prefixes, each with a spatial arrow and the one
// accent color it keeps everywhere in the Hacks section (PrefixMap, the
// root-family branches, and MotionVerbs' prefix family all read from this
// same lookup, so "при-" is always the same color and arrow).
export const PREFIXES = [
  { prefix: 'в-', arrow: '→', meaning: 'into / entering', color: HACK_COLORS.amber },
  { prefix: 'вы-', arrow: '←', meaning: 'out of / exiting', color: HACK_COLORS.frost },
  { prefix: 'при-', arrow: '↘', meaning: 'arriving, bringing near', color: HACK_COLORS.teal },
  { prefix: 'от-', arrow: '↖', meaning: 'moving away, detaching', color: HACK_COLORS.frost },
  { prefix: 'у-', arrow: '↰', meaning: 'leaving, removing completely', color: HACK_COLORS.frost },
  { prefix: 'под-', arrow: '↷', meaning: 'approaching, going underneath', color: HACK_COLORS.plum },
  { prefix: 'пере-', arrow: '⇄', meaning: 'crossing over, switching', color: HACK_COLORS.brick },
  { prefix: 'за-', arrow: '↷', meaning: 'starting an action, going behind', color: HACK_COLORS.teal },
  { prefix: 'на-', arrow: '↓', meaning: 'onto a surface, accumulating', color: HACK_COLORS.amber },
  { prefix: 'раз-/рас-', arrow: '⇉', meaning: 'spreading apart, undoing', color: HACK_COLORS.brick },
  { prefix: 'с-/со-', arrow: '↓', meaning: 'joining together, moving down', color: HACK_COLORS.sage },
  { prefix: 'вз-/вс-', arrow: '↑', meaning: 'sudden upward motion', color: HACK_COLORS.teal },
];

// Fast lookup so other components (root branches, motion verb family) can
// find a prefix's color/arrow without re-declaring the list.
export const PREFIX_INFO = Object.fromEntries(PREFIXES.map((p) => [p.prefix, p]));

// Six cases, four "primary" ones shown larger (matter most for a beginner
// traveler) and two "secondary" ones shown smaller.
export const CASES = [
  {
    id: 'nominative', name: 'Nominative', ru: 'Именительный', primary: true, color: HACK_COLORS.amber,
    question: 'Кто? Что?', questionTr: 'Who? What?',
    relation: 'The subject doing the action — the plain dictionary form.',
    example: { ru: 'Это Иван.', tr: 'This is Ivan.', highlight: 'Иван' },
  },
  {
    id: 'accusative', name: 'Accusative', ru: 'Винительный', primary: true, color: HACK_COLORS.frost,
    question: 'Кого? Что?', questionTr: 'Whom? What?',
    relation: 'The direct object — what receives the action.',
    example: { ru: 'Я вижу Ивана.', tr: 'I see Ivan.', highlight: 'Ивана' },
  },
  {
    id: 'genitive', name: 'Genitive', ru: 'Родительный', primary: true, color: HACK_COLORS.sage,
    question: 'Кого? Чего?', questionTr: 'Of whom? Of what?',
    relation: 'Possession, or absence after "нет" — like Arabic إضافة (construct state).',
    example: { ru: 'У меня нет билета.', tr: "I don't have a ticket.", highlight: 'билета' },
  },
  {
    id: 'prepositional', name: 'Prepositional', ru: 'Предложный', primary: true, color: HACK_COLORS.teal,
    question: 'О ком? О чём? Где?', questionTr: 'About whom/what? Where?',
    relation: 'Location or topic — only ever appears after a preposition.',
    example: { ru: 'Я в метро.', tr: "I'm in the metro.", highlight: 'метро' },
  },
  {
    id: 'dative', name: 'Dative', ru: 'Дательный', primary: false, color: HACK_COLORS.plum,
    question: 'Кому? Чему?', questionTr: 'To whom?',
    relation: 'The receiver — "to/for" someone.',
    example: { ru: 'Мне нужно такси.', tr: 'I need a taxi (lit. "to me is needed").', highlight: 'Мне' },
  },
  {
    id: 'instrumental', name: 'Instrumental', ru: 'Творительный', primary: false, color: HACK_COLORS.brick,
    question: 'Кем? Чем?', questionTr: 'By/with whom or what?',
    relation: 'The tool or means — "by/with" something.',
    example: { ru: 'Можно оплатить картой?', tr: 'Can I pay by card?', highlight: 'картой' },
  },
];

// A short branching decision tree, walked one yes/no question at a time by
// AspectHelper.jsx. Each leaf gives the aspect plus one example sentence.
export const ASPECT_TREE = {
  question: 'Is this a habit, a repeated action, or still ongoing?',
  yes: {
    aspect: 'imperfective', label: 'Imperfective — несовершенный вид',
    example: { ru: 'Я читаю книгу каждый день.', tr: 'I read a book every day.' },
  },
  no: {
    question: 'Is this one specific action with a clear, completed result?',
    yes: {
      aspect: 'perfective', label: 'Perfective — совершенный вид',
      example: { ru: 'Я прочитал книгу.', tr: 'I read (finished) the book.' },
    },
    no: {
      question: 'Are you describing the process itself, without saying whether it finished?',
      yes: {
        aspect: 'imperfective', label: 'Imperfective — несовершенный вид',
        example: { ru: 'Вчера я читал книгу.', tr: 'Yesterday I was reading a book.' },
      },
      no: {
        aspect: 'perfective', label: 'Perfective — совершенный вид',
        example: { ru: 'Я куплю билет завтра.', tr: 'I will buy a ticket tomorrow.' },
      },
    },
  },
};

export const MOTION_VERB_PAIRS = [
  { oneDirection: 'идти', multiDirection: 'ходить', tr: 'to go (on foot)' },
  { oneDirection: 'ехать', multiDirection: 'ездить', tr: 'to go (by vehicle)' },
  { oneDirection: 'нести', multiDirection: 'носить', tr: 'to carry' },
  { oneDirection: 'вести', multiDirection: 'водить', tr: 'to lead / drive' },
  { oneDirection: 'лететь', multiDirection: 'летать', tr: 'to fly' },
];

// Same idti/ekhat' root, prefixed the same way as the ключ/нести families
// above — reuses PREFIX_INFO so при-/у-/вы-/в- match their color everywhere.
export const MOTION_PREFIX_FAMILY = {
  baseLabel: 'идти / ехать',
  members: [
    { prefix: 'при-', word: 'прийти', tr: 'to arrive (on foot)' },
    { prefix: 'у-', word: 'уйти', tr: 'to leave' },
    { prefix: 'вы-', word: 'выйти', tr: 'to exit' },
    { prefix: 'в-', word: 'войти', tr: 'to enter' },
  ],
};

export const SKELETONS = [
  { id: 'need', pattern: 'Мне нужно ___', tr: 'I need ___', caseNote: 'dative "мне" + noun/infinitive' },
  { id: 'want', pattern: 'Я хочу ___', tr: 'I want ___', caseNote: 'accusative' },
  { id: 'where-can', pattern: 'Где можно ___?', tr: 'Where can I ___?', caseNote: 'infinitive' },
  { id: 'how-much', pattern: 'Сколько стоит ___?', tr: 'How much is ___?', caseNote: 'nominative' },
  { id: 'no', pattern: 'У меня нет ___', tr: "I don't have ___", caseNote: 'genitive after нет' },
  { id: 'may-i', pattern: 'Можно ___?', tr: 'May I ___?', caseNote: 'infinitive / accusative' },
  { id: 'like', pattern: 'Мне нравится ___', tr: 'I like ___', caseNote: 'nominative (thing liked)' },
  { id: 'looking-for', pattern: 'Я ищу ___', tr: "I'm looking for ___", caseNote: 'accusative' },
];

export const SKELETON_FILLERS = {
  need: [
    { ru: 'такси', tr: 'a taxi' },
    { ru: 'помощь', tr: 'help' },
    { ru: 'билет', tr: 'a ticket' },
  ],
  want: [
    { ru: 'кофе', tr: 'coffee' },
    { ru: 'номер', tr: 'a room' },
    { ru: 'воду', tr: 'water' },
  ],
  'where-can': [
    { ru: 'купить билет', tr: 'buy a ticket' },
    { ru: 'найти такси', tr: 'find a taxi' },
    { ru: 'поменять деньги', tr: 'exchange money' },
  ],
  'how-much': [
    { ru: 'билет', tr: 'the ticket' },
    { ru: 'номер', tr: 'the room' },
    { ru: 'это', tr: 'this' },
  ],
  no: [
    { ru: 'билета', tr: 'a ticket' },
    { ru: 'денег', tr: 'money' },
    { ru: 'паспорта', tr: 'a passport' },
  ],
  'may-i': [
    { ru: 'оплатить картой', tr: 'pay by card' },
    { ru: 'фотографировать', tr: 'take photos' },
    { ru: 'сесть здесь', tr: 'sit here' },
  ],
  like: [
    { ru: 'этот город', tr: 'this city' },
    { ru: 'русский язык', tr: 'the Russian language' },
    { ru: 'кофе', tr: 'coffee' },
  ],
  'looking-for': [
    { ru: 'аптеку', tr: 'a pharmacy' },
    { ru: 'станцию метро', tr: 'a metro station' },
    { ru: 'гостиницу', tr: 'a hotel' },
  ],
};

export const ARABIC_RUSSIAN_CARDS = [
  {
    title: 'Root System',
    arabicLabel: 'جذر — root',
    arabicExample: 'ك-ت-ب → كتاب، كاتب، مكتبة',
    russianExample: 'ключ → включить, выключить, ключевой',
    why: 'Both languages build a whole word family from one root — spot the root, and you can guess the family.',
  },
  {
    title: 'Construct State ↔ Genitive',
    arabicLabel: 'إضافة — construct state',
    arabicExample: 'بيت إيفان — "Ivan\'s house"',
    russianExample: 'дом Ивана — "Ivan\'s house"',
    why: 'Arabic إضافة and the Russian genitive both show possession by placing the owner right after the thing owned.',
  },
  {
    title: 'No "To Be" in the Present',
    arabicLabel: 'أنا طالب — "I [am a] student"',
    arabicExample: 'لا يوجد فعل "يكون" في الحاضر',
    russianExample: 'Я студент. — "I [am a] student."',
    why: 'Neither language uses a present-tense "to be" — you already know how to drop it.',
  },
  {
    title: 'Double Negation Is Correct',
    arabicLabel: 'ما شفت حدا — "I didn\'t see nobody"',
    arabicExample: 'ما في حدا — "there isn\'t nobody"',
    russianExample: 'Я никого не видел. — "I didn\'t see nobody."',
    why: 'English flags double negatives as a mistake — Arabic and Russian both require them.',
  },
  {
    title: 'Feminine Ending',
    arabicLabel: 'ة — ta marbuta',
    arabicExample: 'معلمة — teacher (f.)',
    russianExample: 'студентка — student (f.), ending -а',
    why: 'A word ending marks "feminine" in both languages — trust the ending, don\'t just memorize gender.',
  },
];

export const TOP_FIFTEEN = [
  'Russian roots work like Arabic roots — find the root, and prefixes/suffixes tell you the rest.',
  '12 prefixes cover most verb meanings — learn the prefix map once, reuse it everywhere.',
  'Cases replace prepositions and fixed word order — the ending tells you the relationship.',
  'Nominative, Accusative, Genitive, and Prepositional cover most travel Russian — learn those four first.',
  'Genitive shows up after "нет" and after numbers — "no X" and "how many X" both need it.',
  'Aspect is about finished vs. not finished — imperfective for process/habit, perfective for one completed result.',
  'Motion verbs split into "one trip" vs. "habitual/round trip" — идти vs ходить, ехать vs ездить.',
  'Adding a prefix to a motion verb builds a whole family: прийти, уйти, выйти, войти.',
  'No "to be" in the present tense — just like Arabic, skip it entirely.',
  'Double negatives are correct Russian — "никого не видел" is proper, not a mistake.',
  '"Мне нужно / Я хочу / Где можно / Сколько стоит" are your four highest-value sentence starters.',
  'Feminine nouns and adjectives usually end in -а/-я — the ending does the work, like Arabic ة.',
  'Word order is flexible because case endings carry the meaning — don\'t stress over sentence order.',
  'Stress position changes pronunciation, not spelling — listen for it, don\'t just read it.',
  'When stuck, "Я не понимаю. Повторите, пожалуйста." gets you further than staying silent.',
];
