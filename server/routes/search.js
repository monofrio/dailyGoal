const express = require('express');
const { db } = require('../db/init');
const router = express.Router();

// GET /api/search?q=query
router.get('/', (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.json([]);

  const term = `%${q.trim()}%`;

  const tasks = db.prepare(`
    SELECT 'task' as type, id, date, title as text, priority as meta
    FROM tasks
    WHERE title LIKE ?
    ORDER BY date DESC
    LIMIT 40
  `).all(term);

  const logs = db.prepare(`
    SELECT 'log' as type, id, date, notes as text, '' as meta
    FROM day_logs
    WHERE notes LIKE ?
    ORDER BY date DESC
    LIMIT 20
  `).all(term);

  // Merge and sort by date DESC
  const results = [...tasks, ...logs].sort((a, b) => b.date.localeCompare(a.date));
  res.json(results);
});

module.exports = router;
