# Plain HTML example

A complete calculator UI with **zero calculator logic** — `index.html` is
just markup with `id`/`data-*` attributes, and `script.js` is three lines
that call the library.

## Running it

Browsers block native ES module imports over `file://` for security reasons,
so you need a tiny local server (any of these work):

```bash
# from this examples/plain-html/ folder
npx serve .
# or
python3 -m http.server 8000
```

Then open the printed URL in your browser.

This example imports directly from `../../src/index.js` so you can try it
immediately with no build step. In a real project, swap that import line
for either:

- **npm**: `import Calculator from 'calc-engine';`
- **CDN**: `<script src="https://unpkg.com/calc-engine/dist/calc-engine.umd.min.js"></script>`
  (exposes a global `Calculator`, no import statement needed)

See `docs/developer.md` for the full installation reference.
