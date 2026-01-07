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

Quick start (frontend-only, easiest)
1. Download or clone this folder.
2. Create a file named `config.js` in the same folder with this content:

```js
// Do NOT commit this file to source control
window.GENZ_API_KEY = 'sk-...';
```

3. Open `index.html` in your browser and try it. (Some browsers may block fetch from local file URLs; if so, use a simple local server.)

Run with a simple local server (recommended)
- If you have Python installed: `python -m http.server 8000` then open `http://localhost:8000`

Alternative: Small Node proxy (keeps key secret)
- Create `server.js` with an express proxy that reads the key from an env var. Start with `node server.js` and configure the frontend to call the proxy instead of OpenAI directly.

Prompt & design notes
- The app instructs the model to reply in a strict JSON format so the frontend can parse results reliably.
- Explanations are simple and non-judgmental by design.

License & notes
- This is a small demo; if you want, I can add a server proxy example, tests, or help deploy it.

Enjoy! 😄