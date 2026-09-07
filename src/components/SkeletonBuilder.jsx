import { useEffect, useState } from 'react';
import { SKELETONS, SKELETON_FILLERS } from '../languageHacks.js';
import SpeakerButton from './SpeakerButton.jsx';

export default function SkeletonBuilder() {
  const [skeletonId, setSkeletonId] = useState(SKELETONS[0].id);
  const skeleton = SKELETONS.find((s) => s.id === skeletonId);
  const fillers = SKELETON_FILLERS[skeletonId];
  const [fillerIndex, setFillerIndex] = useState(0);

  useEffect(() => setFillerIndex(0), [skeletonId]);

  const filler = fillers[fillerIndex];
  const assembled = skeleton.pattern.replace('___', filler.ru);
  const assembledTr = skeleton.tr.replace('___', filler.tr);

  return (
    <div className="hack-section">
      <p className="hack-intro">Pick a sentence starter, then a word, and watch the sentence build itself.</p>

      <div className="hack-tabs wrap">
        {SKELETONS.map((s) => (
          <button key={s.id} className={`hack-tab ${skeletonId === s.id ? 'active' : ''}`} onClick={() => setSkeletonId(s.id)}>
            {s.pattern}
          </button>
        ))}
      </div>

      <div className="skeleton-filler-row">
        {fillers.map((f, i) => (
          <button key={f.ru} className={`chip ${i === fillerIndex ? 'active' : ''}`} onClick={() => setFillerIndex(i)}>
            {f.ru}
          </button>
        ))}
      </div>

      <div className="skeleton-result">
        <span className="skeleton-case-tag">{skeleton.caseNote}</span>
        <div className="skeleton-result-ru">
          {assembled}
          <SpeakerButton text={assembled} label={`Play "${assembled}"`} />
        </div>
        <div className="skeleton-result-tr">{assembledTr}</div>
      </div>
    </div>
  );
}
