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

// What share of a story's linked words the student already knows at least
// a little (anything past "new") - shared by StoryList.jsx's cards and the
// homepage StoryWidget, so both show the same number for the same story.
export function knownPercent(story, wp) {
  if (!story.listWords.length) return 100;
  const known = story.listWords.filter((r) => wp.status(r) !== 'new').length;
  return Math.round((known / story.listWords.length) * 100);
}

// The next story to suggest: the first not-yet-read one, in list order (A1
// stories before A2, same order the data ships in) - so a student
// naturally progresses through the set instead of jumping around. Once
// every story has been read, falls back to a deterministic "story of the
// day" pick (rotating by day number) so there's always something to
// suggest rather than the widget going blank.
export function pickSuggestedStory(wp) {
  const unread = STORIES.find((s) => !wp.getStoryProgress(s.id)?.read);
  if (unread) return { story: unread, reason: 'next' };
  return { story: STORIES[wp.today % STORIES.length], reason: 'daily' };
}
