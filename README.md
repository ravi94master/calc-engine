# calc-engine

A framework-agnostic JavaScript calculator engine. Bring your own HTML/CSS UI —
the library handles 100% of the calculator logic. No `eval()`, ever.

> **Status:** All 7 phases complete — core engine, parser, scientific
> functions, DOM binding, keyboard/clipboard, the full public API, a Jest
> test suite, and documentation. See `docs/beginner.md` if you're new to
> JS, or `docs/developer.md` for the full API reference and framework
> integration guides.

## Quick start

```html
<div id="display">0</div>
<button data-value="7">7</button>
<button data-value="+">+</button>
<button data-value="3">3</button>
<button id="equals">=</button>

<script src="https://unpkg.com/calc-engine/dist/calc-engine.umd.min.js"></script>
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
- [`docs/developer.md`](docs/developer.md) — npm/CDN install, React/Vue/Angular integration, full API reference, config, error codes, TypeScript



## Project structure

```
calc-engine/
├── src/
│   ├── core/         # Calculator state machine, calculation engine
│   ├── parser/        # Tokenizer + recursive-descent parser + AST evaluator (no eval())
│   ├── scientific/    # √, x², xʸ, n!, sin/cos/tan, log, ln, π, e, deg/rad mode
│   ├── keyboard/      # Keyboard shortcut binding (togglable)
│   ├── clipboard/      # Copy-to-clipboard with fallback
│   ├── errors/        # Typed error objects + error messages
│   ├── utils/         # Shared helper functions
│   ├── types/         # TypeScript declarations
│   └── index.js       # Public entry point — assembles the Calculator object
├── examples/          # Plain HTML, React, Vue, Angular usage examples
├── test/              # Jest test suites (one per module)
├── docs/               # Beginner and developer documentation
├── dist/               # Build output (ESM, CJS, UMD, minified) — generated, not committed
├── rollup.config.js
├── babel.config.js
├── jest.config.js
└── package.json
```

## Design principles

- **Zero DOM dependency in `core/`.** The calculation engine knows nothing
  about the DOM, so it works identically in vanilla JS, React, Vue, Angular,
  or Node.
- **No `eval()`, ever.** Expressions are parsed into an AST via a
  recursive-descent parser and evaluated manually. This is enforced by
  `no-eval` / `no-implied-eval` / `no-new-func` ESLint rules.
- **Typed errors, not thrown strings.** Every failure mode returns a
  `{ code, message }` object so consuming apps can branch on `code`.

## Scripts

| Command | Purpose |
|---|---|
| `npm run build` | Builds ESM, CJS, UMD, and minified UMD bundles to `dist/` |
| `npm run dev` | Builds in watch mode |
| `npm test` | Runs the Jest test suite with coverage |
| `npm run lint` | Lints `src/` |

## License

MIT
