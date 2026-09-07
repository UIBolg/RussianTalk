import { MOTION_VERB_PAIRS, MOTION_PREFIX_FAMILY, PREFIX_INFO, MASCOTS } from '../languageHacks.js';
import SpeakerButton from './SpeakerButton.jsx';
import Mascot from './Mascot.jsx';

export default function MotionVerbs() {
  const sasha = MASCOTS.motion.oneDirection;
  const lena = MASCOTS.motion.multiDirection;

  return (
    <div className="hack-section">
      <p className="hack-intro">
        Straight-Line Sasha walks one direction, one trip. Loop-the-Loop Lena walks the same route on repeat.
        Same two characters, every pair below.
      </p>

      <div className="motion-list">
        {MOTION_VERB_PAIRS.map((pair) => (
          <div key={pair.oneDirection} className="motion-row">
            <div className="motion-verb">
              <Mascot emoji={sasha.emoji} color="var(--amber)" size={30} />
              <span className="motion-word">{pair.oneDirection}</span>
              <SpeakerButton text={pair.oneDirection} label={`Play "${pair.oneDirection}"`} />
              <span className="motion-verb-label">Sasha — one trip</span>
            </div>
            <div className="motion-verb">
              <Mascot emoji={lena.emoji} color="var(--frost)" size={30} />
              <span className="motion-word">{pair.multiDirection}</span>
              <SpeakerButton text={pair.multiDirection} label={`Play "${pair.multiDirection}"`} />
              <span className="motion-verb-label">Lena — habitual / round trip</span>
            </div>
            <div className="motion-tr">{pair.tr}</div>
          </div>
        ))}
      </div>

      <p className="hack-intro" style={{ marginTop: 24 }}>
        Sasha puts on a badge for every prefix — same mascots and colors as the Prefix Squad.
      </p>
      <div className="motion-family">
        <Mascot emoji={sasha.emoji} color="var(--amber)" size={40} />
        {MOTION_PREFIX_FAMILY.members.map((m) => {
          const info = PREFIX_INFO[m.prefix];
          return (
            <div key={m.word} className="motion-family-chip" style={{ borderColor: info?.color }}>
              <Mascot emoji={info?.mascot.emoji} color={info?.color} size={26} />
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
