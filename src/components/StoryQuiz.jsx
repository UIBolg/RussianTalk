import { useEffect, useMemo, useState } from 'react';
import { STORIES_BY_ID } from '../storiesData.js';

function shuffledQuestion(q) {
  const order = q.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return {
    q: q.q, qEn: q.qEn,
    options: order.map((i) => q.options[i]),
    correctIndex: order.indexOf(q.answer),
  };
}

export default function StoryQuiz({ wp, storyId, onDone }) {
  const story = STORIES_BY_ID[storyId];
  const questions = useMemo(() => story.quiz.map(shuffledQuestion), [storyId]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [showEnglish, setShowEnglish] = useState(false);
  const [addedWords, setAddedWords] = useState(false);

  const done = index >= questions.length;
  const current = !done ? questions[index] : null;

  useEffect(() => {
    if (done) wp.saveStoryQuizScore(storyId, score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  function choose(i) {
    if (selected != null) return;
    setSelected(i);
    if (i === current.correctIndex) setScore((s) => s + 1);
  }

  function next() {
    setSelected(null);
    setIndex((i) => i + 1);
  }

  // Snapshotted once, when the quiz finishes, rather than recomputed every
  // render - otherwise the button's own click (which moves these ranks out
  // of "new" status) would immediately make this list empty and the whole
  // button vanish instead of showing its "✓ Added" confirmed state.
  const unknownRanks = useMemo(
    () => story.listWords.filter((r) => wp.status(r) === 'new'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [done],
  );

  function addUnknownWords() {
    unknownRanks.forEach((r) => wp.setBox(r, 1));
    setAddedWords(true);
  }

  if (done) {
    return (
      <div className="story-reader">
        <div className="summary">
          <div className="icon" style={{ fontSize: 30 }}>🏆</div>
          <h3>Quiz complete</h3>
          <p>You scored {score}/{questions.length} on "{story.title.ru}"</p>
        </div>
        {unknownRanks.length > 0 && (
          <button className="account-btn" onClick={addUnknownWords} disabled={addedWords}>
            {addedWords ? '✓ Added' : `+ Add ${unknownRanks.length} unknown word${unknownRanks.length === 1 ? '' : 's'} to study queue`}
          </button>
        )}
        <button className="chip w1000-show-more" onClick={onDone}>← Back to story</button>
      </div>
    );
  }

  return (
    <div className="story-reader">
      <div className="progress">Question {index + 1} of {questions.length}</div>
      <div className="w1000-study-progress-bar">
        <div className="fill" style={{ width: `${(index / questions.length) * 100}%` }} />
      </div>

      <label className="w1000-toggle" style={{ marginBottom: 12 }}>
        <input type="checkbox" checked={showEnglish} onChange={(e) => setShowEnglish(e.target.checked)} />
        Show English question
      </label>

      <div className="quiz-question">
        <h3>{current.q}</h3>
        {showEnglish && <p className="ru">{current.qEn}</p>}
      </div>

      <div className="quiz-options">
        {current.options.map((opt, i) => {
          let cls = 'quiz-option';
          if (selected != null) {
            if (i === current.correctIndex) cls += ' correct';
            else if (i === selected) cls += ' incorrect';
          }
          return (
            <button key={i} className={cls} onClick={() => choose(i)} disabled={selected != null}>
              {opt.ru}
              {showEnglish && <span className="quiz-option-en">{opt.en}</span>}
            </button>
          );
        })}
      </div>

      {selected != null && (
        <button className="account-btn" onClick={next}>
          {selected === current.correctIndex ? '✓ Correct — Next' : '✕ Next'}
        </button>
      )}
    </div>
  );
}
