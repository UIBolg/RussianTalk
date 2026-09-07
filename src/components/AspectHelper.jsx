import { useState } from 'react';
import { ASPECT_TREE, MASCOTS } from '../languageHacks.js';
import { recordSectionView } from '../hackProgress.js';
import Mascot from './Mascot.jsx';

export default function AspectHelper() {
  const [path, setPath] = useState([]); // sequence of 'yes'/'no' choices from the root

  let node = ASPECT_TREE;
  for (const choice of path) node = node[choice];

  const isLeaf = !!node.aspect;

  function choose(choice) {
    const next = [...path, choice];
    setPath(next);
    let n = ASPECT_TREE;
    for (const c of next) n = n[c];
    if (n.aspect) recordSectionView(`aspect:${n.aspect}`);
  }

  function reset() {
    setPath([]);
  }

  const mascot = isLeaf ? MASCOTS.aspect[node.aspect] : null;

  return (
    <div className="hack-section">
      <p className="hack-intro">
        Perfective Pete vs. Imperfective Ira — answer a couple of yes/no questions to find out who's talking.
      </p>

      <div className="aspect-box">
        {!isLeaf ? (
          <>
            <div className="aspect-mascot-row">
              <Mascot emoji={MASCOTS.aspect.perfective.emoji} color="var(--amber)" size={36} />
              <span className="aspect-vs">vs</span>
              <Mascot emoji={MASCOTS.aspect.imperfective.emoji} color="var(--frost)" size={36} />
            </div>
            <div className="aspect-question">{node.question}</div>
            <div className="aspect-choices">
              <button className="aspect-choice-btn" onClick={() => choose('yes')}>Yes</button>
              <button className="aspect-choice-btn" onClick={() => choose('no')}>No</button>
            </div>
          </>
        ) : (
          <div className="aspect-result">
            <Mascot
              emoji={mascot.emoji}
              color={node.aspect === 'perfective' ? 'var(--amber)' : 'var(--frost)'}
              size={56}
              animate
              animation="pop"
            />
            <div className="aspect-result-label">{mascot.name}</div>
            <div className="aspect-result-tagline">{mascot.tagline}</div>
            <div className="aspect-result-example">
              <div className="aspect-result-ru">{node.example.ru}</div>
              <div className="aspect-result-tr">{node.example.tr}</div>
            </div>
            <button className="aspect-reset-btn" onClick={reset}>Start over</button>
          </div>
        )}
        {!isLeaf && path.length > 0 && (
          <button className="aspect-reset-btn subtle" onClick={reset}>Start over</button>
        )}
      </div>
    </div>
  );
}
