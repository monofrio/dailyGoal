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

// Day log
export const getLog      = (date)        => req(`/log?date=${date}`);
export const saveLog     = (date, notes) => req('/log', { method: 'PUT', body: { date, notes } });
