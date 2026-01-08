// Gen Z Translator - script.js
// Beginner-friendly JavaScript with comments.
// NOTE: For security, do NOT commit your real API key. See README.

const inputEl = document.getElementById('input');
const translateBtn = document.getElementById('translateBtn');
const clearBtn = document.getElementById('clearBtn');
const outputArea = document.getElementById('outputArea');

// No client-side API key required when using the local proxy at /translate.
// The proxy (server.js) reads the OpenAI key from an environment variable on the server.
// This avoids exposing your OpenAI key in the browser.

// Create an output card given the result object
function makeCard(result){
  const card = document.createElement('div');
  card.className = 'output-card card';

  // Header row: meaning + copy button
  const header = document.createElement('div');
  header.className = 'output-row';

  const kicker = document.createElement('div');
  kicker.innerHTML = `<div class="kicker">Meaning</div><div class="field-title">${escapeHtml(result.meaning)}</div>`;

  const copyBtn = document.createElement('button');
  copyBtn.className = 'copy-btn';
  copyBtn.textContent = 'Copy Result';
  copyBtn.addEventListener('click', ()=>{
    const text = `Meaning: ${result.meaning}\nSimple English: ${result.simple}\nExample: ${result.example}`;
    navigator.clipboard.writeText(text).then(()=>{
      copyBtn.textContent = 'Copied ✓';
      setTimeout(()=>copyBtn.textContent = 'Copy Result',1400);
    }).catch(()=>copyBtn.textContent = 'Copy Failed');
  });

  header.appendChild(kicker);
  header.appendChild(copyBtn);
  card.appendChild(header);

  // Body rows
  const simple = document.createElement('div');
  simple.className = 'small';
  simple.innerHTML = `<div class="kicker">Simple English</div><div>${escapeHtml(result.simple)}</div>`;
  card.appendChild(simple);

  const example = document.createElement('div');
  example.className = 'small';
  example.innerHTML = `<div class="kicker">Example sentence</div><div>${escapeHtml(result.example)}</div>`;
  card.appendChild(example);

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
  translateBtn.innerHTML = loading ? '<span class="spinner" aria-hidden="true"></span>' : 'Translate';
}

async function translate(){
  const text = inputEl.value.trim();
  if(!text){
    alert('Please enter some Gen Z slang to translate.');
    return;
  }

  // Using local proxy at http://localhost:3000/translate — no client API key required.

  setLoading(true);
  outputArea.innerHTML = ''; // clear previous

  // Prompt to instruct the AI to return simple JSON with required fields.
  const systemMsg = `You are a friendly Gen Z slang translator for parents/teachers/professionals. Use very simple, non-judgmental language. If the phrase is ambiguous and needs more context, reply with JSON: {"needs_context": true, "followup": "short question"}. Otherwise reply with JSON: {"needs_context": false, "meaning":"short meaning","simple":"simple english","example":"one example sentence"}. Do not use slang, avoid long words.`;
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

// End of script.js