require('dotenv').config();
console.log('TEST_ENV value:', process.env.TEST_ENV);
console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);


console.log("🔥 THIS SERVER.JS IS RUNNING");

const express = require('express');
const cors = require('cors');


const app = express();

// ✅ CORS MUST BE BEFORE ROUTES
const cors = require('cors');

app.use(cors({
  origin: 'https://genz-talks.netlify.app',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


const OPENAI_KEY = process.env.OPENAI_API_KEY;

// ✅ HEALTH CHECK ROUTE (FOR DEBUGGING)
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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
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
    details: data
  });
}

res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

