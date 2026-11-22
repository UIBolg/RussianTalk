import { WORDS_BY_RANK, POS_LABELS, STATUS_COLORS } from '../wordsData.js';
import { statusForRecord } from '../wordProgress.js';
import SpeakerButton from './SpeakerButton.jsx';

// The tap-a-word sheet for Stories' reader - reuses the same lookup
// tables and status logic as 1000 Words (WORDS_BY_RANK, POS_LABELS,
// STATUS_COLORS, statusForRecord) rather than a second copy, but is its
// own small component: WordsBrowse.jsx's row-detail is an inline expand
// with note-editing built for a list row, whereas this is a floating
// overlay triggered mid-sentence and only needs to show, not edit.
export default function WordPopover({ rank, wp, onClose }) {
  const word = WORDS_BY_RANK[rank];
  if (!word) return null;
  const record = wp.getRecord(rank);
  const status = statusForRecord(record);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="word-popover" onClick={(e) => e.stopPropagation()}>
        <button className="word-popover-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="word-popover-head">
          <span className="word-popover-ru">{word.ru}</span>
          <SpeakerButton text={word.ru} label={`Play "${word.ru}"`} rate={wp.progress.settings.speechRate ?? 0.85} />
        </div>
        <div className="word-popover-en">{word.en}</div>
        <div className="word-popover-tags">
          <span className="w1000-tag">{POS_LABELS[word.pos]}</span>
          {word.g && <span className="w1000-tag">{word.g}</span>}
          {word.asp && <span className="w1000-tag">{word.asp}</span>}
          <span className="w1000-status-pill" style={{ background: STATUS_COLORS[status] }}>{status}</span>
        </div>
        {status === 'new' ? (
          <button className="account-btn word-popover-add" onClick={() => wp.setBox(rank, 1)}>
            + Add to study
          </button>
        ) : (
          <p className="word-popover-already">Already in your 1000 Words tracker.</p>
        )}
      </div>
    </div>
  );
}
