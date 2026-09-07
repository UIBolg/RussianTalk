import { useEffect, useState } from 'react';
import RootTree from './RootTree.jsx';
import PrefixMap from './PrefixMap.jsx';
import CaseWheel from './CaseWheel.jsx';
import AspectHelper from './AspectHelper.jsx';
import MotionVerbs from './MotionVerbs.jsx';
import SkeletonBuilder from './SkeletonBuilder.jsx';
import ArabicRussianCards from './ArabicRussianCards.jsx';
import TopFifteen from './TopFifteen.jsx';
import { recordSectionView, getComeBackTo, getViewedSections } from '../hackProgress.js';

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
const SECTION_IDS = SECTIONS.map((s) => s.id);

export default function LanguageHacks({ onBack }) {
  const [sectionId, setSectionId] = useState(SECTIONS[0].id);
  const [viewed, setViewed] = useState(() => new Set(Object.keys(getViewedSections())));
  const [nudgeId, setNudgeId] = useState(null);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  // Record the very first section on mount, then every switch after that.
  useEffect(() => {
    recordSectionView(sectionId);
    setViewed((prev) => new Set(prev).add(sectionId));
    // A light "spaced repetition" nudge: once there's at least one other
    // section already seen, suggest the one seen longest ago. Recomputed
    // whenever the learner changes section, so it stays relevant as they
    // move around instead of only being checked once on page load.
    setNudgeId(getComeBackTo(SECTION_IDS, sectionId));
    setNudgeDismissed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId]);

  const section = SECTIONS.find((s) => s.id === sectionId);
  const Section = section.Component;
  const nudgeSection = nudgeId ? SECTIONS.find((s) => s.id === nudgeId) : null;

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
            {s.label} {viewed.has(s.id) && <span className="hack-tab-check">✓</span>}
          </button>
        ))}
      </div>

      {nudgeSection && !nudgeDismissed && (
        <div className="hack-nudge">
          <span>👋 Come back to <strong>{nudgeSection.label}</strong> — it's been a while.</span>
          <div className="hack-nudge-actions">
            <button className="hack-nudge-go" onClick={() => setSectionId(nudgeSection.id)}>Take me there</button>
            <button className="hack-nudge-dismiss" onClick={() => setNudgeDismissed(true)}>✕</button>
          </div>
        </div>
      )}

      <div className="hacks-panel">
        <Section />
      </div>
    </section>
  );
}
