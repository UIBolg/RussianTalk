import { useEffect, useState } from 'react';
import { SKELETONS, SKELETON_FILLERS } from '../languageHacks.js';
import { getSkeletonStreak, recordSkeletonSentence } from '../hackProgress.js';
import SpeakerButton from './SpeakerButton.jsx';

export default function SkeletonBuilder() {
  const [skeletonId, setSkeletonId] = useState(SKELETONS[0].id);
  const skeleton = SKELETONS.find((s) => s.id === skeletonId);
  const fillers = SKELETON_FILLERS[skeletonId];
  const [fillerIndex, setFillerIndex] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [streak, setStreak] = useState(() => getSkeletonStreak().count);

  useEffect(() => setFillerIndex(0), [skeletonId]);

  useEffect(() => {
    const filler = fillers[fillerIndex];
    setStreak(recordSkeletonSentence(skeletonId, filler.ru));
    // Re-runs whenever the assembled sentence changes - only the first time
    // a given combination appears actually moves the streak forward.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skeletonId, fillerIndex]);

  function pick(index) {
    setFillerIndex(index);
  }

  function spin() {
    if (fillers.length < 2) return;
    setSpinning(true);
    let next = Math.floor(Math.random() * fillers.length);
    if (next === fillerIndex) next = (next + 1) % fillers.length;
    setTimeout(() => {
      setFillerIndex(next);
      setSpinning(false);
    }, 260);
  }

  const filler = fillers[fillerIndex];
  const assembled = skeleton.pattern.replace('___', filler.ru);
  const assembledTr = skeleton.tr.replace('___', filler.tr);

  return (
    <div className="hack-section">
      <p className="hack-intro">Pick a sentence starter, spin (or pick) a word, and watch the sentence build itself.</p>

      <div className="hack-tabs wrap">
        {SKELETONS.map((s) => (
          <button key={s.id} className={`hack-tab ${skeletonId === s.id ? 'active' : ''}`} onClick={() => setSkeletonId(s.id)}>
            {s.pattern}
          </button>
        ))}
      </div>

      <div className="skeleton-filler-row">
        {fillers.map((f, i) => (
          <button key={f.ru} className={`chip ${i === fillerIndex ? 'active' : ''}`} onClick={() => pick(i)}>
            {f.ru}
          </button>
        ))}
        <button className="skeleton-spin-btn" onClick={spin}>🎰 Spin</button>
      </div>

      <div className="skeleton-result">
        <div className="skeleton-result-top">
          <span className="skeleton-case-tag">{skeleton.caseNote}</span>
          <span className="skeleton-streak">🔥 {streak} sentence{streak === 1 ? '' : 's'} built</span>
        </div>
        <div className={`skeleton-result-ru ${spinning ? 'spinning' : ''}`}>
          {assembled}
          <SpeakerButton text={assembled} label={`Play "${assembled}"`} />
        </div>
        <div className="skeleton-result-tr">{assembledTr}</div>
      </div>
    </div>
  );
}
