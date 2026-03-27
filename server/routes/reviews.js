const express = require('express');
const { db } = require('../db/init');
const router = express.Router();

// GET /api/reviews/:date
router.get('/:date', (req, res) => {
  const { date } = req.params;
  const review = db.prepare('SELECT * FROM day_reviews WHERE date = ?').get(date);
  res.json(review ?? { date, went_well: '', blockers: '', tomorrow: '' });
});

// PUT /api/reviews  (upsert)
router.put('/', (req, res) => {
  const { date, went_well = '', blockers = '', tomorrow = '' } = req.body;
  if (!date) return res.status(400).json({ error: 'date required' });
  db.prepare(`
    INSERT INTO day_reviews (date, went_well, blockers, tomorrow, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'))
    ON CONFLICT(date) DO UPDATE SET
      went_well  = excluded.went_well,
      blockers   = excluded.blockers,
      tomorrow   = excluded.tomorrow,
      updated_at = excluded.updated_at
  `).run(date, went_well, blockers, tomorrow);
  res.json(db.prepare('SELECT * FROM day_reviews WHERE date = ?').get(date));
});

// GET /api/reviews/range?from=&to=  (used by week view)
router.get('/', (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from and to required' });
  const reviews = db.prepare('SELECT * FROM day_reviews WHERE date BETWEEN ? AND ?').all(from, to);
  res.json(reviews);
});

module.exports = router;
