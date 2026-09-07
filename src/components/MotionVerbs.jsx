import { MOTION_VERB_PAIRS, MOTION_PREFIX_FAMILY, PREFIX_INFO } from '../languageHacks.js';
import SpeakerButton from './SpeakerButton.jsx';

export default function MotionVerbs() {
  return (
    <div className="hack-section">
      <p className="hack-intro">
        Two verbs for "the same" motion: a straight line for one specific trip, a loop for a habit or round trip.
      </p>

      <div className="motion-list">
        {MOTION_VERB_PAIRS.map((pair) => (
          <div key={pair.oneDirection} className="motion-row">
            <div className="motion-verb">
              <span className="motion-icon">→</span>
              <span className="motion-word">{pair.oneDirection}</span>
              <SpeakerButton text={pair.oneDirection} label={`Play "${pair.oneDirection}"`} />
              <span className="motion-verb-label">one trip</span>
            </div>
            <div className="motion-verb">
              <span className="motion-icon">⟲</span>
              <span className="motion-word">{pair.multiDirection}</span>
              <SpeakerButton text={pair.multiDirection} label={`Play "${pair.multiDirection}"`} />
              <span className="motion-verb-label">habitual / round trip</span>
            </div>
            <div className="motion-tr">{pair.tr}</div>
          </div>
        ))}
      </div>

      <p className="hack-intro" style={{ marginTop: 24 }}>
        Add a prefix to идти/ехать and you get a whole family of directional verbs — the same prefixes and colors from the Prefix Map.
      </p>
      <div className="motion-family">
        {MOTION_PREFIX_FAMILY.members.map((m) => {
          const info = PREFIX_INFO[m.prefix];
          return (
            <div key={m.word} className="motion-family-chip" style={{ borderColor: info?.color }}>
              <span className="motion-family-prefix" style={{ background: info?.color }}>{m.prefix}</span>
              <span className="motion-family-word">{m.word}</span>
              <SpeakerButton text={m.word} label={`Play "${m.word}"`} />
              <span className="motion-family-tr">{m.tr}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
