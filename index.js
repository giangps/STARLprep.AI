require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const { SYSTEM_PROMPT } = require('./promptSpec');

const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Chat endpoint
app.post('/chat', async (req, res) => {
  const { sessionId, messages } = req.body;

  // Basic validation
  if (!sessionId || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      type: 'error',
      reply: 'Invalid request. Required: { sessionId: string, messages: [{ role, content }] }'
    });
  }

  const lastMessage = messages[messages.length - 1];
  if (!lastMessage.role || !lastMessage.content) {
    return res.status(400).json({
      type: 'error',
      reply: 'Each message must have "role" and "content" fields.'
    });
  }

  console.log(`[chat] sessionId=${sessionId} messages=${messages.length} lastRole=${lastMessage.role}`);

  try {
    // Build messages array for OpenAI
    const openaiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: openaiMessages,
      temperature: 0.7,
      max_tokens: 4000,
    });

    const reply = completion.choices[0].message.content;

    // Determine type based on content
    // If the reply contains ALL 7 final output sections, it's "final"
    // Otherwise it's "clarify" (asking questions, fit check, etc.)
    const isFinal = reply.includes('**Spoken Version**') || reply.includes('## Spoken Version');
    const type = isFinal ? 'final' : 'clarify';

    console.log(`[chat] sessionId=${sessionId} type=${type} replyLength=${reply.length}`);

    res.json({ type, reply });

  } catch (error) {
    console.error(`[chat] ERROR sessionId=${sessionId}`, error.message);
    res.status(500).json({
      type: 'error',
      reply: 'Something went wrong while generating your coaching response. Please try again.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`STARLPrep backend running on port ${PORT}`);
});