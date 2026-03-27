const express = require('express');
const { db } = require('../db/init');
const router = express.Router();

function getWorkWeekBounds(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay(); // 0=Sun
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + mondayOffset);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  return [monday.toISOString().slice(0, 10), friday.toISOString().slice(0, 10)];
}

// GET /api/week?date=YYYY-MM-DD
router.get('/', (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date required' });

  const [from, to] = getWorkWeekBounds(date);

  const tasks   = db.prepare('SELECT * FROM tasks   WHERE date BETWEEN ? AND ? ORDER BY date, position, id').all(from, to);
  const logs    = db.prepare('SELECT * FROM day_logs    WHERE date BETWEEN ? AND ?').all(from, to);
  const reviews = db.prepare('SELECT * FROM day_reviews WHERE date BETWEEN ? AND ?').all(from, to);

  // Build one entry per work day
  const days = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(from + 'T00:00:00');
    d.setDate(d.getDate() + i);
    const ds = d.toISOString().slice(0, 10);
    days.push({
      date:    ds,
      tasks:   tasks.filter(t => t.date === ds),
      log:     logs.find(l => l.date === ds) ?? null,
      review:  reviews.find(r => r.date === ds) ?? null,
    });
  }

  res.json({ days, from, to });
});

module.exports = router;
