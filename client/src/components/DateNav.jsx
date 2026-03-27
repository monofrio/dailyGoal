import React from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function DateNav({ date, onPrev, onNext, onToday }) {
  const d = new Date(date + 'T00:00:00');
  const isToday = date === new Date().toISOString().slice(0, 10);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onPrev}
        className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
        title="Previous day"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="text-center min-w-[160px]">
        <div className="text-lg font-semibold text-zinc-100">
          {DAYS[d.getDay()]}, {MONTHS[d.getMonth()]} {d.getDate()}
        </div>
        <div className="text-xs text-zinc-500">{d.getFullYear()}</div>
      </div>

      <button
        onClick={onNext}
        className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
        title="Next day"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {!isToday && (
        <button
          onClick={onToday}
          className="ml-2 px-2.5 py-1 text-xs font-medium rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors"
        >
          Today
        </button>
      )}
    </div>
  );
}
