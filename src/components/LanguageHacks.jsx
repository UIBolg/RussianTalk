import { useState } from 'react';
import RootTree from './RootTree.jsx';
import PrefixMap from './PrefixMap.jsx';
import CaseWheel from './CaseWheel.jsx';
import AspectHelper from './AspectHelper.jsx';
import MotionVerbs from './MotionVerbs.jsx';
import SkeletonBuilder from './SkeletonBuilder.jsx';
import ArabicRussianCards from './ArabicRussianCards.jsx';
import TopFifteen from './TopFifteen.jsx';

const SECTIONS = [
  { id: 'roots', label: 'Roots', Component: RootTree },
  { id: 'prefixes', label: 'Prefixes', Component: PrefixMap },
  { id: 'cases', label: 'Cases', Component: CaseWheel },
  { id: 'aspect', label: 'Aspect', Component: AspectHelper },
  { id: 'motion', label: 'Motion', Component: MotionVerbs },
  { id: 'sentences', label: 'Sentences', Component: SkeletonBuilder },
  { id: 'arabic', label: 'Arabic ↔ Russian', Component: ArabicRussianCards },
  { id: 'top15', label: 'Top 15', Component: TopFifteen },
];

export default function LanguageHacks({ onBack }) {
  const [sectionId, setSectionId] = useState(SECTIONS[0].id);
  const section = SECTIONS.find((s) => s.id === sectionId);
  const Section = section.Component;

  return (
    <section>
      <div className="back-row">
        <button className="back-btn" onClick={onBack}>← Topics</button>
      </div>
      <h2 className="topic-title">
        💡 Language Hacks <span className="ru">визуальные подсказки</span>
      </h2>
      <p className="dialog-sub" style={{ marginBottom: 16 }}>
        The highest-leverage Russian patterns, shown visually — not another lesson to memorize.
      </p>

      <div className="topic-tabs wrap">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            className={`topic-tab ${sectionId === s.id ? 'active' : ''}`}
            onClick={() => setSectionId(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="hacks-panel">
        <Section />
      </div>
    </section>
  );
}
