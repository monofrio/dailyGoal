const BASE = '/api';

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Tasks
export const getTasks    = (date)        => req(`/tasks?date=${date}`);
export const createTask  = (body)        => req('/tasks', { method: 'POST', body });
export const updateTask  = (id, body)    => req(`/tasks/${id}`, { method: 'PATCH', body });
export const deleteTask  = (id)          => req(`/tasks/${id}`, { method: 'DELETE' });
export const timerStart  = (id)          => req(`/tasks/${id}/timer/start`, { method: 'POST' });
export const timerStop   = (id)          => req(`/tasks/${id}/timer/stop`,  { method: 'POST' });
export const carryOver   = (date)        => req('/tasks/carry-over', { method: 'POST', body: { date } });
export const reorderTasks = (date, order) => req('/tasks/reorder', { method: 'PUT', body: { date, order } });

// Reviews
export const getReview   = (date)        => req(`/reviews/${date}`);
export const saveReview  = (body)        => req('/reviews', { method: 'PUT', body });

// Search
export const search      = (q)           => req(`/search?q=${encodeURIComponent(q)}`);

// Week
export const getWeek     = (date)        => req(`/week?date=${date}`);

// Day log
export const getLog      = (date)        => req(`/log?date=${date}`);
export const saveLog     = (date, notes) => req('/log', { method: 'PUT', body: { date, notes } });
