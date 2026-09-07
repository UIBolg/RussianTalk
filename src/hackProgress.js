// Light gamification for the Language Hacks section: which sections have
// been viewed, and a gentle spaced-repetition nudge back to an older one.
// Everything lives in the browser's own localStorage - no backend, no
// account needed, matching the rest of this app's "no server" design. If
// storage is unavailable (private browsing, blocked, etc.) every function
// degrades to a harmless no-op instead of throwing - same "honest
// limitation, not a bug" approach as speech.js takes with missing voices.

const PROGRESS_KEY = 'rustalk-hacks-progress';
const STREAK_KEY = 'rustalk-hacks-skeleton-streak';

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage blocked or full - the feature just won't persist this visit.
  }
}

// Records that a section was opened just now. Safe to call every time a
// tab is selected, including re-selecting the same one.
export function recordSectionView(sectionId) {
  const progress = readJSON(PROGRESS_KEY, {});
  progress[sectionId] = Date.now();
  writeJSON(PROGRESS_KEY, progress);
}

// { sectionId: timestamp } for every section ever viewed (this browser only).
export function getViewedSections() {
  return readJSON(PROGRESS_KEY, {});
}

// Picks a section worth nudging the learner back to: one they've already
// viewed at least once, isn't the section they're on right now, and is the
// least-recently-viewed among the ones they've seen - a simple stand-in for
// spaced repetition without any scheduling logic to get wrong. Returns null
// if there's nothing to suggest yet (fewer than two sections viewed).
export function getComeBackTo(allSectionIds, currentSectionId) {
  const progress = getViewedSections();
  const viewedOthers = allSectionIds.filter((id) => id !== currentSectionId && progress[id]);
  if (viewedOthers.length === 0) return null;
  return viewedOthers.reduce((oldest, id) => (progress[id] < progress[oldest] ? id : oldest));
}

// A tiny streak: how many distinct sentences the learner has assembled in
// the Sentence Skeleton Builder, ever (persisted so it survives a refresh).
export function getSkeletonStreak() {
  return readJSON(STREAK_KEY, { count: 0, seen: [] });
}

// Bumps the streak only the first time a given skeleton+filler combination
// is seen - re-picking the same sentence twice shouldn't inflate it.
export function recordSkeletonSentence(skeletonId, fillerRu) {
  const streak = getSkeletonStreak();
  const key = `${skeletonId}::${fillerRu}`;
  if (streak.seen.includes(key)) return streak.count;
  const next = { count: streak.count + 1, seen: [...streak.seen, key] };
  writeJSON(STREAK_KEY, next);
  return next.count;
}
