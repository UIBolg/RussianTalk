import { useMemo } from 'react';
import { TOPICS } from '../data.js';
import { cardsForTopic } from '../selectors.js';

// Picks one topic to suggest: the first one with dialogs that hasn't been
// started at all (no saved words yet), in TOPICS order; once every topic
// with dialogs has at least one saved word, falls back to whichever has
// the lowest saved-words-per-dialog ratio, i.e. the least explored so far.
function pickSuggestedTopic(flashcards) {
  const withDialogs = TOPICS.filter((t) => t.dialogs.length > 0);
  const notStarted = withDialogs.find((t) => cardsForTopic(flashcards, t.id).length === 0);
  if (notStarted) return notStarted;
  return withDialogs.reduce((least, t) => {
    const ratio = cardsForTopic(flashcards, t.id).length / t.dialogs.length;
    const leastRatio = cardsForTopic(flashcards, least.id).length / least.dialogs.length;
    return ratio < leastRatio ? t : least;
  }, withDialogs[0]);
}

// A homepage banner suggesting one topic to explore next, the same
// "progress + one clear next action" shape as WordsWidget.jsx - reusing
// the exact same cardsForTopic() selector Home.jsx's own topic grid uses,
// not a second way of counting saved words per topic.
export default function TopicsWidget({ flashcards, onOpenTopic }) {
  const withDialogs = useMemo(() => TOPICS.filter((t) => t.dialogs.length > 0), []);
  const startedCount = useMemo(
    () => withDialogs.filter((t) => cardsForTopic(flashcards, t.id).length > 0).length,
    [flashcards, withDialogs],
  );
  const suggested = useMemo(() => pickSuggestedTopic(flashcards), [flashcards]);

  return (
    <div className="word-widget" onClick={() => onOpenTopic(suggested.id)} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenTopic(suggested.id); } }}
    >
      <div className="word-widget-head">
        <span className="word-widget-icon" style={{ background: 'var(--sage-tint)' }}>🗺️</span>
        <div className="word-widget-titles">
          <h3>Topics</h3>
          <p>{startedCount}/{withDialogs.length} topics started · {flashcards.length} word{flashcards.length === 1 ? '' : 's'} saved</p>
        </div>
      </div>
      <div className="word-widget-footer">
        <span className="word-widget-hint">
          {suggested.icon} <strong>{suggested.title}</strong> — {suggested.dialogs.length} dialog{suggested.dialogs.length === 1 ? '' : 's'}
        </span>
        <button className="word-widget-cta" onClick={(e) => { e.stopPropagation(); onOpenTopic(suggested.id); }}>
          Explore {suggested.title} →
        </button>
      </div>
    </div>
  );
}
