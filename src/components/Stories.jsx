import { useState } from 'react';
import { useWordProgress } from '../wordProgress.js';
import StoryList from './StoryList.jsx';
import StoryReader from './StoryReader.jsx';
import StoryQuiz from './StoryQuiz.jsx';

// The Stories page shell. Unlike LanguageHacks.jsx/WordsThousand.jsx's
// parallel tab row, Stories is a sequential flow - list, then one story's
// reader, then optionally its quiz - so it tracks a view plus the current
// storyId instead, closer to how TopicView.jsx nests a dialog inside a
// topic. useWordProgress() is called once here, the same shared engine
// and localStorage object 1000 Words uses, per the handoff doc.
export default function Stories({ onBack, initialStoryId }) {
  const [view, setView] = useState(initialStoryId ? 'reader' : 'list');
  const [storyId, setStoryId] = useState(initialStoryId ?? null);
  const wp = useWordProgress();

  return (
    <section>
      <div className="back-row">
        <button className="back-btn" onClick={() => (view === 'list' ? onBack() : setView('list'))}>
          ← {view === 'list' ? 'Topics' : 'Stories'}
        </button>
      </div>

      {view === 'list' && (
        <>
          <h2 className="topic-title">
            📖 Stories <span className="ru">Истории</span>
          </h2>
          <p className="dialog-sub">
            Follow Leila's trip to Saint Petersburg across 30 graded stories - tap any word to see
            what it means, then test yourself with a quick quiz.
          </p>
          <StoryList wp={wp} onOpenStory={(id) => { setStoryId(id); setView('reader'); }} />
        </>
      )}

      {view === 'reader' && (
        <StoryReader wp={wp} storyId={storyId} onOpenQuiz={() => setView('quiz')} />
      )}

      {view === 'quiz' && (
        <StoryQuiz wp={wp} storyId={storyId} onDone={() => setView('reader')} />
      )}
    </section>
  );
}
