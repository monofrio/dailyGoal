import React, { useState, useRef, useEffect } from 'react';

const PRIORITY_DOT = {
  high:   'bg-red-500',
  normal: 'bg-zinc-600',
  low:    'bg-zinc-700',
};

export default function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const inputRef = useRef(null);

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

  return (
    <div className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-800/50 transition-colors task-enter ${task.completed ? 'opacity-50' : ''}`}>
      {/* Priority indicator */}
      <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-0.5 ${PRIORITY_DOT[task.priority] ?? PRIORITY_DOT.normal}`} />

      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id, !task.completed)}
        className={`flex-shrink-0 w-4 h-4 rounded border transition-colors ${
          task.completed
            ? 'bg-zinc-500 border-zinc-500'
            : 'border-zinc-600 hover:border-zinc-400'
        }`}
        title={task.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {task.completed && (
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
            className={`text-sm cursor-default select-none ${task.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}`}
            title="Double-click to edit"
          >
            {task.title}
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
