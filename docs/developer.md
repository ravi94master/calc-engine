# calc-engine — Developer Guide

Full API reference and integration guide for calc-engine: a framework-
agnostic calculator engine you drop into vanilla JS, React, Vue, Angular,
Vite, or Next.js. The core (parser + engine) has zero DOM dependency —
everything else is a thin, optional layer on top of it.

## Table of contents

- [Installation](#installation)
- [Framework integration](#framework-integration)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Events](#events)
- [Error Codes](#error-codes)
- [TypeScript support](#typescript-support)
- [Browser compatibility](#browser-compatibility)
- [Performance tips](#performance-tips)
- [Contributing](#contributing)

---

## Installation

### npm

```bash
npm install calc-engine
```

```js
import Calculator from 'calc-engine';

Calculator.init();
```

CommonJS also works:

```js
const Calculator = require('calc-engine');
```

### CDN

```html
<!-- jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/calc-engine/dist/calc-engine.umd.min.js"></script>

<!-- UNPKG -->
<script src="https://unpkg.com/calc-engine/dist/calc-engine.umd.min.js"></script>
```

Both expose a global `Calculator` object — no bundler needed.

---

## Framework integration

The singleton API (`Calculator.init()`) is meant for plain HTML pages
with global, page-wide `id`s. In a component-based framework you almost
always want an **isolated instance** instead, scoped to that component's
own DOM subtree, so multiple mounted calculators (or fast-refresh /
strict-mode remounts) don't collide. Use `Calculator.create(config)` for
that — it returns a `CalculatorInstance` with its own engine, DOM
binder, and keyboard listener.

### React

```jsx
import { useEffect, useRef } from 'react';
import Calculator from 'calc-engine';

function CalculatorWidget() {
  const rootRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    instanceRef.current = Calculator.create({ root: rootRef.current });
    return () => instanceRef.current.destroy();
  }, []);

  return (
    <div ref={rootRef}>
      <div id="display">0</div>
      <button data-value="7">7</button>
      <button data-value="+">+</button>
      <button data-value="3">3</button>
      <button id="equals">=</button>
    </div>
  );
}
```

`root` scopes the instance's `querySelectorAll`/id lookups to that
subtree, so `id="display"` only needs to be unique *within* the
component, not page-wide — safe for multiple instances on one page.

### Vue

```vue
<template>
  <div ref="root">
    <div id="display">0</div>
    <button data-value="7">7</button>
    <button data-value="+">+</button>
    <button data-value="3">3</button>
    <button id="equals">=</button>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import Calculator from 'calc-engine';

const root = ref(null);
let instance;

onMounted(() => { instance = Calculator.create({ root: root.value }); });
onBeforeUnmount(() => instance.destroy());
</script>
```

### Angular

```ts
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import Calculator, { CalculatorInstance } from 'calc-engine';

@Component({
  selector: 'app-calculator',
  template: `
    <div #root>
      <div id="display">0</div>
      <button data-value="7">7</button>
      <button data-value="+">+</button>
      <button data-value="3">3</button>
      <button id="equals">=</button>
    </div>
  `
})
export class CalculatorComponent implements OnInit, OnDestroy {
  @ViewChild('root') root!: ElementRef<HTMLElement>;
  private instance!: CalculatorInstance;

  ngOnInit() {
    this.instance = Calculator.create({ root: this.root.nativeElement });
  }
  ngOnDestroy() {
    this.instance.destroy();
  }
}
```

### Vite / Next.js

Both are just bundlers/frameworks sitting on top of the same npm package
— use the React/Vue examples above directly. For Next.js, wrap the
component with `'use client'` (or place it in a client component) since
it touches `document`.

---

## API Reference

Every method below exists **both** as `Calculator.methodName(...)`
(the default singleton) and as `instance.methodName(...)` on any object
returned by `Calculator.create(config)` — same behavior, just scoped to
that instance.

| Method | Description |
|---|---|
| `Calculator.init(config?)` | Wires the singleton to the DOM. Returns `{ warnings }`. |
| `Calculator.destroy()` | Tears down the singleton's listeners. |
| `Calculator.create(config?)` | Returns an independent `CalculatorInstance`. |
| `Calculator.calculate(expr?)` | Evaluates the current (or given) expression. Returns a number, or a `CalculatorError` object on failure. |
| `Calculator.clear()` | Full reset (like the `C` button). |
| `Calculator.clearEntry()` | Clears only the number being typed. |
| `Calculator.backspace()` | Deletes the last character. |
| `Calculator.input(value)` | Appends a raw character/fragment (digit, operator, `sin(`, etc). |
| `Calculator.toggleSign()` | Flips the sign of the current number (±). |
| `Calculator.getResult()` | Returns the last computed numeric result. |
| `Calculator.getExpression()` | Returns the current expression string. |
| `Calculator.copyResult()` | `Promise<boolean>` — copies the result to the clipboard. |
| `Calculator.setAngleMode(mode)` | `'deg'` or `'rad'`. Takes effect immediately. |
| `Calculator.getAngleMode()` | Returns the current angle mode. |
| `Calculator.enableKeyboard()` / `.disableKeyboard()` | Toggles keyboard shortcuts. |
| `Calculator.registerFunction(name, fn)` | Adds a custom function usable in expressions, e.g. `myFn(3)`. |
| `Calculator.registerConstant(name, value)` | Adds a custom named constant. |

### Lower-level building blocks

If you don't want the full DOM-bound experience, these are independently
usable and exported too:

```js
import { CalculatorEngine, evaluateExpression } from 'calc-engine';

// Pure math, no DOM at all:
evaluateExpression('sqrt(16)+2^3'); // 12

// Stateful engine (input buffer, backspace, etc.) with zero DOM:
const engine = new CalculatorEngine({ precision: 6, angleMode: 'rad' });
engine.input('12+3');
engine.calculate(); // 15
```

---

## Configuration

Passed to `Calculator.init(config)` or `Calculator.create(config)`:

```js
Calculator.init({
  angleMode: 'deg',        // 'deg' | 'rad' — default 'deg'
  keyboardEnabled: true,   // default true
  autoInit: true,          // default true — see note below
  precision: 10,           // decimal places, 0-15 — default 10
  root: document,          // DOM scope to search within — default document
  selectors: {             // override any default id
    display: 'my-display',
    equals: 'my-equals'
  },
  attributes: {             // override any default data-attribute name
    value: 'data-key'
  },
  onUpdate: (instance) => { /* fires after every state-changing action */ }
});
```

**`autoInit`** only matters for `Calculator.create()` / `new CalculatorInstance()`:
when `true` (default), the instance wires itself to the DOM immediately
in the constructor. Set it to `false` if you want to build the instance
first and call `.init()` yourself later (or never — it still works as a
pure calculation engine either way).

Invalid config values (`angleMode: 'sideways'`, `precision: -1`, etc.)
throw a `CalculatorException` synchronously, at setup time — this is
the one place the library throws instead of returning a typed error,
since a bad config is a programmer mistake, not a runtime calculation
failure.

---

## Events

calc-engine doesn't ship a separate pub/sub event emitter — deliberately,
to avoid two competing ways to react to the same state change. Instead,
there's one hook: **`onUpdate`**, fired after every state-changing action
(button click, keyboard input, `calculate()`, etc.) with the instance
itself:

```js
Calculator.init({
  onUpdate(instance) {
    console.log('expression:', instance.getExpression());
    console.log('last error:', instance.getLastError()); // null if none
  }
});
```

This one hook covers the same ground a `change`/`calculate`/`error`
event trio would, without needing three separate listener registrations
— check `instance.getLastError()` inside the callback if you specifically
care about failures.

---

## Error Codes

`calculate()` never throws — it returns a plain object
`{ code, message }` on failure. Branch on `code`, not `message` (message
text may be reworded over time; `code` is stable).

| Code | Meaning |
|---|---|
| `DIVISION_BY_ZERO` | Division by zero |
| `INVALID_EXPRESSION` | Malformed expression the parser couldn't make sense of |
| `INVALID_PARENTHESES` | Unbalanced `(` / `)` |
| `INVALID_CHARACTER` | Unsupported character in the input |
| `INVALID_NUMBER` | Malformed number literal |
| `INVALID_LOG` | `log()`/`ln()` called with a non-positive argument |
| `INVALID_SQRT` | `sqrt()` called with a negative argument |
| `FACTORIAL_INVALID` | `!` used on a negative or non-integer value |
| `FACTORIAL_OVERFLOW` | Factorial argument too large (> 170) |
| `UNKNOWN_FUNCTION` | Unrecognized function/constant name |
| `RESULT_INFINITY` | Result overflowed to Infinity |
| `RESULT_NAN` | Result is not a valid number |
| `MISSING_ELEMENT` | An expected DOM element wasn't found (returned as a warning, not thrown) |
| `INVALID_CONFIG` | Bad configuration passed to `init()`/`create()` (thrown, not returned) |
| `EMPTY_EXPRESSION` | Nothing to calculate |
| `CLIPBOARD_ERROR` | Both the Clipboard API and the `execCommand` fallback failed |

---

## TypeScript support

Full type declarations ship in `dist/types/index.d.ts` and are picked up
automatically:

```ts
import Calculator, { CalculatorInstance, CalculatorConfig } from 'calc-engine';

const config: CalculatorConfig = { angleMode: 'rad', precision: 6 };
const instance: CalculatorInstance = Calculator.create(config);
```

`calculate()` returns `number | CalculatorErrorObject` — narrow it with
a type guard if you need to:

```ts
const result = Calculator.calculate('5/0');
if (typeof result === 'number') {
  // success
} else {
  console.error(result.code, result.message);
}
```

---

## Browser compatibility

The library targets modern evergreen browsers (native ES modules,
`Promise`, optional-chaining-free syntax kept intentionally simple for
broad support):

| Browser | Supported |
|---|---|
| Chrome / Edge | last 2 versions |
| Firefox | last 2 versions |
| Safari | last 2 versions |
| iOS Safari / Chrome Android | current |
| Internet Explorer 11 | ✗ not supported |

The Clipboard API (`copyResult()`) requires a secure context (`https://`
or `localhost`); it falls back to `execCommand('copy')` automatically
where the modern API is unavailable.

---

## Performance tips

- **Reuse instances.** Creating a `CalculatorInstance` does a DOM query
  pass; don't recreate one on every render in React — create it once in
  `useEffect` (see the example above) and reuse it.
- **`registerFunction`/`registerConstant` once**, not per calculation —
  they mutate the engine's registry, so call them at setup time.
- **`precision`** trades accuracy for cheaper string formatting on every
  keystroke; the default (`10`) is a reasonable middle ground. Lower it
  if you're rendering a display that updates on every single keypress
  in a performance-sensitive UI.
- The parser/evaluator are pure functions with no caching — for a plain
  calculator UI this is unmeasurable, but if you're calling
  `evaluateExpression()` in a hot loop (e.g. a spreadsheet-like tool),
  memoize on the expression string yourself.

---

## Contributing

1. Fork the repo and clone it locally.
2. `npm install`
3. `npm test` — please add/update tests for any behavior change.
4. `npm run lint` — the `no-eval`/`no-implied-eval`/`no-new-func` rules
   are enforced; the parser must never use `eval()` or `new Function()`.
5. Open a PR with a clear description of the change and why.

Bug reports and feature requests are welcome via GitHub Issues. For
anything touching the parser or evaluator, please include a few example
expressions and their expected results in the PR description.
