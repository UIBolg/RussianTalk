import { useState } from 'react';
import { useWordProgress } from '../wordProgress.js';
import WordsBrowse from './WordsBrowse.jsx';
import WordsStudy from './WordsStudy.jsx';
import WordsListen from './WordsListen.jsx';
import WordsProgressDash from './WordsProgressDash.jsx';

const TABS = [
  { id: 'browse', label: 'Words' },
  { id: 'study', label: 'Study' },
  { id: 'listen', label: 'Listen' },
  { id: 'progress', label: 'Progress' },
];

// The "1000 Words" page shell: a back-row/title like every other screen,
// then a topic-tab row switching between the 4 sub-screens - the exact
// same shape as LanguageHacks.jsx. useWordProgress() is called once here
// and handed down, so every sub-screen reads and writes the same shared
// progress object instead of each keeping its own copy.
export default function WordsThousand({ onBack }) {
  const [tab, setTab] = useState('browse');
  // Set by WordsBrowse's "Study these" / "Listen to these" bulk actions -
  // a list of ranks to use instead of that screen's own default deck, for
  // exactly one visit to that tab.
  const [studyQueue, setStudyQueue] = useState(null);
  const [listenQueue, setListenQueue] = useState(null);
  const wp = useWordProgress();

  function openStudyWith(ranks) {
    setStudyQueue(ranks);
    setTab('study');
  }

  function openListenWith(ranks) {
    setListenQueue(ranks);
    setTab('listen');
  }

  return (
    <section>
      <div className="back-row">
        <button className="back-btn" onClick={onBack}>← Topics</button>
      </div>
      <h2 className="topic-title">
        📚 1000 Words <span className="ru">1000 слов</span>
      </h2>
      <p className="dialog-sub">
        Master the 1,000 most common Russian words with spaced-repetition flashcards - browse and
        filter, study a daily deck, listen hands-free, and track your progress. Everything here is
        saved on this device only.
      </p>

      <div className="topic-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`topic-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'browse' && <WordsBrowse wp={wp} onStudyThese={openStudyWith} onListenThese={openListenWith} />}
      {tab === 'study' && (
        <WordsStudy wp={wp} queue={studyQueue} onQueueConsumed={() => setStudyQueue(null)} />
      )}
      {tab === 'listen' && (
        <WordsListen wp={wp} queue={listenQueue} onQueueConsumed={() => setListenQueue(null)} />
      )}
      {tab === 'progress' && <WordsProgressDash wp={wp} />}
    </section>
  );
}
