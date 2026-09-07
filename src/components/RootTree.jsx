import { useState } from 'react';
import { ROOT_FAMILIES, PREFIX_INFO } from '../languageHacks.js';
import { recordSectionView } from '../hackProgress.js';
import SpeakerButton from './SpeakerButton.jsx';
import Mascot from './Mascot.jsx';

export default function RootTree() {
  const [familyId, setFamilyId] = useState(ROOT_FAMILIES[0].id);
  const [revealed, setRevealed] = useState(() => new Set());
  const family = ROOT_FAMILIES.find((f) => f.id === familyId);

  function selectFamily(id) {
    setFamilyId(id);
    setRevealed(new Set());
  }

  function reveal(word) {
    setRevealed((prev) => new Set(prev).add(word));
    recordSectionView(`roots:${word}`);
  }

  return (
    <div className="hack-section">
      <p className="hack-intro">
        One root, many words. Guess what each branch means before you tap to reveal it.
      </p>

      <div className="hack-tabs">
        {ROOT_FAMILIES.map((f) => (
          <button key={f.id} className={`hack-tab ${familyId === f.id ? 'active' : ''}`} onClick={() => selectFamily(f.id)}>
            -{f.root}-
          </button>
        ))}
      </div>

      <div className="root-tree">
        <div className="root-tree-center">
          <div className="root-tree-root">
            <Mascot emoji={family.mascotEmoji} color="var(--paper)" size={44} />
            <span className="root-tree-root-word">{family.root}</span>
            <span className="root-tree-root-meaning">{family.mascotName} — {family.rootMeaning}</span>
          </div>
        </div>
        <div className="root-tree-branches">
          {family.words.map((w) => {
            const info = PREFIX_INFO[w.prefix];
            const isOpen = revealed.has(w.word);
            return (
              <div key={w.word} className="root-tree-branch">
                <button
                  type="button"
                  className={`root-tree-node ${isOpen ? 'open' : ''}`}
                  style={{ borderColor: info?.color ?? 'var(--line)' }}
                  onClick={() => reveal(w.word)}
                >
                  <span className="root-tree-scene">{w.sceneEmoji}</span>
                  <span className="root-tree-word-row">
                    {w.prefix && (
                      <span className="root-tree-prefix" style={{ background: info?.color }}>
                        {w.prefix}
                      </span>
                    )}
                    <span className="root-tree-word">{w.word}</span>
                    <SpeakerButton text={w.word} label={`Play "${w.word}"`} />
                  </span>
                  {!isOpen ? (
                    <span className="root-tree-guess-prompt">What do you think this means? Tap to check →</span>
                  ) : (
                    <span className="root-tree-tr">{w.tr}</span>
                  )}
                </button>
                {isOpen && (
                  <div className="root-tree-breakdown">
                    <div className="root-tree-scene-text">{w.scene}</div>
                    {w.breakdown}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
