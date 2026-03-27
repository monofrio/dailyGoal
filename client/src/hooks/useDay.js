import { useState, useEffect, useCallback } from 'react';
import { getTasks, createTask, updateTask, deleteTask, getLog, saveLog } from '../api/index.js';

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
      setTasks(t);
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
    persistNotes, goTo, goToday, shift,
  };
}
