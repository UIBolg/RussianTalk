import { useMemo, useState } from 'react';
import {
  WORDS, TOPIC_LABELS, POS_LABELS, LEVELS, GENDER_LABELS, STATUS_COLORS, GENDER_COLORS,
  FREQUENCY_BANDS, TRIP_KIT_TOPICS,
} from '../wordsData.js';
import { nextDueLabel } from '../wordProgress.js';
import SpeakerButton from './SpeakerButton.jsx';

const STATUS_FILTERS = [
  { id: 'all', label: 'Any status' },
  { id: 'new', label: 'New' },
  { id: 'learning', label: 'Learning' },
  { id: 'reviewing', label: 'Reviewing' },
  { id: 'mastered', label: 'Mastered' },
  { id: 'due', label: 'Due today' },
  { id: 'not-mastered', label: 'Not mastered yet' },
];

const SORTS = [
  { id: 'frequency', label: 'Frequency' },
  { id: 'alpha', label: 'А–Я' },
  { id: 'least-known', label: 'Least known first' },
  { id: 'topic', label: 'Topic' },
];

const PAGE_SIZE = 150;

function isHard(record) {
  return !!record && (record[3] >= 2 || record[4]);
}

function emptyFilters() {
  return {
    search: '', pos: new Set(), topic: 'all', level: 'all', status: 'all', band: 'all',
    gender: 'all', aspect: 'all', starredOnly: false, hasNoteOnly: false,
  };
}

