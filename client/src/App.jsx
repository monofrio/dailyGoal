import React, { useState, useEffect } from 'react';
import { useDay } from './hooks/useDay.js';
import DateNav from './components/DateNav.jsx';
import TaskList from './components/TaskList.jsx';
import DayLog from './components/DayLog.jsx';
import WeekView from './components/WeekView.jsx';
import SearchModal from './components/SearchModal.jsx';
import EndOfDayModal from './components/EndOfDayModal.jsx';

export default function App() {
  const {
    date, tasks, notes, loading, error,
    addTask, toggleTask, editTask, removeTask,
    startTimer, stopTimer, reorder,
    persistNotes, goTo, goToday, shift,
  } = useDay();

  const [view,       setView]       = useState('day');  // 'day' | 'week'
  const [showSearch, setShowSearch] = useState(false);
  const [showReview, setShowReview] = useState(false);

  // Cmd+K / Ctrl+K for search
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const handleNavigate = (d) => {
    goTo(d);
    setView('day');
  };

  const shiftWeek = (days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    goTo(d.toISOString().slice(0, 10));
  };

  return (
    <div className="h-screen bg-zinc-950 flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-800/60 flex-shrink-0">
        <span className="text-lg font-semibold tracking-tight text-zinc-100 w-[100px]">
          day<span className="text-zinc-500">log</span>
        </span>

        {view === 'day' ? (
          <DateNav date={date} onPrev={() => shift(-1)} onNext={() => shift(1)} onToday={goToday} />
        ) : (
          <span className="text-sm text-zinc-400 font-medium">Week View</span>
        )}

        {/* Right controls */}
        <div className="flex items-center gap-2 w-[200px] justify-end">
          {/* Search */}
          <button
            onClick={() => setShowSearch(true)}
            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Search (⌘K)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Day / Week toggle */}
          <div className="flex rounded-md border border-zinc-800 overflow-hidden text-xs">
            <button
              onClick={() => setView('day')}
              className={`px-2.5 py-1.5 transition-colors ${view === 'day' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Day
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-2.5 py-1.5 transition-colors ${view === 'week' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Week
            </button>
          </div>

          {/* End of Day */}
          <button
            onClick={() => setShowReview(true)}
            className="px-2.5 py-1.5 text-xs rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors"
            title="End of day review"
          >
            End of Day
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex overflow-hidden">
        {view === 'week' ? (
          <WeekView
            currentDate={date}
            onNavigate={handleNavigate}
            onShiftWeek={shiftWeek}
          />
        ) : loading ? (
          <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm">Loading…</div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-red-400 text-sm">
            {error} — is the server running?
          </div>
        ) : (
          <>
            <section className="w-1/2 flex flex-col p-6 border-r border-zinc-800/60 overflow-hidden">
              <TaskList
                tasks={tasks}
                onAdd={addTask}
                onToggle={toggleTask}
                onDelete={removeTask}
                onEdit={editTask}
                onTimerStart={startTimer}
                onTimerStop={stopTimer}
                onReorder={reorder}
              />
            </section>
            <section className="w-1/2 flex flex-col p-6 overflow-hidden">
              <DayLog notes={notes} onChange={persistNotes} />
            </section>
          </>
        )}
      </main>

      {/* Modals */}
      {showSearch && (
        <SearchModal onClose={() => setShowSearch(false)} onNavigate={handleNavigate} />
      )}
      {showReview && (
        <EndOfDayModal date={date} onClose={() => setShowReview(false)} />
      )}
    </div>
  );
}
