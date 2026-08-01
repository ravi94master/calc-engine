# calc-engine

A framework-agnostic JavaScript calculator engine. Bring your own HTML/CSS UI —
the library handles 100% of the calculator logic. No `eval()`, ever.


## Quick start

```html
<div id="display">0</div>
<button data-value="7">7</button>
<button data-value="+">+</button>
<button data-value="3">3</button>
<button id="equals">=</button>

<script src="https://cdn.jsdelivr.net/gh/ravi94master/calc-engine@main/calc-engine.umd.min.js"></script>

<script>Calculator.init();</script>
```

A full styled example lives in `examples/plain-html/`.

## Features

- Basic calculator: `+ - * /`, decimals, parentheses, precedence, `%`, `±`, backspace, clear, CE, continuous calculation
- Scientific: `√ x² xʸ n! sin cos tan log ln π e`, degree/radian mode
- Secure recursive-descent expression parser — never uses `eval()`
- Zero-DOM-dependency core, usable identically in vanilla JS, React, Vue, Angular, Vite, Next.js
- Keyboard shortcuts (togglable) and clipboard copy with fallback
- Typed, developer-friendly errors (`{ code, message }`) for every failure mode
- TypeScript declarations included
- ESM, CommonJS, UMD, and minified UMD builds

## Documentation

- [`docs/beginner.md`](docs/beginner.md) — HTML setup, required IDs/attributes, troubleshooting, FAQ




## Design principles

- **Zero DOM dependency in `core/`.** The calculation engine knows nothing
  about the DOM, so it works identically in vanilla JS, React, Vue, Angular,
  or Node.
- **No `eval()`, ever.** Expressions are parsed into an AST via a
  recursive-descent parser and evaluated manually. This is enforced by
  `no-eval` / `no-implied-eval` / `no-new-func` ESLint rules.
- **Typed errors, not thrown strings.** Every failure mode returns a
  `{ code, message }` object so consuming apps can branch on `code`.


## License

MIT
"# calc-engine" 
