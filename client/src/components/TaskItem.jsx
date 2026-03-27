import React, { useState, useRef, useEffect } from 'react';

const PRIORITY_DOT = {
  high:   'bg-red-500',
  normal: 'bg-zinc-600',
  low:    'bg-zinc-700',
};

const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatCarriedFrom(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${DAY_NAMES[d.getDay()]} ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function TaskItem({ task, onToggle, onDelete, onEdit, onTimerStart, onTimerStop, dragHandleProps }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const [elapsed, setElapsed] = useState(task.time_spent ?? 0);
  const inputRef = useRef(null);

  // Tick when timer is running
  useEffect(() => {
    setElapsed(task.time_spent ?? 0);
    if (!task.timer_started_at) return;
    const base = task.time_spent ?? 0;
    const startedAt = new Date(task.timer_started_at.replace(' ', 'T') + 'Z').getTime();
    const tick = () => setElapsed(base + Math.floor((Date.now() - startedAt) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [task.timer_started_at, task.time_spent]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commitEdit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== task.title) {
      onEdit(task.id, { title: trimmed });
    } else {
      setDraft(task.title);
    }
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter')  commitEdit();
    if (e.key === 'Escape') { setDraft(task.title); setEditing(false); }
  };

  const isRunning = !!task.timer_started_at;
  const hasTime   = elapsed > 0;

  return (
    <div className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-800/50 transition-colors task-enter ${!!task.completed ? 'opacity-50' : ''}`}>
      {/* Drag handle */}
      {dragHandleProps ? (
        <span
          {...dragHandleProps}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-400 transition-opacity touch-none"
          title="Drag to reorder"
        >
          <svg className="w-3 h-4" fill="currentColor" viewBox="0 0 8 14">
            <circle cx="2" cy="2"  r="1.2"/><circle cx="6" cy="2"  r="1.2"/>
            <circle cx="2" cy="7"  r="1.2"/><circle cx="6" cy="7"  r="1.2"/>
            <circle cx="2" cy="12" r="1.2"/><circle cx="6" cy="12" r="1.2"/>
          </svg>
        </span>
      ) : (
        <span className="w-3 flex-shrink-0" />
      )}

      {/* Priority indicator */}
      <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-0.5 ${PRIORITY_DOT[task.priority] ?? PRIORITY_DOT.normal}`} />

      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id, !task.completed)}
        className={`flex-shrink-0 w-4 h-4 rounded border transition-colors ${
          !!task.completed
            ? 'bg-zinc-500 border-zinc-500'
            : 'border-zinc-600 hover:border-zinc-400'
        }`}
        title={!!task.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {!!task.completed && (
          <svg className="w-4 h-4 text-zinc-300 -mt-px -ml-px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            className="w-full bg-zinc-800 text-sm text-zinc-100 rounded px-1 outline-none border border-zinc-600"
          />
        ) : (
          <span
            onDoubleClick={() => setEditing(true)}
            className={`text-sm cursor-default select-none ${!!task.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}`}
            title="Double-click to edit"
          >
            {task.title}
          </span>
        )}

        {/* Carried-over badge */}
        {task.carried_from && (
          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-800/40">
            ↩ {formatCarriedFrom(task.carried_from)}
          </span>
        )}

        {/* Tags */}
        {task.tags && (
          <div className="flex gap-1 mt-0.5 flex-wrap">
            {task.tags.split(',').filter(Boolean).map(tag => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-500">
                {tag.trim()}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Timer display */}
      {hasTime && (
        <span className={`text-xs font-mono tabular-nums ${isRunning ? 'text-emerald-400' : 'text-zinc-500'}`}>
          {formatTime(elapsed)}
        </span>
      )}

      {/* Timer button */}
      <button
        onClick={() => isRunning ? onTimerStop(task.id) : onTimerStart(task.id)}
        className={`flex-shrink-0 p-1 rounded transition-all ${
          isRunning
            ? 'text-emerald-400 hover:text-emerald-300 opacity-100'
            : 'text-zinc-600 hover:text-zinc-300 opacity-0 group-hover:opacity-100'
        }`}
        title={isRunning ? 'Stop timer' : 'Start timer'}
      >
        {isRunning ? (
          // Stop icon (square)
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <rect x="5" y="5" width="14" height="14" rx="2" />
          </svg>
        ) : (
          // Play icon (triangle)
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Delete */}
      <button
        onClick={() => onDelete(task.id)}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded text-zinc-600 hover:text-red-400 transition-all"
        title="Delete task"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
