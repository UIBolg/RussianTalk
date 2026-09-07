import { useState } from 'react';
import { PREFIXES } from '../languageHacks.js';
import { recordSectionView } from '../hackProgress.js';
import Mascot from './Mascot.jsx';

export default function PrefixMap() {
  const [revealed, setRevealed] = useState(() => new Set());

  function reveal(prefix) {
    setRevealed((prev) => new Set(prev).add(prefix));
    recordSectionView(`prefixes:${prefix}`);
  }

  return (
    <div className="hack-section">
      <p className="hack-intro">
        Meet the Prefix Squad — 12 mascots, one per prefix. Guess the meaning from the scene, then tap to check.
      </p>
      <div className="prefix-grid">
        {PREFIXES.map((p) => {
          const isOpen = revealed.has(p.prefix);
          return (
            <button
              key={p.prefix}
              type="button"
              className={`prefix-card ${isOpen ? 'open' : ''}`}
              style={{ borderTopColor: p.color }}
              onClick={() => reveal(p.prefix)}
            >
              <div className="prefix-card-top">
                <span className="prefix-card-prefix">{p.prefix}</span>
                <Mascot emoji={p.mascot.emoji} color={p.color} size={38} animate={isOpen} animation={p.mascot.animation} />
              </div>
              <div className="prefix-card-scene">
                {p.mascot.name}: {p.mascot.scene}
              </div>
              {isOpen ? (
                <>
                  <div className="prefix-card-meaning">
                    <span className="prefix-card-arrow" style={{ color: p.color }}>{p.arrow}</span> {p.meaning}
                  </div>
                  {p.mnemonic && <div className="prefix-card-mnemonic">💡 {p.mnemonic}</div>}
                </>
              ) : (
                <div className="prefix-card-guess">What does this scene mean? Tap to check →</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
