import { useState } from 'react';
import { ASPECT_TREE } from '../languageHacks.js';

export default function AspectHelper() {
  const [path, setPath] = useState([]); // sequence of 'yes'/'no' choices from the root

  let node = ASPECT_TREE;
  for (const choice of path) node = node[choice];

  const isLeaf = !!node.aspect;

  function choose(choice) {
    setPath((p) => [...p, choice]);
  }

  function reset() {
    setPath([]);
  }

  return (
    <div className="hack-section">
      <p className="hack-intro">
        "When I want to say X, which aspect do I use?" Answer a couple of yes/no questions to find out.
      </p>

      <div className="aspect-box">
        {!isLeaf ? (
          <>
            <div className="aspect-question">{node.question}</div>
            <div className="aspect-choices">
              <button className="aspect-choice-btn" onClick={() => choose('yes')}>Yes</button>
              <button className="aspect-choice-btn" onClick={() => choose('no')}>No</button>
            </div>
          </>
        ) : (
          <div className="aspect-result">
            <div className="aspect-result-label">{node.label}</div>
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
