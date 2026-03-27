import React, { useState, useEffect } from 'react';
import { getWeek } from '../api/index.js';

const DAY_SHORT  = ['Mon','Tue','Wed','Thu','Fri'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatShort(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

function MiniProgress({ total, done }) {
  if (total === 0) return <span className="text-xs text-zinc-700">No tasks</span>;
  const pct = Math.round((done / total) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full bg-zinc-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-zinc-500 tabular-nums">{done}/{total}</span>
    </div>
  );
}

export default function WeekView({ currentDate, onNavigate, onShiftWeek }) {
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getWeek(currentDate)
      .then(setData)
      .finally(() => setLoading(false));
  }, [currentDate]);

  const today = new Date().toISOString().slice(0, 10);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm">Loading week…</div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden px-6 py-4">
      {/* Week nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => onShiftWeek(-7)} className="p-1.5 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm text-zinc-400">
          {data && `${formatShort(data.from)} – ${formatShort(data.to)}`}
        </span>
        <button onClick={() => onShiftWeek(7)} className="p-1.5 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 5-column grid */}
      <div className="flex gap-3 flex-1 overflow-hidden">
        {data?.days.map((day, i) => {
          const isToday   = day.date === today;
          const isCurrent = day.date === currentDate;
          const open = day.tasks.filter(t => !t.completed);
          const done = day.tasks.filter(t =>  t.completed);
          const hasReview = !!day.review?.went_well || !!day.review?.blockers || !!day.review?.tomorrow;

          return (
            <button
              key={day.date}
              onClick={() => onNavigate(day.date)}
              className={`flex-1 flex flex-col rounded-xl border p-3 text-left transition-colors overflow-hidden ${
                isCurrent
                  ? 'border-zinc-500 bg-zinc-800/60'
                  : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-800/40'
              }`}
            >
              {/* Day header */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className={`text-xs font-semibold uppercase tracking-wider ${isToday ? 'text-zinc-200' : 'text-zinc-500'}`}>
                    {DAY_SHORT[i]}
                  </div>
                  <div className={`text-lg font-bold leading-none mt-0.5 ${isToday ? 'text-zinc-100' : 'text-zinc-400'}`}>
                    {new Date(day.date + 'T00:00:00').getDate()}
                  </div>
                </div>
                {hasReview && (
                  <span title="End-of-day review done" className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                )}
              </div>

              {/* Progress */}
              <MiniProgress total={day.tasks.length} done={done.length} />

              {/* Task preview */}
              <div className="flex-1 overflow-hidden mt-2 space-y-1">
                {open.slice(0, 4).map(t => (
                  <p key={t.id} className="text-[11px] text-zinc-500 truncate leading-snug">
                    {!!t.carried_from && <span className="text-amber-600 mr-1">↩</span>}
                    {t.title}
                  </p>
                ))}
                {open.length > 4 && (
                  <p className="text-[11px] text-zinc-700">+{open.length - 4} more</p>
                )}
                {day.tasks.length === 0 && (
                  <p className="text-[11px] text-zinc-700 italic">Empty</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
