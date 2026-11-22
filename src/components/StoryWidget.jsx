import { useMemo } from 'react';
import { STORIES, knownPercent, pickSuggestedStory } from '../storiesData.js';
import { useWordProgress } from '../wordProgress.js';

// A homepage banner suggesting the next story to read, same shape as
// WordsWidget.jsx and TopicsWidget.jsx. Calls useWordProgress() itself
// (a separate instance from Stories.jsx's - safe, since they're never
// mounted at the same time, same reasoning as WordsWidget.jsx).
export default function StoryWidget({ onOpenStory }) {
  const wp = useWordProgress();

  const readCount = useMemo(
    () => STORIES.filter((s) => wp.getStoryProgress(s.id)?.read).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wp.progress],
  );
  const { story, reason } = useMemo(() => pickSuggestedStory(wp), [wp]);
  const known = knownPercent(story, wp);

  return (
    <div className="word-widget" onClick={() => onOpenStory(story.id)} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenStory(story.id); } }}
    >
      <div className="word-widget-head">
        <span className="word-widget-icon" style={{ background: 'var(--frost-tint)' }}>📖</span>
        <div className="word-widget-titles">
          <h3>Stories</h3>
          <p>{readCount}/{STORIES.length} stories read</p>
        </div>
      </div>
      <div className="word-widget-footer">
        <span className="word-widget-hint">
          {reason === 'next' ? 'Next story' : 'Story of the day'}: <strong>{story.title.ru}</strong> ({story.level}) ·
          {' '}you know {known}%
        </span>
        <button className="word-widget-cta" onClick={(e) => { e.stopPropagation(); onOpenStory(story.id); }}>
          Read now →
        </button>
      </div>
    </div>
  );
}
