import { useState } from 'react';
import { TOP_FIFTEEN } from '../languageHacks.js';

export default function TopFifteen() {
  const [index, setIndex] = useState(0);
  const total = TOP_FIFTEEN.length;

  function go(delta) {
    setIndex((i) => Math.max(0, Math.min(total - 1, i + delta)));
  }

  return (
    <div className="hack-section">
      <p className="hack-intro">If you remember nothing else, remember these.</p>

      <div className="top15-card">
        <div className="top15-count">{index + 1} / {total}</div>
        <p className="top15-text">{TOP_FIFTEEN[index]}</p>
      </div>

      <div className="top15-controls">
        <button className="top15-nav-btn" onClick={() => go(-1)} disabled={index === 0}>← Prev</button>
        <div className="top15-dots">
          {TOP_FIFTEEN.map((_, i) => (
            <button
              key={i}
              className={`top15-dot ${i === index ? 'active' : ''}`}
              aria-label={`Go to tip ${i + 1}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <button className="top15-nav-btn" onClick={() => go(1)} disabled={index === total - 1}>Next →</button>
      </div>
    </div>
  );
}
