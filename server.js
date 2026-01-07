// Optional Express proxy to keep your OpenAI key secret
// Usage: set OPENAI_API_KEY env var, then `node server.js`.
// This exposes POST /translate which forwards the prompt to OpenAI.

const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

const OPENAI_KEY = process.env.OPENAI_API_KEY;
if(!OPENAI_KEY){
  console.warn('Warning: OPENAI_API_KEY is not set. Proxy will reject requests.');
}

app.post('/translate', async (req,res)=>{
  if(!OPENAI_KEY) return res.status(500).json({error:'Server missing OPENAI_API_KEY'});
  const prompt = req.body.prompt;
  if(!prompt) return res.status(400).json({error:'No prompt provided'});

  try{
    const r = await fetch('https://api.openai.com/v1/chat/completions',{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization':`Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({model:'gpt-3.5-turbo',messages:prompt,max_tokens:400,temperature:0.1})
    });
    const j = await r.json();
    res.json(j);
  }catch(e){
    console.error(e);res.status(500).json({error:e.message});
  }
});

const port = process.env.PORT || 3000;
app.listen(port, ()=>console.log(`Proxy listening on http://localhost:${port}`));
