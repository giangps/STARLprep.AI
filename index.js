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

// Chat endpoint
app.post('/chat', (req, res) => {
  const { sessionId, messages } = req.body;

  // Basic validation
  if (!sessionId || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      type: 'error',
      reply: 'Invalid request. Required: { sessionId: string, messages: [{ role, content }] }'
    });
  }

  // Validate message shape
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage.role || !lastMessage.content) {
    return res.status(400).json({
      type: 'error',
      reply: 'Each message must have "role" and "content" fields.'
    });
  }

  console.log(`[chat] sessionId=${sessionId} messages=${messages.length} lastRole=${lastMessage.role}`);

  // Stub response (Phase 3 will replace with LLM call)
  res.json({
    type: 'clarify',
    reply: 'Thank you for sharing your story. Before I coach you, I need to confirm: **What is the exact behavioral interview question you want to answer?**'
  });
});

app.listen(PORT, () => {
  console.log(`STARLPrep backend running on port ${PORT}`);
});