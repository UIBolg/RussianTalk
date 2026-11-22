import raw from './data/stories.json';

export const STORIES = raw.stories;
export const STORIES_BY_ID = Object.fromEntries(STORIES.map((s) => [s.id, s]));

export const STORY_LEVELS = ['A1', 'A2'];

// A token is [text], [text, rank], or [text, null, nameOrGloss]. Centralized
// here (not re-derived per component) since both the reader and the quiz's
// "add unknown words" step need to tell these three shapes apart.
export function tokenKind(token) {
  if (token.length === 1) return 'plain';
  if (token.length === 2) return 'word';
  return token[2] === 'name' ? 'name' : 'gloss';
}
