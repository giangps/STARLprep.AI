require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const { SYSTEM_PROMPT } = require('./promptSpec');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI lazily (only when first request comes in)
let openai = null;
function getOpenAI() {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasApiKey: !!process.env.OPENAI_API_KEY,
  });
});

// DEBUG - remove later
app.get('/debug-env', (req, res) => {
  const envKeys = Object.keys(process.env).filter(k =>
    k.includes('OPENAI') || k.includes('PORT') || k.includes('RAILWAY')
  );
  const result = {};
  envKeys.forEach(k => {
    result[k] = k.includes('OPENAI') ? '***SET***' : process.env[k];
  });
  res.json({ envKeys: envKeys.length, vars: result });
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
    const client = getOpenAI();

    const openaiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ];

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: openaiMessages,
      temperature: 0.7,
      max_tokens: 4000,
    });

    const reply = completion.choices[0].message.content;

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
  console.log(`OPENAI_API_KEY present: ${!!process.env.OPENAI_API_KEY}`);
});