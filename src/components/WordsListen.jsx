import { useEffect, useMemo, useRef, useState } from 'react';
import { WORDS, WORDS_BY_RANK } from '../wordsData.js';
import { statusForRecord } from '../wordProgress.js';
import { speakWordDrill, stopSpeaking } from '../speech.js';

const SPEEDS = [
  { id: 'slow', label: 'Slow', rate: 0.7 },
  { id: 'relaxed', label: 'Relaxed', rate: 0.85 },
  { id: 'normal', label: 'Normal', rate: 1 },
];

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildPlaylist(source, queue, wp) {
  const { today, getRecord } = wp;

  let ranks = [];
  if (source === 'filters' && queue) {
    ranks = queue.slice(0, 100);
  } else if (source === 'new') {
    ranks = WORDS.filter((w) => !getRecord(w.r)).slice(0, 20).map((w) => w.r);
  } else {
    // 'week': introduced in the last 7 days and not yet mastered.
    ranks = WORDS.filter((w) => {
      const r = getRecord(w.r);
      return r && r[6] != null && today - r[6] <= 7 && statusForRecord(r) !== 'mastered';
    }).map((w) => w.r);
  }

  // If the chosen playlist would be empty, fall back to the next new words
  // rather than leaving the screen with nothing to play.
  if (!ranks.length) {
    ranks = WORDS.filter((w) => !getRecord(w.r)).slice(0, 20).map((w) => w.r);
  }
  return ranks;
}

export default function WordsListen({ wp, queue, onQueueConsumed }) {
  const [source, setSource] = useState('week');
  const [speedId, setSpeedId] = useState('relaxed');
  const [shuffled, setShuffled] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [index, setIndex] = useState(0);
  const controllerRef = useRef(null);

  useEffect(() => {
    if (queue) {
      setSource('filters');
      onQueueConsumed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue]);

  const playlist = useMemo(() => {
    const ranks = buildPlaylist(source, source === 'filters' ? queue : null, wp);
    return shuffled ? shuffle(ranks) : ranks;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, shuffled, wp.today]);

  const rate = SPEEDS.find((s) => s.id === speedId).rate;

  function stop() {
    controllerRef.current?.stop();
    controllerRef.current = null;
    setPlaying(false);
    setPaused(false);
  }

  function start() {
    if (!playlist.length) return;
    stop();
    const words = playlist.map((r) => WORDS_BY_RANK[r]).map((w) => ({ ru: w.ru, en: w.en }));
    setPlaying(true);
    setPaused(false);
    controllerRef.current = speakWordDrill(words, {
      rate,
      onStepStart: (i) => setIndex(i),
      onDone: () => { setPlaying(false); setPaused(false); setIndex(0); },
    });
  }

  function togglePause() {
    if (!controllerRef.current) return;
    if (paused) { controllerRef.current.resume(); setPaused(false); }
    else { controllerRef.current.pause(); setPaused(true); }
  }

  useEffect(() => () => stopSpeaking(), []);

  const current = playlist.length ? WORDS_BY_RANK[playlist[Math.min(index, playlist.length - 1)]] : null;

  return (
    <div className="w1000-listen">
      <div className="w1000-deck-row">
        <button className={`chip ${source === 'week' ? 'active' : ''}`} onClick={() => { stop(); setSource('week'); }}>This week's words</button>
        {queue && <button className={`chip ${source === 'filters' ? 'active' : ''}`} onClick={() => { stop(); setSource('filters'); }}>Your filtered list</button>}
        <button className={`chip ${source === 'new' ? 'active' : ''}`} onClick={() => { stop(); setSource('new'); }}>Today's new words</button>
      </div>

      <div className="w1000-study-settings">
        <label>
          Speed:
          <select value={speedId} onChange={(e) => { stop(); setSpeedId(e.target.value); }}>
            {SPEEDS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
        <label className="w1000-toggle">
          <input type="checkbox" checked={shuffled} onChange={(e) => { stop(); setShuffled(e.target.checked); }} />
          🔀 Shuffle
        </label>
      </div>

      <div className="w1000-listen-card">
        <div className="w1000-listen-count">{playlist.length ? `${index + 1} / ${playlist.length}` : 'No words to play'}</div>
        {current && (
          <>
            <div className="w1000-listen-ru">{current.ru}</div>
            <div className="w1000-listen-en">{current.en}</div>
          </>
        )}
      </div>

      <div className="w1000-listen-controls">
        <button className="chip" disabled={!playing} onClick={() => controllerRef.current?.back()}>⏮ Back</button>
        {!playing ? (
          <button className="account-btn" onClick={start} disabled={!playlist.length}>▶ Play</button>
        ) : (
          <button className="account-btn" onClick={togglePause}>{paused ? '▶ Resume' : '⏸ Pause'}</button>
        )}
        <button className="chip" disabled={!playing} onClick={() => controllerRef.current?.skip()}>Skip ⏭</button>
        {playing && <button className="chip" onClick={stop}>■ Stop</button>}
      </div>
    </div>
  );
}
