import React from 'react';
import TaskItem from './TaskItem.jsx';
import AddTask from './AddTask.jsx';

export default function TaskList({ tasks, onAdd, onToggle, onDelete, onEdit }) {
  const open = tasks.filter(t => !t.completed);
  const done = tasks.filter(t => t.completed);
  const pct  = tasks.length ? Math.round((done.length / tasks.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Goals & Tasks</h2>
        {tasks.length > 0 && (
          <span className="text-xs text-zinc-500">{done.length}/{tasks.length} done</span>
        )}
      </div>

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-zinc-500 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {/* Add input */}
      <AddTask onAdd={onAdd} />

      {/* Open tasks */}
      <div className="flex-1 overflow-y-auto -mr-2 pr-2">
        {open.length === 0 && done.length === 0 && (
          <p className="text-sm text-zinc-600 text-center py-8">No tasks yet. Add one above.</p>
        )}

        {open.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}

        {/* Completed section */}
        {done.length > 0 && (
          <>
            <div className="mt-4 mb-1 flex items-center gap-2">
              <div className="h-px flex-1 bg-zinc-800" />
              <span className="text-[11px] text-zinc-600 uppercase tracking-wider">Completed</span>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>
            {done.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
