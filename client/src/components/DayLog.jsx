import React, { useCallback, useRef } from 'react';

// Debounce helper
function useDebouncedCallback(fn, delay) {
  const timer = useRef(null);
  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

export default function DayLog({ notes, onChange }) {
  const save = useDebouncedCallback(onChange, 800);

  const handleChange = (e) => {
    save(e.target.value);
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Daily Log</h2>
        <span className="text-[11px] text-zinc-600">auto-saved</span>
      </div>

      <textarea
        key={notes /* reset when date changes */}
        defaultValue={notes}
        onChange={handleChange}
        placeholder={`What else happened today?\n\nFree-form notes — anything goes.\nMeetings, ideas, blockers, wins...`}
        className="flex-1 resize-none bg-zinc-900 border border-zinc-800 focus:border-zinc-600 rounded-lg p-3 text-sm text-zinc-200 placeholder-zinc-700 outline-none transition-colors leading-relaxed font-mono"
        spellCheck={false}
      />
    </div>
  );
}
