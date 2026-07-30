# Changelog

All notable changes to this project are documented here.
This project follows [Semantic Versioning](https://semver.org/).

## [1.0.0] — Initial release

### Added
- Core calculation engine with a secure recursive-descent expression
  parser — never uses `eval()` or `new Function()`.
- Basic calculator: addition, subtraction, multiplication, division,
  decimals, parentheses, operator precedence, percentage, sign toggle,
  backspace, clear, clear-entry, and continuous (chained) calculation.
- Scientific functions: square root, sin/cos/tan, base-10 log, natural
  log, π, e, and configurable degree/radian mode. x², xʸ, and n! are
  expressed via the existing power (`^`) and factorial (`!`) operators
  rather than as separate functions.
- Zero-DOM-dependency core — works identically in vanilla JS, React,
  Vue, Angular, Vite, and Next.js.
- DOM binding layer: automatic wiring via `id`/`data-value`/
  `data-action`/`data-function` attributes, with graceful (non-fatal)
  handling of missing elements.
- Togglable keyboard shortcuts (digits, operators, Enter, Escape,
  Delete, Backspace, decimal point).
- Clipboard copy with Clipboard API + `execCommand` fallback.
- Full public API: singleton convenience methods (`Calculator.init()`,
  `.calculate()`, etc.) plus `Calculator.create()` for independent,
  isolated instances (multi-instance / framework use).
- Typed, developer-friendly errors (`{ code, message }`) for every
  documented failure mode — division by zero, invalid expressions/
  parentheses, invalid log/sqrt domains, factorial overflow, unknown
  functions, Infinity/NaN results, missing elements, invalid config.
- TypeScript declarations.
- ESM, CommonJS, UMD, and minified UMD build targets via Rollup.
- Jest test suite covering the parser, engine, scientific functions,
  DOM binder, keyboard, clipboard, error handling, and edge cases.

### Not included in this version
- Memory functions (MC/MR/M+/M−) and calculation history — out of scope
  for this release.
- Advanced scientific functions (sinh/cosh/tanh, inverse trig, cube
  root, log base 2, exponential, random, graphing, symbolic math).
