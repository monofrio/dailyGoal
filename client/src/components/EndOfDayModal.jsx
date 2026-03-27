import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getReview, saveReview } from '../api/index.js';

function useDebouncedCallback(fn, delay) {
  const timer = useRef(null);
  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

const PROMPTS = [
  { key: 'went_well', label: 'What went well?',     placeholder: 'Wins, progress, things that clicked…', color: 'text-emerald-400' },
  { key: 'blockers',  label: "What's blocked?",      placeholder: 'Stuck on, waiting on, need help with…', color: 'text-amber-400'   },
  { key: 'tomorrow',  label: 'Notes for tomorrow',   placeholder: 'Priorities, reminders, follow-ups…',    color: 'text-sky-400'     },
];

const DAY_NAMES   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function EndOfDayModal({ date, onClose }) {
  const [fields, setFields] = useState({ went_well: '', blockers: '', tomorrow: '' });
  const [saved, setSaved]   = useState(false);

  useEffect(() => {
    getReview(date).then(r => setFields({ went_well: r.went_well, blockers: r.blockers, tomorrow: r.tomorrow }));
  }, [date]);

  const persist = useDebouncedCallback(async (updated) => {
    await saveReview({ date, ...updated });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }, 600);

  const handleChange = (key, value) => {
    const updated = { ...fields, [key]: value };
    setFields(updated);
    persist(updated);
  };

  const d = new Date(date + 'T00:00:00');
  const label = `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;

  // Close on Escape
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div>
            <h2 className="font-semibold text-zinc-100">End of Day</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
          </div>
          <div className="flex items-center gap-3">
            {saved && <span className="text-xs text-zinc-500">saved</span>}
            <button onClick={onClose} className="p-1 rounded text-zinc-500 hover:text-zinc-200 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {PROMPTS.map(({ key, label, placeholder, color }) => (
            <div key={key}>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${color}`}>
                {label}
              </label>
              <textarea
                value={fields[key]}
                onChange={e => handleChange(key, e.target.value)}
                placeholder={placeholder}
                rows={3}
                className="w-full resize-none bg-zinc-800 border border-zinc-700 focus:border-zinc-500 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition-colors leading-relaxed"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
