import React, { useState, useEffect, useRef, useCallback } from 'react';
import { search } from '../api/index.js';

const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${DAY_NAMES[d.getDay()]} ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function highlight(text, query) {
  if (!query || !text) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, 120);
  const start = Math.max(0, idx - 40);
  const snippet = (start > 0 ? '…' : '') + text.slice(start, start + 160) + (start + 160 < text.length ? '…' : '');
  const rel = idx - start + (start > 0 ? 1 : 0); // adjust for ellipsis char
  // Return as string — will be rendered with a <mark> wrapper in JSX
  return { snippet, matchStart: rel, matchLen: query.length };
}

function Snippet({ text, query }) {
  const result = highlight(text, query);
  if (typeof result === 'string') return <span>{result}</span>;
  const { snippet, matchStart, matchLen } = result;
  return (
    <span>
      {snippet.slice(0, matchStart)}
      <mark className="bg-amber-500/30 text-amber-200 rounded-sm px-0.5">{snippet.slice(matchStart, matchStart + matchLen)}</mark>
      {snippet.slice(matchStart + matchLen)}
    </span>
  );
}

export default function SearchModal({ onClose, onNavigate }) {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try { setResults(await search(query)); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleSelect = (date) => {
    onNavigate(date);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
          <svg className="w-4 h-4 text-zinc-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tasks and notes…"
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-600 outline-none"
          />
          {loading && <span className="text-xs text-zinc-600">…</span>}
          <kbd className="text-[10px] text-zinc-600 border border-zinc-700 rounded px-1.5 py-0.5">Esc</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {results.length === 0 && query.length >= 2 && !loading && (
            <p className="text-sm text-zinc-600 text-center py-8">No results</p>
          )}
          {query.length < 2 && (
            <p className="text-xs text-zinc-700 text-center py-6">Type at least 2 characters</p>
          )}

          {results.map((r, i) => (
            <button
              key={`${r.type}-${r.id}-${i}`}
              onClick={() => handleSelect(r.date)}
              className="w-full text-left px-4 py-3 hover:bg-zinc-800 transition-colors border-b border-zinc-800/50 last:border-0"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  r.type === 'task'
                    ? 'bg-sky-900/50 text-sky-400'
                    : 'bg-purple-900/50 text-purple-400'
                }`}>
                  {r.type === 'task' ? 'Task' : 'Log'}
                </span>
                <span className="text-xs text-zinc-500">{formatDate(r.date)}</span>
              </div>
              <p className="text-sm text-zinc-300 leading-snug">
                <Snippet text={r.text} query={query} />
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
