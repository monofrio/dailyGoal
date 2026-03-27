import { useState, useEffect, useCallback } from 'react';
import { getTasks, createTask, updateTask, deleteTask, getLog, saveLog, timerStart, timerStop, carryOver, reorderTasks } from '../api/index.js';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function useDay() {
  const [date, setDate] = useState(todayISO);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [t, l] = await Promise.all([getTasks(date), getLog(date)]);
      let allTasks = t;
      if (date <= todayISO()) {
        const { carried } = await carryOver(date);
        if (carried.length > 0) allTasks = [...t, ...carried];
      }
      setTasks(allTasks);
      setNotes(l.notes ?? '');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { load(); }, [load]);

  const addTask = async ({ title, priority = 'normal', tags = '' }) => {
    const task = await createTask({ date, title, priority, tags });
    setTasks(prev => [...prev, task]);
  };

  const toggleTask = async (id, completed) => {
    const updated = await updateTask(id, { completed });
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
  };

  const editTask = async (id, fields) => {
    const updated = await updateTask(id, fields);
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
  };

  const removeTask = async (id) => {
    await deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const startTimer = async (id) => {
    // Stop any other running timer first
    const running = tasks.find(t => t.timer_started_at && t.id !== id);
    if (running) {
      const stopped = await timerStop(running.id);
      setTasks(prev => prev.map(t => t.id === running.id ? stopped : t));
    }
    const updated = await timerStart(id);
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
  };

  const reorder = async (orderedIds) => {
    setTasks(prev => {
      const byId = Object.fromEntries(prev.map(t => [t.id, t]));
      const reordered = orderedIds.map((id, position) => ({ ...byId[id], position }));
      const rest = prev.filter(t => !orderedIds.includes(t.id));
      return [...reordered, ...rest];
    });
    await reorderTasks(date, orderedIds);
  };

  const stopTimer = async (id) => {
    const updated = await timerStop(id);
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
  };

  const persistNotes = useCallback(async (value) => {
    setNotes(value);
    await saveLog(date, value);
  }, [date]);

  const goTo = (d) => setDate(d);
  const goToday = () => setDate(todayISO());
  const shift = (days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().slice(0, 10));
  };

  return {
    date, tasks, notes, loading, error,
    addTask, toggleTask, editTask, removeTask,
    startTimer, stopTimer, reorder,
    persistNotes, goTo, goToday, shift,
  };
}
