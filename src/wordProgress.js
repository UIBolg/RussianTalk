import { useCallback, useMemo, useState } from 'react';

const PROGRESS_KEY = 'ru1000-progress';

// Leitner-style spacing: box 0 = new/not started, 1-4 = learning/reviewing,
// 5 = mastered. INTERVAL[box] is how many days until a card in that box is
// due again.
export const INTERVAL = [0, 1, 3, 7, 14, 40];

function emptyProgress() {
  return { v: 1, w: {}, notes: {}, log: {}, settings: { goal: 10, dir: 'ru' } };
}

function readProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) return { ...emptyProgress(), ...JSON.parse(raw) };
  } catch {
    // Storage blocked or corrupted - start fresh rather than crash.
  }
  return emptyProgress();
}

function writeProgress(progress) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Storage blocked or full - the feature just won't persist this visit.
  }
}

// Whole local days since epoch, so "due today" means the same thing all day
// regardless of what time it currently is.
export function todayDayNum() {
  const tzOffsetMs = new Date().getTimezoneOffset() * 60000;
  return Math.floor((Date.now() - tzOffsetMs) / 86400000);
}

// record = [box, dueDay, reviews, lapses, starred, lastDay, introducedDay]
function blankRecord(today) {
  return [0, today, 0, 0, false, today, null];
}

export function statusForRecord(record) {
  if (!record || record[0] <= 0) return 'new';
  if (record[0] >= 5) return 'mastered';
  if (record[0] <= 2) return 'learning';
  return 'reviewing';
}

export function isDueRecord(record, today) {
  if (!record) return false;
  const [box, dueDay] = record;
  return box > 0 && box < 5 && dueDay <= today;
}

export function nextDueLabel(box, dueDay, today) {
  if (box >= 5) return 'mastered';
  const days = dueDay - today;
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

function computeStreak(log, today) {
  let streak = 0;
  let day = today;
  while (log[String(day)]?.r > 0) {
    streak += 1;
    day -= 1;
  }
  return streak;
}

// The one shared place that holds the "progress" object described in the
// 1000-words feature doc: per-word Leitner box/due-date records, notes,
// a daily review log, and settings - all persisted to localStorage. Every
// 1000-Words screen calls this once (from the shared WordsThousand shell)
// and reads/writes through the functions it returns, the same way
// hackProgress.js is the one place Language Hacks' localStorage lives.
export function useWordProgress() {
  const [progress, setProgress] = useState(readProgress);
  const today = todayDayNum();

  const update = useCallback((updater) => {
    setProgress((prev) => {
      const next = updater(prev);
      writeProgress(next);
      return next;
    });
  }, []);

  const getRecord = useCallback((rank) => progress.w[rank], [progress]);
  const status = useCallback((rank) => statusForRecord(getRecord(rank)), [getRecord]);
  const isDue = useCallback((rank) => isDueRecord(getRecord(rank), today), [getRecord, today]);

  const answer = useCallback((rank, kind) => {
    update((prev) => {
      const existing = prev.w[rank] || blankRecord(today);
      let [box, dueDay, reviews, lapses, starred] = existing;
      const wasNew = reviews === 0;

      if (kind === 'again') {
        box = 1; dueDay = today; lapses += 1;
      } else if (kind === 'good') {
        box = Math.max(1, box + 1); dueDay = today + INTERVAL[box];
      } else if (kind === 'easy') {
        box = Math.min(5, Math.max(1, box + 2)); dueDay = today + INTERVAL[box];
      } else if (kind === 'known') {
        box = 5; dueDay = today + INTERVAL[5];
      }

      const introducedDay = existing[6] ?? today;
      const record = [box, dueDay, reviews + 1, lapses, starred, today, introducedDay];

      const dayKey = String(today);
      const entry = prev.log[dayKey] || { r: 0, n: 0 };

      return {
        ...prev,
        w: { ...prev.w, [rank]: record },
        log: { ...prev.log, [dayKey]: { r: entry.r + 1, n: entry.n + (wasNew ? 1 : 0) } },
      };
    });
  }, [update, today]);

  const setBox = useCallback((rank, box) => {
    update((prev) => {
      const existing = prev.w[rank] || blankRecord(today);
      const dueDay = box > 0 && box < 5 ? today + INTERVAL[box] : today;
      const introducedDay = existing[6] ?? (box > 0 ? today : null);
      const record = [box, dueDay, existing[2], existing[3], existing[4], today, introducedDay];
      return { ...prev, w: { ...prev.w, [rank]: record } };
    });
  }, [update, today]);

  const toggleStar = useCallback((rank) => {
    update((prev) => {
      const existing = prev.w[rank] || blankRecord(today);
      const record = [...existing];
      record[4] = !record[4];
      return { ...prev, w: { ...prev.w, [rank]: record } };
    });
  }, [update, today]);

  const setNote = useCallback((rank, text) => {
    update((prev) => ({ ...prev, notes: { ...prev.notes, [rank]: text } }));
  }, [update]);

  const markManyKnown = useCallback((ranks) => {
    update((prev) => {
      const w = { ...prev.w };
      ranks.forEach((rank) => {
        const existing = w[rank] || blankRecord(today);
        const introducedDay = existing[6] ?? today;
        w[rank] = [5, today + INTERVAL[5], existing[2], existing[3], existing[4], today, introducedDay];
      });
      return { ...prev, w };
    });
  }, [update, today]);

  const setGoal = useCallback((goal) => {
    update((prev) => ({ ...prev, settings: { ...prev.settings, goal } }));
  }, [update]);

  const setDirection = useCallback((dir) => {
    update((prev) => ({ ...prev, settings: { ...prev.settings, dir } }));
  }, [update]);

  const streak = useMemo(() => computeStreak(progress.log, today), [progress.log, today]);

  return {
    progress, today, getRecord, status, isDue, answer, setBox, toggleStar, setNote,
    markManyKnown, setGoal, setDirection, streak,
  };
}
