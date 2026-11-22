import { useEffect, useMemo, useState } from 'react';
import { WORDS, WORDS_BY_RANK, POS_LABELS, TOPIC_LABELS } from '../wordsData.js';
import { INTERVAL, nextDueLabel, statusForRecord } from '../wordProgress.js';
import { checkSentence } from '../sentenceCheck.js';
import { speak } from '../speech.js';
import SpeakerButton from './SpeakerButton.jsx';

const DECKS = [
  { id: 'today', label: 'Today' },
  { id: 'hard', label: 'Hard & starred' },
  { id: 'weekend', label: 'Weekend review' },
];

function isHard(record) {
  return !!record && (record[3] >= 2 || record[4]);
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Mirrors the box/due-day transition in wordProgress.js's answer(), just
// without committing it - so the answer buttons can show "in 3 days" etc.
// before the student taps one.
function previewBox(record, kind, today) {
  const box = record?.[0] || 0;
  if (kind === 'again') return { box: 1, dueDay: today };
  if (kind === 'good') { const next = Math.max(1, box + 1); return { box: next, dueDay: today + INTERVAL[next] }; }
  if (kind === 'easy') { const next = Math.min(5, Math.max(1, box + 2)); return { box: next, dueDay: today + INTERVAL[next] }; }
  return { box: 5, dueDay: today + INTERVAL[5] };
}

function buildDeck(deckId, queue, wp) {
  const { today, progress, getRecord } = wp;

  if (deckId === 'custom' && queue) {
    const withRecords = queue.map((r) => ({ r, record: getRecord(r) }));
    const notMastered = withRecords.filter(({ record }) => statusForRecord(record) !== 'mastered');
    const pool = notMastered.length ? notMastered : withRecords;
    return pool.slice(0, 60).map(({ r }) => r);
  }

  if (deckId === 'hard') {
    return WORDS.filter((w) => isHard(getRecord(w.r))).slice(0, 60).map((w) => w.r);
  }

  if (deckId === 'weekend') {
    const pool = WORDS.filter((w) => {
      const st = statusForRecord(getRecord(w.r));
      return st === 'learning' || st === 'reviewing';
    }).map((w) => w.r);
    return shuffle(pool).slice(0, 80);
  }

  // 'today': due words (oldest due first), then new words in rank order up
  // to the daily goal minus new words already introduced today.
  const goal = progress.settings.goal ?? 10;
  const due = [];
  let newStartedToday = 0;
  WORDS.forEach((w) => {
    const record = getRecord(w.r);
    if (record && record[6] === today) newStartedToday += 1;
    if (wp.isDue(w.r)) due.push({ r: w.r, dueDay: record[1] });
  });
  due.sort((a, b) => a.dueDay - b.dueDay || a.r - b.r);
  const remaining = Math.max(0, goal - newStartedToday);
  const newWords = WORDS.filter((w) => !getRecord(w.r)).slice(0, remaining).map((w) => w.r);
  return [...due.map((d) => d.r), ...newWords];
}

export default function WordsStudy({ wp, queue, onQueueConsumed }) {
  const [deckId, setDeckId] = useState('today');
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [tally, setTally] = useState({ again: 0, good: 0, easy: 0, known: 0 });
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [sentenceText, setSentenceText] = useState('');
  const [checkResult, setCheckResult] = useState(null);
  // A local copy of `queue`, taken the moment it arrives - the shell
  // (WordsThousand.jsx) clears its own `queue` state in the same effect
  // tick via onQueueConsumed(), so reading the prop directly inside the
  // deck memo below would see it already cleared back to null by the time
  // deckId flips to 'custom' and the memo re-runs.
  const [customDeckQueue, setCustomDeckQueue] = useState(null);
  const dir = wp.progress.settings.dir ?? 'ru';

  useEffect(() => {
    if (queue) {
      setCustomDeckQueue(queue);
      setDeckId('custom');
      setIndex(0);
      setFlipped(false);
      setTally({ again: 0, good: 0, easy: 0, known: 0 });
      onQueueConsumed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue]);

  const deck = useMemo(
    () => buildDeck(deckId, deckId === 'custom' ? customDeckQueue : null, wp),
    // deckId/wp.today change deliberately rebuild the deck; wp.progress is
    // intentionally excluded so answering a card doesn't reshuffle the
    // deck out from under the session mid-way through.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deckId, customDeckQueue, wp.today],
  );

  const cards = useMemo(
    () => deck.map((r) => ({ r, frontIsRu: dir === 'mixed' ? Math.random() < 0.5 : dir === 'ru' })),
    [deck, dir],
  );

  const current = cards[index];
  const word = current ? WORDS_BY_RANK[current.r] : null;
  const record = current ? wp.getRecord(current.r) : null;
  const done = !cards.length || index >= cards.length;
  // Only Reviewing-stage words get the "write a sentence" practice step -
  // New/Learning words haven't been seen enough times yet to productively
  // write with, and Mastered words don't need the extra friction.
  const isReviewing = statusForRecord(record) === 'reviewing';
  const revealed = isReviewing ? !!checkResult : flipped;

  useEffect(() => {
    if (word && autoSpeak && !flipped) speak(word.ru);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word?.r]);

  // Reset the sentence-practice state every time the current card changes,
  // regardless of why (answering, switching decks, a fresh custom queue).
  useEffect(() => {
    setSentenceText('');
    setCheckResult(null);
  }, [word?.r]);

  function selectDeck(id) {
    setDeckId(id);
    setIndex(0);
    setFlipped(false);
    setTally({ again: 0, good: 0, easy: 0, known: 0 });
  }

  function answer(kind) {
    if (!current) return;
    wp.answer(current.r, kind);
    setTally((prev) => ({ ...prev, [kind]: prev[kind] + 1 }));
    setFlipped(false);
    setIndex((i) => i + 1);
  }

  useEffect(() => {
    function handleKey(e) {
      if (done || !current) return;
      // Reviewing cards have a textarea to type into - Space must stay a
      // normal space there, and there's no "flip" concept, just "checked".
      if (!isReviewing && e.code === 'Space') { e.preventDefault(); setFlipped((f) => !f); return; }
      if (!revealed) return;
      if (e.target.tagName === 'TEXTAREA') return;
      if (e.key === '1') answer('again');
      else if (e.key === '2') answer('good');
      else if (e.key === '3') answer('easy');
      else if (e.key.toLowerCase() === 'k') answer('known');
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped, revealed, isReviewing, current, done]);

  const dueTomorrow = useMemo(() => {
    const tomorrow = wp.today + 1;
    return Object.values(wp.progress.w).filter((r) => r[0] > 0 && r[0] < 5 && r[1] === tomorrow).length;
  }, [wp.progress.w, wp.today]);

  return (
    <div className="w1000-study">
      <div className="w1000-deck-row">
        {DECKS.map((d) => (
          <button key={d.id} className={`chip ${deckId === d.id ? 'active' : ''}`} onClick={() => selectDeck(d.id)}>
            {d.label}
          </button>
        ))}
        {deckId === 'custom' && <span className="chip active">Your filtered list</span>}
      </div>

      <div className="w1000-study-settings">
        <label>
          Card front:
          <select value={dir} onChange={(e) => wp.setDirection(e.target.value)}>
            <option value="ru">Russian → English</option>
            <option value="en">English → Russian</option>
            <option value="mixed">Mixed</option>
          </select>
        </label>
        <label className="w1000-toggle">
          <input type="checkbox" checked={autoSpeak} onChange={(e) => setAutoSpeak(e.target.checked)} />
          🔊 Say word aloud
        </label>
      </div>

      {done ? (
        <div className="summary">
          <div className="icon" style={{ fontSize: 30 }}>📚</div>
          <h3>Session complete</h3>
          <p>
            {tally.good + tally.easy + tally.known} remembered · {tally.again} to see again · {dueTomorrow} due tomorrow
          </p>
        </div>
      ) : (
        <>
          <div className="progress">Card {index + 1} of {cards.length}</div>
          <div className="w1000-study-progress-bar">
            <div className="fill" style={{ width: `${(index / cards.length) * 100}%` }} />
          </div>

          {isReviewing ? (
            <div className="w1000-sentence-practice">
              <div className="w1000-card-meta">
                #{word.r} · {POS_LABELS[word.pos]}{word.g ? ` · ${word.g}` : ''} · reviewing · {cards.length - index} left
              </div>
              <div className="w1000-sentence-prompt">
                Write a sentence using <strong>{word.ru}</strong>
                <SpeakerButton text={word.ru} label={`Play "${word.ru}"`} />
              </div>
              <textarea
                className="w1000-sentence-input"
                placeholder="Напишите предложение…"
                value={sentenceText}
                onChange={(e) => setSentenceText(e.target.value)}
                disabled={!!checkResult}
                rows={3}
              />
              {!checkResult ? (
                <button
                  className="account-btn"
                  disabled={!sentenceText.trim()}
                  onClick={() => setCheckResult(checkSentence(sentenceText, word.ru))}
                >
                  Check sentence
                </button>
              ) : (
                <div className={`w1000-sentence-feedback ${checkResult.ok ? 'ok' : 'needs-work'}`}>
                  {checkResult.ok ? '✓' : '⚠'} {checkResult.message}
                </div>
              )}
              <p className="w1000-sentence-disclaimer">
                This only checks that you used the word — it doesn't check grammar.
              </p>
              {checkResult && (
                <div className="w1000-card-translation">
                  {word.en}
                  {wp.progress.notes[word.r] && <span className="w1000-card-note-inline">📝 {wp.progress.notes[word.r]}</span>}
                </div>
              )}
            </div>
          ) : (
            <div className={`flip-card ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped((f) => !f)}>
              <div className="flip-card-inner">
                <div className="flip-card-face flip-card-front">
                  <span className="side-label">{current.frontIsRu ? 'Russian' : 'English'}</span>
                  <div className="main-word">{current.frontIsRu ? word.ru : word.en}</div>
                  {current.frontIsRu && (
                    <SpeakerButton text={word.ru} label={`Play "${word.ru}"`} className="train-speak-btn" />
                  )}
                  <div className="w1000-card-meta">
                    #{word.r} · {POS_LABELS[word.pos]}{word.g ? ` · ${word.g}` : ''} · {statusForRecord(record)} · {cards.length - index} left
                  </div>
                  <div className="flip-hint">Tap or press Space to flip</div>
                </div>
                <div className="flip-card-face flip-card-back">
                  <span className="side-label">{current.frontIsRu ? 'English' : 'Russian'}</span>
                  <div className="main-word">{current.frontIsRu ? word.en : word.ru}</div>
                  <div className="w1000-card-meta">
                    {word.asp ? `${word.asp} · ` : ''}{TOPIC_LABELS[word.t]} · {word.lv}
                  </div>
                  {wp.progress.notes[word.r] && <div className="w1000-card-note">📝 {wp.progress.notes[word.r]}</div>}
                </div>
              </div>
            </div>
          )}

          {revealed && (
            <>
              <div className="train-controls w1000-answer-row">
                <button className="btn-again" onClick={() => answer('again')}>
                  Again <span className="w1000-answer-eta">{nextDueLabel(1, wp.today, wp.today)}</span>
                </button>
                <button className="chip" onClick={() => answer('good')}>
                  Good <span className="w1000-answer-eta">{nextDueLabel(previewBox(record, 'good', wp.today).box, previewBox(record, 'good', wp.today).dueDay, wp.today)}</span>
                </button>
                <button className="btn-know" onClick={() => answer('easy')}>
                  Easy <span className="w1000-answer-eta">{nextDueLabel(previewBox(record, 'easy', wp.today).box, previewBox(record, 'easy', wp.today).dueDay, wp.today)}</span>
                </button>
              </div>
              <button className="w1000-already-know" onClick={() => answer('known')}>
                I already know this word
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
