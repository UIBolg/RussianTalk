import { useState } from 'react';
import { TOP_FIFTEEN } from '../languageHacks.js';
import { recordSectionView } from '../hackProgress.js';

export default function TopFifteen() {
  const [index, setIndex] = useState(0);
  const total = TOP_FIFTEEN.length;

  function go(delta) {
    setIndex((i) => {
      const next = Math.max(0, Math.min(total - 1, i + delta));
      recordSectionView(`top15:${next}`);
      return next;
    });
  }

  // Tap the left third of the card to go back, the rest to go forward - the
  // same left/right tap zones a "stories" format uses, with visible Prev/Next
  // buttons underneath for anyone who'd rather not guess where to tap.
  function handleCardTap(e) {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const tapX = e.clientX - left;
    go(tapX < width / 3 ? -1 : 1);
  }

  return (
    <div className="hack-section">
      <p className="hack-intro">If you remember nothing else, remember these. Tap left/right to move through the deck.</p>

      <div className="top15-progress">
        {TOP_FIFTEEN.map((_, i) => (
          <span key={i} className={`top15-segment ${i <= index ? 'filled' : ''}`} />
        ))}
      </div>

      <div className="top15-card" onClick={handleCardTap}>
        <div className="top15-count">{index + 1} / {total}</div>
        <p className="top15-text">{TOP_FIFTEEN[index]}</p>
      </div>

      <div className="top15-controls">
        <button className="top15-nav-btn" onClick={() => go(-1)} disabled={index === 0}>← Prev</button>
        <button className="top15-nav-btn" onClick={() => go(1)} disabled={index === total - 1}>Next →</button>
      </div>
    </div>
  );
}
