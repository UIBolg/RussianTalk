import { useMemo } from 'react';
import { WORDS, POS_LABELS, TOPIC_LABELS, LEVELS, FREQUENCY_BANDS, STATUS_COLORS } from '../wordsData.js';
import { statusForRecord } from '../wordProgress.js';

function groupCounts(getKey) {
  const groups = {};
  WORDS.forEach((w) => {
    const key = getKey(w);
    if (!groups[key]) groups[key] = { total: 0, mastered: 0 };
    groups[key].total += 1;
  });
  return groups;
}

function StatusBar({ title, rows }) {
  return (
    <div className="w1000-stat-group">
      <h4>{title}</h4>
      {rows.map(({ key, label, total, mastered }) => (
        <div key={key} className="w1000-stat-row">
          <span className="w1000-stat-label">{label}</span>
          <div className="w1000-stat-track">
            <div className="w1000-stat-fill" style={{ width: `${total ? (mastered / total) * 100 : 0}%` }} />
          </div>
          <span className="w1000-stat-count">{mastered}/{total}</span>
        </div>
      ))}
    </div>
  );
}

export default function WordsProgressDash({ wp }) {
  const { progress, today, streak } = wp;

  const { mastered, inProgress, dueTodayCount, newCount } = useMemo(() => {
    let m = 0, ip = 0, due = 0, n = 0;
    WORDS.forEach((w) => {
      const st = wp.status(w.r);
      if (st === 'mastered') m += 1;
      else if (st === 'learning' || st === 'reviewing') ip += 1;
      else n += 1;
      if (wp.isDue(w.r)) due += 1;
    });
    return { mastered: m, inProgress: ip, dueTodayCount: due, newCount: n };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const byPos = useMemo(() => {
    const groups = groupCounts((w) => w.pos);
    WORDS.forEach((w) => { if (wp.status(w.r) === 'mastered') groups[w.pos].mastered += 1; });
    return Object.entries(groups).map(([key, v]) => ({ key, label: POS_LABELS[key], ...v }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const byBand = useMemo(() => {
    return FREQUENCY_BANDS.map((b) => {
      const words = WORDS.filter((w) => w.r >= b.min && w.r <= b.max);
      const m = words.filter((w) => wp.status(w.r) === 'mastered').length;
      return { key: b.id, label: b.label, total: words.length, mastered: m };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const byLevel = useMemo(() => {
    return LEVELS.map((lv) => {
      const words = WORDS.filter((w) => w.lv === lv);
      const m = words.filter((w) => wp.status(w.r) === 'mastered').length;
      return { key: lv, label: lv, total: words.length, mastered: m };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const byTopic = useMemo(() => {
    const groups = groupCounts((w) => w.t);
    WORDS.forEach((w) => { if (wp.status(w.r) === 'mastered') groups[w.t].mastered += 1; });
    return Object.entries(groups)
      .map(([key, v]) => ({ key, label: TOPIC_LABELS[key], ...v }))
      .sort((a, b) => b.total - a.total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const last14Days = useMemo(() => {
    const days = [];
    for (let d = today - 13; d <= today; d += 1) {
      days.push({ day: d, count: progress.log[String(d)]?.r || 0 });
    }
    return days;
  }, [progress.log, today]);

  const maxReviews = Math.max(1, ...last14Days.map((d) => d.count));

  const goal = progress.settings.goal ?? 10;
  const daysToFinish = Math.ceil(newCount / Math.max(1, goal));
  const finishDate = new Date(Date.now() + daysToFinish * 86400000).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="w1000-progress">
      <div className="w1000-progress-header">
        <div className="w1000-progress-stat">
          <span className="num">{mastered}</span><span className="label">Mastered</span>
        </div>
        <div className="w1000-progress-stat">
          <span className="num">{inProgress}</span><span className="label">In progress</span>
        </div>
        <div className="w1000-progress-stat">
          <span className="num">{dueTodayCount}</span><span className="label">Due today</span>
        </div>
        <div className="w1000-progress-stat">
          <span className="num">🔥 {streak}</span><span className="label">Day streak</span>
        </div>
      </div>

      <div className="w1000-overall-bar">
        <div style={{ width: `${(mastered / 1000) * 100}%`, background: STATUS_COLORS.mastered }} />
        <div style={{ width: `${(inProgress / 1000) * 100}%`, background: STATUS_COLORS.learning }} />
        <div style={{ width: `${(newCount / 1000) * 100}%`, background: STATUS_COLORS.new }} />
      </div>
      <div className="w1000-overall-caption">{mastered} mastered · {inProgress} in progress · {newCount} not started, out of 1,000</div>

      <StatusBar title="By part of speech" rows={byPos} />
      <StatusBar title="By frequency band" rows={byBand} />
      <StatusBar title="By level" rows={byLevel} />
      <StatusBar title="By topic" rows={byTopic} />

      <div className="w1000-stat-group">
        <h4>Reviews per day (last 14 days)</h4>
        <div className="w1000-chart">
          {last14Days.map(({ day, count }) => (
            <div key={day} className="w1000-chart-bar" title={`${count} review${count === 1 ? '' : 's'}`}>
              <div className="bar" style={{ height: `${(count / maxReviews) * 100}%` }} />
            </div>
          ))}
        </div>
      </div>

      <div className="w1000-plan-card">
        <h4>Study plan</h4>
        <ul>
          <li>🌙 Weeknights at 9 PM: a <strong>Today</strong> session of 15–20 minutes.</li>
          <li>🚌 Commute: <strong>Listen</strong> mode after your podcast.</li>
          <li>📅 Weekend: <strong>Weekend review</strong>, then your hard words.</li>
          <li>
            📈 Pace: {newCount} new word{newCount === 1 ? '' : 's'} left, finished by {newCount ? finishDate : 'now'} at {goal}/day.
            <label className="w1000-goal-inline">
              Daily goal:
              <input
                type="number"
                min="1"
                max="100"
                value={goal}
                onChange={(e) => wp.setGoal(Math.max(1, Number(e.target.value) || 1))}
              />
            </label>
          </li>
        </ul>
      </div>
    </div>
  );
}
