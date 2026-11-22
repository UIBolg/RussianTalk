import { useMemo, useState } from 'react';
import { STORIES, STORY_LEVELS, knownPercent } from '../storiesData.js';
import { TOPIC_LABELS } from '../wordsData.js';

function badgeFor(storyId, wp) {
  const sp = wp.getStoryProgress(storyId);
  if (sp?.bestScore != null) return { text: `Quiz: ${sp.bestScore}/3`, tone: sp.bestScore === 3 ? 'ready' : '' };
  if (sp?.read) return { text: 'Read', tone: '' };
  return { text: 'Not started', tone: '' };
}

export default function StoryList({ wp, onOpenStory }) {
  const [level, setLevel] = useState('all');
  const [topic, setTopic] = useState('all');

  const topicsUsed = useMemo(() => [...new Set(STORIES.map((s) => s.topic))], []);

  const stories = useMemo(() => {
    return STORIES.filter((s) => (level === 'all' || s.level === level) && (topic === 'all' || s.topic === topic))
      .map((s) => ({ ...s, known: knownPercent(s, wp) }))
      .sort((a, b) => STORIES.indexOf(a) - STORIES.indexOf(b));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, topic, wp.progress]);

  return (
    <div className="stories-list">
      <div className="w1000-dropdown-row">
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="all">All levels</option>
          {STORY_LEVELS.map((lv) => <option key={lv} value={lv}>{lv}</option>)}
        </select>
        <select value={topic} onChange={(e) => setTopic(e.target.value)}>
          <option value="all">All topics</option>
          {topicsUsed.map((t) => <option key={t} value={t}>{TOPIC_LABELS[t] || t}</option>)}
        </select>
      </div>

      <div className="story-grid">
        {stories.map((s) => {
          const badge = badgeFor(s.id, wp);
          return (
            <button key={s.id} className="story-card" onClick={() => onOpenStory(s.id)}>
              <div className="story-card-top">
                <span className="story-level-pill">{s.level}</span>
                <span className="story-topic">{TOPIC_LABELS[s.topic] || s.topic}</span>
              </div>
              <h3>{s.title.ru}</h3>
              <div className="ru">{s.title.en}</div>
              <div className="story-card-meta">
                <span>{s.wordCount} words</span>
                <span className="story-known">You know {s.known}%</span>
              </div>
              <div className={`story-badge ${badge.tone}`}>{badge.text}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
