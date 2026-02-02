const inputEl = document.getElementById('input');
const translateBtn = document.getElementById('translateBtn');
const clearBtn = document.getElementById('clearBtn');
const outputArea = document.getElementById('outputArea');
const toneSelect = document.getElementById('toneSelect');


// No client-side API key required when using the local proxy at /translate.
// The proxy (server.js) reads the OpenAI key from an environment variable on the server.
// This avoids exposing your OpenAI key in the browser.

// Create an output card given the result object
function makeCard(result){
  const card = document.createElement('div');
  card.className = 'output-card card';

  card.innerHTML = `
    <div class="result-header">
      <span class="result-label">Meaning</span>
      <button class="copy-btn">Copy</button>
    </div>

    <div class="result-meaning">${escapeHtml(result.meaning)}</div>

    <div class="result-grid">
      <div class="result-box">
        <span class="result-label">Simple English</span>
        <p>${escapeHtml(result.simple)}</p>
      </div>

      <div class="result-box">
        <span class="result-label">Example</span>
        <p>${escapeHtml(result.example)}</p>
      </div>
    </div>
  `;

  card.querySelector('.copy-btn').addEventListener('click', () => {
    const text = `Meaning: ${result.meaning}\nSimple English: ${result.simple}\nExample: ${result.example}`;
    navigator.clipboard.writeText(text);
  });

  return card;
}

// Escape HTML to avoid injection in demo code
function escapeHtml(str){
  return (str || '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

// Show a gentle follow-up card asking for more context
function makeFollowUpCard(question){
  const card = document.createElement('div');
  card.className = 'output-card card';
  card.innerHTML = `
    <div class="kicker">Need more context</div>
    <div class="field-title">${escapeHtml(question)}</div>
    <div style="margin-top:8px"><small class="hint">You can add more info and press Translate again.</small></div>
  `;
  return card;
}

// Show a spinner on the translate button
function setLoading(loading){
  translateBtn.disabled = loading;
  translateBtn.innerHTML = loading ? 'Translating...' : 'Translate';
}

async function translate(){
  const text = inputEl.value.trim();
  const tone = toneSelect.value;

  if(!text){
    alert('Please enter some Gen Z slang to translate.');
    return;
  }

  // Using local proxy at http://localhost:3000/translate — no client API key required.

  setLoading(true);
  outputArea.innerHTML = ''; // clear previous

  // Prompt to instruct the AI to return simple JSON with required fields.

  const systemMsg = `
  You are a Gen Z slang translator.

  Your job is to explain Gen Z words, phrases, or sentences in very simple English
  so that parents, teachers, and professionals can easily understand.

  Tone rules:
  - Use a ${tone} tone
  - Be clear, friendly, and non-judgmental
  - Do NOT use Gen Z slang in explanations
  - Avoid long or complex words

  Output rules:
  - If the meaning is unclear, respond ONLY with valid JSON:
    { "needs_context": true, "followup": "short polite question" }

  - Otherwise respond ONLY with valid JSON:
    {
      "needs_context": false,
      "meaning": "short meaning",
      "simple": "simple English sentence",
      "example": "one short example sentence"
    }

  Do not include anything outside JSON.
`;

  const userMsg = `Translate this: "${text}"`;

  try{
    const resp = await fetch('http://localhost:3000/translate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: [
      { role: 'system', content: systemMsg },
      { role: 'user', content: userMsg }
    ]
  })
});


if(!resp.ok){
  const errText = await resp.text();
  throw new Error('API Error: '+errText);
}

    const data = await resp.json();
    const raw = data.choices?.[0]?.message?.content || '';

    // Try to parse JSON from the model's output. Some models include backticks or text—be tolerant.
    const maybeJson = raw.replaceAll('\n',' ').replace(/```json\s*|```/g,'').trim();
    let parsed;
    try{ parsed = JSON.parse(maybeJson); }
    catch(e){
      // If parsing fails, try to find first {..} substring
      const match = raw.match(/\{[\s\S]*\}/);
      if(match) parsed = JSON.parse(match[0]);
      else throw new Error('Could not parse model output as JSON: ' + raw.substring(0,300));
    }

    if(parsed.needs_context){
      const card = makeFollowUpCard(parsed.followup || 'Could you share a little more about the situation?');
      outputArea.appendChild(card);
    } else {
      const result = {
        meaning: parsed.meaning || '—',
        simple: parsed.simple || '—',
        example: parsed.example || '—'
      };
      outputArea.appendChild(makeCard(result));
    }

  }catch(err){
    console.error(err);
    const card = document.createElement('div');
    card.className = 'output-card card';
    card.innerHTML = `<div class="kicker">Error</div><div class="field-title">${escapeHtml(err.message)}</div><div style="margin-top:8px"><small class="hint">Check your API key and network. See README for proxy option.</small></div>`;
    outputArea.appendChild(card);
  } finally{
    setLoading(false);
  }
}

// Button handlers
translateBtn.addEventListener('click', translate);
clearBtn.addEventListener('click', ()=>{ inputEl.value = ''; outputArea.innerHTML = ''; });

// Allow press Ctrl+Enter to Translate
inputEl.addEventListener('keydown', (e)=>{ if((e.ctrlKey||e.metaKey) && e.key === 'Enter') translate(); });

inputEl.focus();

const themeToggle = document.getElementById('themeToggle');

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  themeToggle.textContent =
    document.body.classList.contains('dark') ? '☀️' : '🌙';
});

// End of script.js