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

// DELETE /api/tasks/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  if (result.changes === 0) return res.status(404).json({ error: 'not found' });
  res.json({ deleted: true });
});

module.exports = router;
