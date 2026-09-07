import { useState } from 'react';
import { ARABIC_RUSSIAN_CARDS } from '../languageHacks.js';
import { recordSectionView } from '../hackProgress.js';

export default function ArabicRussianCards() {
  const [flipped, setFlipped] = useState(() => new Set());

  function toggle(title) {
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
    recordSectionView(`arabic:${title}`);
  }

  return (
    <div className="hack-section">
      <p className="hack-intro">
        "Wait — Russian does this too?" Tap a card for the small revelation.
      </p>
      <div className="arabic-cards-grid">
        {ARABIC_RUSSIAN_CARDS.map((c) => {
          const isFlipped = flipped.has(c.title);
          return (
            <div
              key={c.title}
              className={`flip-card hack-flip-card ${isFlipped ? 'flipped' : ''}`}
              onClick={() => toggle(c.title)}
            >
              <div className="flip-card-inner">
                <div className="flip-card-face flip-card-front">
                  <span className="side-label">{c.title}</span>
                  <div className="arabic-card-label" dir="rtl">{c.arabicLabel}</div>
                  <div className="arabic-card-example" dir="rtl">{c.arabicExample}</div>
                  <div className="flip-hint">Tap for the Russian side</div>
                </div>
                <div className="flip-card-face flip-card-back">
                  <span className="side-label">{c.title}</span>
                  <div className="arabic-card-russian">{c.russianExample}</div>
                  <p className="arabic-card-why">{c.why}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
