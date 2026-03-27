import React, { useState, useRef } from 'react';

const PRIORITIES = [
  { value: 'high',   label: 'High',   color: 'text-red-400' },
  { value: 'normal', label: 'Normal', color: 'text-zinc-400' },
  { value: 'low',    label: 'Low',    color: 'text-zinc-500' },
];

export default function AddTask({ onAdd }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('normal');
  const [showOpts, setShowOpts] = useState(false);
  const inputRef = useRef(null);

  const submit = async (e) => {
    e?.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    await onAdd({ title: trimmed, priority });
    setTitle('');
    setPriority('normal');
    inputRef.current?.focus();
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') submit();
  };

  const pri = PRIORITIES.find(p => p.value === priority);

  return (
    <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-800 focus-within:border-zinc-600 transition-colors">
      {/* Priority picker */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowOpts(v => !v)}
          className={`text-xs font-medium px-1.5 py-0.5 rounded ${pri.color} hover:bg-zinc-800 transition-colors`}
          title="Set priority"
        >
          {pri.label}
        </button>
        {showOpts && (
          <div className="absolute top-full left-0 mt-1 z-10 rounded-md bg-zinc-800 border border-zinc-700 shadow-xl py-1 min-w-[90px]">
            {PRIORITIES.map(p => (
              <button
                key={p.value}
                onClick={() => { setPriority(p.value); setShowOpts(false); }}
                className={`w-full text-left px-3 py-1.5 text-xs ${p.color} hover:bg-zinc-700 transition-colors`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Add a task… (Enter to save)"
        className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-600 outline-none"
      />

      <button
        type="button"
        onClick={submit}
        disabled={!title.trim()}
        className="p-1 rounded text-zinc-500 hover:text-zinc-200 disabled:opacity-30 transition-colors"
        title="Add task"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
