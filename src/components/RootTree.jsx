import { useState } from 'react';
import { ROOT_FAMILIES, PREFIX_INFO } from '../languageHacks.js';
import SpeakerButton from './SpeakerButton.jsx';

export default function RootTree() {
  const [familyId, setFamilyId] = useState(ROOT_FAMILIES[0].id);
  const [openWord, setOpenWord] = useState(null);
  const family = ROOT_FAMILIES.find((f) => f.id === familyId);

  function selectFamily(id) {
    setFamilyId(id);
    setOpenWord(null);
  }

  return (
    <div className="hack-section">
      <p className="hack-intro">
        One root, many words. Click a branch to see how the prefix changes its meaning.
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
            <span className="root-tree-root-word">{family.root}</span>
            <span className="root-tree-root-meaning">{family.rootMeaning}</span>
          </div>
        </div>
        <div className="root-tree-branches">
          {family.words.map((w) => {
            const info = PREFIX_INFO[w.prefix];
            const isOpen = openWord === w.word;
            return (
              <div key={w.word} className="root-tree-branch">
                <button
                  type="button"
                  className={`root-tree-node ${isOpen ? 'open' : ''}`}
                  style={{ borderColor: info?.color ?? 'var(--line)' }}
                  onClick={() => setOpenWord(isOpen ? null : w.word)}
                >
                  {w.prefix && (
                    <span className="root-tree-prefix" style={{ background: info?.color }}>
                      {w.prefix}
                    </span>
                  )}
                  <span className="root-tree-word">{w.word}</span>
                  <span className="root-tree-tr">{w.tr}</span>
                  <SpeakerButton text={w.word} label={`Play "${w.word}"`} />
                </button>
                {isOpen && <div className="root-tree-breakdown">{w.breakdown}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
