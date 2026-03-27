import React from 'react';
import { useDay } from './hooks/useDay.js';
import DateNav from './components/DateNav.jsx';
import TaskList from './components/TaskList.jsx';
import DayLog from './components/DayLog.jsx';

export default function App() {
  const {
    date, tasks, notes, loading, error,
    addTask, toggleTask, editTask, removeTask,
    persistNotes, goToday, shift,
  } = useDay();

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60">
        <span className="text-lg font-semibold tracking-tight text-zinc-100">
          day<span className="text-zinc-500">log</span>
        </span>
        <DateNav
          date={date}
          onPrev={() => shift(-1)}
          onNext={() => shift(1)}
          onToday={goToday}
        />
        <div className="w-[80px]" /> {/* spacer to center nav */}
      </header>

      {/* Main content */}
      <main className="flex-1 flex overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm">
            Loading…
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-red-400 text-sm">
            {error} — is the server running?
          </div>
        ) : (
          <>
            {/* Tasks panel */}
            <section className="w-1/2 flex flex-col p-6 border-r border-zinc-800/60 overflow-hidden">
              <TaskList
                tasks={tasks}
                onAdd={addTask}
                onToggle={toggleTask}
                onDelete={removeTask}
                onEdit={editTask}
              />
            </section>

            {/* Log panel */}
            <section className="w-1/2 flex flex-col p-6 overflow-hidden">
              <DayLog notes={notes} onChange={persistNotes} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
