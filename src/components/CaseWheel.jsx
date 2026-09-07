import { CASES } from '../languageHacks.js';

function highlightExample(example) {
  const { ru, highlight } = example;
  const idx = ru.indexOf(highlight);
  if (idx === -1) return ru;
  return (
    <>
      {ru.slice(0, idx)}
      <mark className="case-highlight">{highlight}</mark>
      {ru.slice(idx + highlight.length)}
    </>
  );
}

function CaseCard({ c, large }) {
  return (
    <div className={`case-card ${large ? 'large' : 'small'}`} style={{ borderColor: c.color }}>
      <div className="case-card-head" style={{ color: c.color }}>
        <span className="case-card-name">{c.name}</span>
        <span className="case-card-ru">{c.ru}</span>
      </div>
      <div className="case-card-question">
        {c.question} <span className="case-card-question-tr">({c.questionTr})</span>
      </div>
      <p className="case-card-relation">{c.relation}</p>
      <div className="case-card-example">
        <div className="case-card-example-ru">{highlightExample(c.example)}</div>
        <div className="case-card-example-tr">{c.example.tr}</div>
      </div>
    </div>
  );
}

export default function CaseWheel() {
  const primary = CASES.filter((c) => c.primary);
  const secondary = CASES.filter((c) => !c.primary);

  return (
    <div className="hack-section">
      <p className="hack-intro">
        Not a grammar table — each case answers "what relationship does this word express?"
        The four you'll use constantly are bigger; the other two are still worth knowing.
      </p>
      <div className="case-grid primary">
        {primary.map((c) => (
          <CaseCard key={c.id} c={c} large />
        ))}
      </div>
      <div className="case-grid secondary">
        {secondary.map((c) => (
          <CaseCard key={c.id} c={c} />
        ))}
      </div>
    </div>
  );
}