export default function WordsBrowse({ wp, onStudyThese, onListenThese }) {
  const [filters, setFilters] = useState(emptyFilters);
  const [sort, setSort] = useState('frequency');
  const [expanded, setExpanded] = useState(new Set());
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [confirmingKnown, setConfirmingKnown] = useState(false);

  function patchFilters(patch) {
    setFilters((prev) => ({ ...prev, ...patch }));
    setVisibleCount(PAGE_SIZE);
  }

  function togglePos(code) {
    setFilters((prev) => {
      const next = new Set(prev.pos);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return { ...prev, pos: next };
    });
    setVisibleCount(PAGE_SIZE);
  }

  // Each quick set is a combination no single dropdown covers on its own
  // (e.g. trip kit needs several topics AND two levels at once), so it's
  // applied as a dedicated filter-combination rather than forced through
  // the single-select topic/level/etc. dropdowns.
  function applyQuickSet(id) {
    setFilters((prev) => (prev.quickSet === id ? emptyFilters() : { ...emptyFilters(), quickSet: id }));
    setVisibleCount(PAGE_SIZE);
  }

  const today = wp.today;

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    let list = WORDS.filter((w) => {
      if (q && !w.plain.includes(q) && !w.en.toLowerCase().includes(q)) return false;
      if (filters.pos.size && !filters.pos.has(w.pos)) return false;
      if (filters.topic !== 'all' && w.t !== filters.topic) return false;
      if (filters.level !== 'all' && w.lv !== filters.level) return false;
      if (filters.gender !== 'all' && w.g !== filters.gender) return false;
      if (filters.aspect !== 'all' && w.asp !== filters.aspect) return false;
      if (filters.band !== 'all') {
        const band = FREQUENCY_BANDS.find((b) => b.id === filters.band);
        if (band && (w.r < band.min || w.r > band.max)) return false;
      }
      const record = wp.getRecord(w.r);
      if (filters.starredOnly && !record?.[4]) return false;
      if (filters.hasNoteOnly && !wp.progress.notes[w.r]) return false;
      if (filters.status !== 'all') {
        const st = wp.status(w.r);
        if (filters.status === 'due') {
          if (!wp.isDue(w.r)) return false;
        } else if (filters.status === 'not-mastered') {
          if (st === 'mastered') return false;
        } else if (st !== filters.status) {
          return false;
        }
      }
      return true;
    });

    if (filters.quickSet === 'trip-kit') {
      list = list.filter((w) => TRIP_KIT_TOPICS.includes(w.t) && (w.lv === 'A1' || w.lv === 'A2'));
    } else if (filters.quickSet === 'top-100') {
      list = list.filter((w) => w.r <= 100);
    } else if (filters.quickSet === 'aspect-pairs') {
      list = list.filter((w) => w.asp);
    } else if (filters.quickSet === 'hard') {
      list = list.filter((w) => isHard(wp.getRecord(w.r)));
    }

    const sorted = [...list];
    if (sort === 'alpha') {
      sorted.sort((a, b) => a.ru.localeCompare(b.ru, 'ru'));
    } else if (sort === 'least-known') {
      const rank = { new: 0, learning: 1, reviewing: 2, mastered: 3 };
      sorted.sort((a, b) => rank[wp.status(a.r)] - rank[wp.status(b.r)] || a.r - b.r);
    } else if (sort === 'topic') {
      sorted.sort((a, b) => (TOPIC_LABELS[a.t] || '').localeCompare(TOPIC_LABELS[b.t] || '') || a.r - b.r);
    } else if (filters.quickSet === 'aspect-pairs') {
      sorted.sort((a, b) => a.en.localeCompare(b.en));
    } else {
      sorted.sort((a, b) => a.r - b.r);
    }
    return sorted;
  }, [filters, sort, wp]);

  const posCounts = useMemo(() => {
    const counts = {};
    WORDS.forEach((w) => { counts[w.pos] = (counts[w.pos] || 0) + 1; });
    return counts;
  }, []);

  const topicCounts = useMemo(() => {
    const counts = {};
    WORDS.forEach((w) => { counts[w.t] = (counts[w.t] || 0) + 1; });
    return counts;
  }, []);

  function toggleExpand(rank) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(rank)) next.delete(rank);
      else next.add(rank);
      return next;
    });
  }

  const visible = filtered.slice(0, visibleCount);
  const filteredRanks = useMemo(() => filtered.map((w) => w.r), [filtered]);

  return (
    <div className="w1000-browse">
      <div className="w1000-search-row">
        <input
          type="text"
          className="w1000-search"
          placeholder="Search Russian or English…"
          value={filters.search}
          onChange={(e) => patchFilters({ search: e.target.value })}
        />
        <button className="chip" onClick={() => { setFilters(emptyFilters()); setSort('frequency'); setVisibleCount(PAGE_SIZE); }}>
          Clear filters
        </button>
      </div>

      <div className="w1000-quick-sets">
        <button className={`chip ${filters.quickSet === 'trip-kit' ? 'active' : ''}`} onClick={() => applyQuickSet('trip-kit')}>🧳 Trip kit</button>
        <button className={`chip ${filters.quickSet === 'top-100' ? 'active' : ''}`} onClick={() => applyQuickSet('top-100')}>🔝 Top 100</button>
        <button className={`chip ${filters.quickSet === 'aspect-pairs' ? 'active' : ''}`} onClick={() => applyQuickSet('aspect-pairs')}>🔁 Verb aspect pairs</button>
        <button className={`chip ${filters.quickSet === 'hard' ? 'active' : ''}`} onClick={() => applyQuickSet('hard')}>⚠️ My hard words</button>
      </div>

      <div className="w1000-pos-chips">
        {Object.entries(POS_LABELS).map(([code, label]) => (
          <button
            key={code}
            className={`chip ${filters.pos.has(code) ? 'active' : ''}`}
            onClick={() => togglePos(code)}
          >
            {label} <span className="count">{posCounts[code] || 0}</span>
          </button>
        ))}
      </div>

      <div className="w1000-dropdown-row">
        <select value={filters.topic} onChange={(e) => patchFilters({ topic: e.target.value })}>
          <option value="all">All topics</option>
          {Object.entries(TOPIC_LABELS).map(([code, label]) => (
            <option key={code} value={code}>{label} ({topicCounts[code] || 0})</option>
          ))}
        </select>
        <select value={filters.level} onChange={(e) => patchFilters({ level: e.target.value })}>
          <option value="all">All levels</option>
          {LEVELS.map((lv) => <option key={lv} value={lv}>{lv}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => patchFilters({ status: e.target.value })}>
          {STATUS_FILTERS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <select value={filters.band} onChange={(e) => patchFilters({ band: e.target.value })}>
          <option value="all">All frequency bands</option>
          {FREQUENCY_BANDS.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
        </select>
        <select value={filters.gender} onChange={(e) => patchFilters({ gender: e.target.value })}>
          <option value="all">Any gender</option>
          {Object.entries(GENDER_LABELS).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
        </select>
        <select value={filters.aspect} onChange={(e) => patchFilters({ aspect: e.target.value })}>
          <option value="all">Any aspect</option>
          <option value="pf">Perfective</option>
          <option value="ipf">Imperfective</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          {SORTS.map((s) => <option key={s.id} value={s.id}>Sort: {s.label}</option>)}
        </select>
      </div>

      <div className="w1000-toggle-row">
        <label className="w1000-toggle">
          <input type="checkbox" checked={filters.starredOnly} onChange={(e) => patchFilters({ starredOnly: e.target.checked })} />
          ⭐ Starred
        </label>
        <label className="w1000-toggle">
          <input type="checkbox" checked={filters.hasNoteOnly} onChange={(e) => patchFilters({ hasNoteOnly: e.target.checked })} />
          📝 Has my note
        </label>
      </div>

      <div className="w1000-results-bar">
        <span>{filtered.length} word{filtered.length === 1 ? '' : 's'}</span>
        <div className="w1000-bulk-actions">
          <button className="chip" onClick={() => onStudyThese(filteredRanks)} disabled={!filtered.length}>Study these</button>
          <button className="chip" onClick={() => onListenThese(filteredRanks)} disabled={!filtered.length}>Listen to these</button>
          {!confirmingKnown ? (
            <button className="chip" onClick={() => setConfirmingKnown(true)} disabled={!filtered.length}>I know all shown…</button>
          ) : (
            <span className="w1000-confirm-inline">
              Mark all {filtered.length} as mastered?
              <button className="chip active" onClick={() => { wp.markManyKnown(filteredRanks); setConfirmingKnown(false); }}>Yes</button>
              <button className="chip" onClick={() => setConfirmingKnown(false)}>Cancel</button>
            </span>
          )}
        </div>
      </div>

      <div className="w1000-rows">
        {visible.map((w) => {
          const record = wp.getRecord(w.r);
          const st = wp.status(w.r);
          const isOpen = expanded.has(w.r);
          return (
            <div key={w.r} className="w1000-row-wrap">
              <div
                className="w1000-row"
                role="button"
                tabIndex={0}
                onClick={() => toggleExpand(w.r)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpand(w.r); } }}
              >
                <span className="w1000-rank">{w.r}</span>
                <span className="w1000-ru">{w.ru}</span>
                <span className="w1000-en">{w.en}</span>
                <span className="w1000-tags">
                  <span className="w1000-tag">{POS_LABELS[w.pos]}</span>
                  {w.g && <span className="w1000-tag" style={{ color: GENDER_COLORS[w.g] }}>{w.g}</span>}
                  {w.asp && <span className="w1000-tag">{w.asp}</span>}
                  <span className="w1000-tag">{TOPIC_LABELS[w.t]}</span>
                </span>
                <span className="w1000-level">{w.lv}</span>
                <span className="w1000-status-pill" style={{ background: STATUS_COLORS[st] }}>{st}</span>
                <SpeakerButton text={w.ru} label={`Play "${w.ru}"`} />
                <span
                  className={`w1000-star ${record?.[4] ? 'is-starred' : ''}`}
                  onClick={(e) => { e.stopPropagation(); wp.toggleStar(w.r); }}
                >
                  {record?.[4] ? '★' : '☆'}
                </span>
              </div>
              {isOpen && (
                <div className="w1000-row-detail">
                  <div className="w1000-status-set">
                    {[['New', 0], ['Learning', 1], ['Reviewing', 3], ['Mastered', 5]].map(([label, box]) => (
                      <button
                        key={label}
                        className={`chip ${st === label.toLowerCase() ? 'active' : ''}`}
                        onClick={() => wp.setBox(w.r, box)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <NoteField rank={w.r} value={wp.progress.notes[w.r] || ''} onSave={wp.setNote} />
                  <div className="w1000-stats-line">
                    {record ? (
                      <>
                        {record[2]} review{record[2] === 1 ? '' : 's'} · {record[3]} lapse{record[3] === 1 ? '' : 's'} ·
                        {' '}next review {nextDueLabel(record[0], record[1], today)}
                      </>
                    ) : 'Not studied yet'}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {visibleCount < filtered.length && (
        <button className="chip w1000-show-more" onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}>
          Show more ({filtered.length - visibleCount} left)
        </button>
      )}
    </div>
  );
}

function NoteField({ rank, value, onSave }) {
  const [text, setText] = useState(value);

  function handleChange(e) {
    const next = e.target.value;
    setText(next);
    clearTimeout(handleChange.timer);
    handleChange.timer = setTimeout(() => onSave(rank, next), 600);
  }

  return (
    <textarea
      className="w1000-note"
      placeholder="Your note or example sentence…"
      value={text}
      onChange={handleChange}
      onClick={(e) => e.stopPropagation()}
    />
  );
}
