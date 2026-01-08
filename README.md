# Gen Z Translator (frontend)

A tiny mobile-first web app that converts Gen Z slang into simple, friendly English using an AI API.

Features
- Large text input with example placeholder: "Bro said it’s giving main character energy"
- Translate button + optional Ctrl/Cmd+Enter
- Card-based output: Meaning, Simple English, Example sentence
- Polite follow-up if more context is needed
- Copy Result button

Security note
- This demo calls the OpenAI API directly from the browser which requires your API key. Storing the key in client-side code exposes it. For production, use a server-side proxy to keep the key secret.

Quick start (recommended: local proxy)
1. Download or clone this folder.
2. Install dependencies and start the proxy which keeps your key secret:
   - `npm install`
   - macOS/Linux: `OPENAI_API_KEY='sk-...' node server.js`
   - Windows (PowerShell): `$env:OPENAI_API_KEY = 'sk-...'; node server.js`
3. Serve the frontend or open `http://localhost:3000` and the app will call the proxy at `http://localhost:3000/translate`.

Frontend-only (insecure, for quick testing)
- If you want a fast local test and accept the security risk, create `config.js` in the project root with:

```js
// config.js (INSECURE: do not commit)
window.GENZ_API_KEY = 'sk-...';
```

- Serving `index.html` directly from `file://` may block fetch; use a small local server (e.g., `python -m http.server 8000`) and open `http://localhost:8000`.

Note: Using the proxy avoids CORS issues and does not expose your API key in the browser.
Prompt & design notes
- The app instructs the model to reply in a strict JSON format so the frontend can parse results reliably.
- Explanations are simple and non-judgmental by design.

License & notes
- This is a small demo; if you want, I can add a server proxy example, tests, or help deploy it.

Enjoy! 😄