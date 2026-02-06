require('dotenv').config();

console.log('TEST_ENV value:', process.env.TEST_ENV);
console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
console.log('🔥 THIS SERVER.JS IS RUNNING');

const express = require('express');
const cors = require('cors');

// ✅ REQUIRED FOR NODE FETCH
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();

// ✅ CORS CONFIG (MUST BE FIRST)
const corsOptions = {
  origin: 'https://genz-talks.netlify.app',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // ✅ PREVENTS PREFLIGHT FAILURES

// ✅ REQUIRED FOR req.body
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// ✅ HEALTH CHECK
app.get('/health', (req, res) => {
  res.send('OK');
});

// ✅ TRANSLATE ROUTE
app.post('/translate', async (req, res) => {
  try {
    const prompt = req.body.prompt;

    if (!prompt) {
      return res.status(400).json({ error: 'No prompt provided' });
    }

    if (!GROQ_API_KEY) {
  return res.status(500).json({ error: 'Groq API key missing' });
}

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: prompt,
        temperature: 0.1,
        max_tokens: 400,
      }),
    });


    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return res.status(500).json({
        error: 'OpenAI API error',
        details: data,
      });
    }

    res.json(data);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
