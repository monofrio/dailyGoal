const express = require('express');
const { db } = require('../db/init');
const router = express.Router();

// GET /api/log?date=YYYY-MM-DD
router.get('/', (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date required' });
  const log = db.prepare('SELECT * FROM day_logs WHERE date = ?').get(date);
  res.json(log ?? { date, notes: '' });
});

// PUT /api/log  (upsert)
router.put('/', (req, res) => {
  const { date, notes } = req.body;
  if (!date) return res.status(400).json({ error: 'date required' });
  db.prepare(`
    INSERT INTO day_logs (date, notes, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(date) DO UPDATE SET
      notes      = excluded.notes,
      updated_at = excluded.updated_at
  `).run(date, notes ?? '');
  res.json(db.prepare('SELECT * FROM day_logs WHERE date = ?').get(date));
});

// GET /api/log/range?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/range', (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from and to required' });
  const logs = db.prepare('SELECT * FROM day_logs WHERE date BETWEEN ? AND ? ORDER BY date ASC').all(from, to);
  res.json(logs);
});

module.exports = router;
