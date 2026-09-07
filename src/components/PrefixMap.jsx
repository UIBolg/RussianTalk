import { PREFIXES } from '../languageHacks.js';

export default function PrefixMap() {
  return (
    <div className="hack-section">
      <p className="hack-intro">
        The 12 most productive prefixes. Same prefix, same color and arrow everywhere in this section.
      </p>
      <div className="prefix-grid">
        {PREFIXES.map((p) => (
          <div key={p.prefix} className="prefix-card" style={{ borderTopColor: p.color }}>
            <div className="prefix-card-top">
              <span className="prefix-card-prefix">{p.prefix}</span>
              <span className="prefix-card-arrow" style={{ color: p.color }}>{p.arrow}</span>
            </div>
            <div className="prefix-card-meaning">{p.meaning}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
