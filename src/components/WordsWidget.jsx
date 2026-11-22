import { useMemo } from 'react';
import { WORDS } from '../wordsData.js';
import { useWordProgress } from '../wordProgress.js';

const TOTAL = 1000;

// A homepage banner for the 1000 Words feature - not a topic, so it
// doesn't belong in the topic-card grid, but prominent enough that a
// student sees their progress and has one clear next action the moment
// they land on the app. Reuses useWordProgress() directly (same engine,
// same localStorage key as WordsThousand.jsx) rather than duplicating the
// mastered/due-count math anywhere else.
export default function WordsWidget({ onOpenWords, onStartStudy }) {
  const wp = useWordProgress();

  const { mastered, dueToday, started } = useMemo(() => {
    let m = 0, due = 0, s = 0;
    WORDS.forEach((w) => {
      const record = wp.getRecord(w.r);
      if (record) s += 1;
      if (wp.status(w.r) === 'mastered') m += 1;
      if (wp.isDue(w.r)) due += 1;
    });
    return { mastered: m, dueToday: due, started: s };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wp.progress]);

  const ctaLabel = !started
    ? 'Start learning your first 10 words →'
    : dueToday > 0
      ? `Review ${Math.min(dueToday, 20)} word${dueToday === 1 ? '' : 's'} due today →`
      : 'Learn your next 10 words →';

  return (
    <div className="word-widget" onClick={onOpenWords} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenWords(); } }}
    >
      <div className="word-widget-head">
        <span className="word-widget-icon">📚</span>
        <div className="word-widget-titles">
          <h3>1000 Words</h3>
          <p>Master the 1,000 most common Russian words</p>
        </div>
        <div className="word-widget-stat">
          <span className="num">{mastered}</span><span className="of">/{TOTAL}</span>
          <span className="label">mastered</span>
        </div>
      </div>
      <div className="word-widget-bar">
        <div className="fill" style={{ width: `${(mastered / TOTAL) * 100}%` }} />
      </div>
      <div className="word-widget-footer">
        <span className="word-widget-hint">
          {wp.streak > 0 ? `🔥 ${wp.streak}-day streak` : `${TOTAL - started} words not started yet`}
        </span>
        <button
          className="word-widget-cta"
          onClick={(e) => { e.stopPropagation(); onStartStudy(); }}
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
