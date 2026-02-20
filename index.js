require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Chat stub (Phase 2)
app.post('/chat', (req, res) => {
  res.json({ type: 'error', reply: 'Not implemented yet.' });
});

app.listen(PORT, () => {
  console.log(`STARLPrep backend running on port ${PORT}`);
});