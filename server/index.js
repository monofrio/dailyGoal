const express = require('express');
const cors = require('cors');
const { init } = require('./db/init');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/log',   require('./routes/logs'));
app.get('/api/health', (_req, res) => res.json({ ok: true }));

init().then(() => {
  app.listen(PORT, () => {
    console.log(`daylog server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
