const express = require('express');
const { db } = require('../db/init');
const router = express.Router();

// GET /api/tasks?date=YYYY-MM-DD
router.get('/', (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date required' });
  const tasks = db.prepare('SELECT * FROM tasks WHERE date = ? ORDER BY position ASC, id ASC').all(date);
  res.json(tasks);
});

// POST /api/tasks
router.post('/', (req, res) => {
  const { date, title, priority = 'normal', tags = '' } = req.body;
  if (!date || !title) return res.status(400).json({ error: 'date and title required' });
  const maxPos = db.prepare('SELECT MAX(position) as m FROM tasks WHERE date = ?').get(date);
  const position = (maxPos.m ?? -1) + 1;
  const result = db.prepare(
    'INSERT INTO tasks (date, title, priority, tags, position) VALUES (?, ?, ?, ?, ?)'
  ).run(date, title.trim(), priority, tags, position);
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(task);
});

// PATCH /api/tasks/:id
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { completed, title, priority, tags, position } = req.body;
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!task) return res.status(404).json({ error: 'not found' });

  const updated = db.prepare(`
    UPDATE tasks SET
      completed = COALESCE(?, completed),
      title     = COALESCE(?, title),
      priority  = COALESCE(?, priority),
      tags      = COALESCE(?, tags),
      position  = COALESCE(?, position)
    WHERE id = ?
  `).run(
    completed !== undefined ? (completed ? 1 : 0) : null,
    title ?? null,
    priority ?? null,
    tags ?? null,
    position ?? null,
    id
  );
  res.json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(id));
});

// POST /api/tasks/carry-over  { date: 'YYYY-MM-DD' }
router.post('/carry-over', (req, res) => {
  const { date } = req.body;
  if (!date) return res.status(400).json({ error: 'date required' });

  // Most recent day before `date` that has incomplete tasks
  const prevDay = db.prepare(`
    SELECT DISTINCT date FROM tasks
    WHERE date < ? AND completed = 0
    ORDER BY date DESC LIMIT 1
  `).get(date);

  if (!prevDay) return res.json({ carried: [], from: null });

  // Idempotency: skip if already carried from this source day
  const already = db.prepare(
    'SELECT COUNT(*) as n FROM tasks WHERE date = ? AND carried_from = ?'
  ).get(date, prevDay.date);
  if (already.n > 0) return res.json({ carried: [], from: prevDay.date });

  // Incomplete tasks from the source day (exclude ones that were themselves carried — avoid double-badge)
  const incomplete = db.prepare(
    'SELECT * FROM tasks WHERE date = ? AND completed = 0 ORDER BY position ASC, id ASC'
  ).all(prevDay.date);

  if (incomplete.length === 0) return res.json({ carried: [], from: prevDay.date });

  const maxPos = db.prepare('SELECT MAX(position) as m FROM tasks WHERE date = ?').get(date);
  let position = (maxPos.m ?? -1) + 1;

  const carried = [];
  for (const src of incomplete) {
    const result = db.prepare(`
      INSERT INTO tasks (date, title, priority, tags, position, carried_from)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(date, src.title, src.priority, src.tags, position++, prevDay.date);
    carried.push(db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid));
  }

  res.json({ carried, from: prevDay.date });
});

// POST /api/tasks/:id/timer/start
router.post('/:id/timer/start', (req, res) => {
  const { id } = req.params;
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!task) return res.status(404).json({ error: 'not found' });
  // If already running, just return current state
  if (task.timer_started_at) return res.json(task);
  db.prepare(`UPDATE tasks SET timer_started_at = datetime('now') WHERE id = ?`).run(id);
  res.json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(id));
});

// POST /api/tasks/:id/timer/stop
router.post('/:id/timer/stop', (req, res) => {
  const { id } = req.params;
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!task) return res.status(404).json({ error: 'not found' });
  if (!task.timer_started_at) return res.json(task);
  db.prepare(`
    UPDATE tasks SET
      time_spent       = time_spent + CAST((julianday('now') - julianday(timer_started_at)) * 86400 AS INTEGER),
      timer_started_at = NULL
    WHERE id = ?
  `).run(id);
  res.json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(id));
});

// PUT /api/tasks/reorder  { date, order: [id, id, ...] }
router.put('/reorder', (req, res) => {
  const { date, order } = req.body;
  if (!date || !Array.isArray(order)) return res.status(400).json({ error: 'date and order[] required' });
  order.forEach((id, position) => {
    db.prepare('UPDATE tasks SET position = ? WHERE id = ? AND date = ?').run(position, id, date);
  });
  res.json({ ok: true });
});

// DELETE /api/tasks/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  if (result.changes === 0) return res.status(404).json({ error: 'not found' });
  res.json({ deleted: true });
});

module.exports = router;
