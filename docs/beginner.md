# calc-engine — Beginner Guide

This guide is for anyone who wants to add a working calculator to a
webpage **without writing any calculator logic themselves**. If you can
write basic HTML, you can use this library.

**Always use `<div>` tag to take or Show the output**

You will:
1. Add one `<script>` tag.
2. Write plain HTML for your buttons and a display.
3. Call one function: `Calculator.init()`.

That's it. Addition, subtraction, scientific functions, keyboard support,
copy-to-clipboard — all of it is already built. You never write `if`
statements or math code.

---

## 1. Installation

The easiest way to start is the CDN — no downloads, no build tools, no
`npm`. Add this one line near the bottom of your HTML file, just before
`</body>`:

```html
<script src="https://unpkg.com/calc-engine/dist/calc-engine.umd.min.js"></script>
```

That's the entire installation. It gives your page a global `Calculator`
object you can use right away.

> If you're using a tool like Vite, Create React App, or a build system,
> see `docs/developer.md` instead — that guide covers `npm install` and
> framework integration.

---

## 2. HTML setup

Your job is to write normal HTML for the buttons and a place to show the
result. The library reads two things off your HTML:

- **IDs** — for one-off elements like the display and the equals button.
- **`data-*` attributes** — for the number/operator buttons.

Here's the smallest possible working calculator:

```html
<div id="display">0</div>

<button data-value="7">7</button>
<button data-value="8">8</button>
<button data-value="9">9</button>
<button data-value="+">+</button>

<button data-value="4">4</button>
<button data-value="5">5</button>
<button data-value="6">6</button>
<button data-value="-">-</button>

<button data-value="1">1</button>
<button data-value="2">2</button>
<button data-value="3">3</button>
<button data-value="*">×</button>

<button data-value="0">0</button>
<button data-value=".">.</button>
<button id="equals">=</button>
<button data-value="/">÷</button>

<button id="clear">C</button>
<button id="backspace">⌫</button>

<script src="https://unpkg.com/calc-engine/dist/calc-engine.umd.min.js"></script>
<script>
  Calculator.init();
</script>
```

Style it however you like with your own CSS — the library never touches
your styling, colors, fonts, or layout. It only listens for clicks.

---

## 3. Required IDs

These IDs are optional individually (the calculator still works if you
skip one — you'll just be missing that button), but each one that exists
must use exactly this spelling:

| ID | What it does |
|---|---|
| `id="display"` | Where the current expression/result is shown |
| `id="equals"` | Evaluates the expression (the `=` button) |
| `id="clear"` | Clears everything (the `C` button) |
| `id="backspace"` | Deletes the last character typed |
| `id="clear-entry"` | Clears just the number currently being typed (`CE`) |
| `id="toggle-sign"` | Flips the sign of the current number (`±`) |
| `id="copy"` | Copies the current result to the clipboard |

If you forget `id="display"`, the calculator still calculates correctly
in the background — you just won't see any output on the page. The
browser console will print a friendly warning telling you exactly what's
missing.

---

## 4. Data attributes

Every other button (digits, operators, decimal point, parentheses) uses
`data-value`:

```html
<button data-value="7">7</button>
<button data-value="+">+</button>
<button data-value="(">(</button>
```

`data-value` accepts: `0-9`, `.`, `+`, `-`, `*`, `/`, `^`, `%`, `(`, `)`.

Scientific buttons use `data-function` instead:

```html
<button data-function="sin">sin</button>
<button data-function="sqrt">√</button>
```

For actions that don't need a fixed ID (say you want three "clear"
buttons in different spots), use `data-action` instead of `id`:

```html
<button data-action="clear">Clear everything</button>
<button data-action="clear-entry">Clear this number</button>
```

---

## 5. Button mapping

### Basic buttons (`data-value`)

| `data-value` | Meaning |
|---|---|
| `0`–`9` | Digits |
| `.` | Decimal point |
| `+` `-` `*` `/` | Add, subtract, multiply, divide |
| `(` `)` | Parentheses |
| `%` | Percent |

### Action buttons (`id` or `data-action`)

| Name | Button label suggestion |
|---|---|
| `equals` | `=` |
| `clear` | `C` |
| `clear-entry` | `CE` |
| `backspace` | `⌫` |
| `toggle-sign` | `±` |
| `copy` | `Copy` |

### Scientific buttons (`data-function`)

| `data-function` | Meaning |
|---|---|
| `sin`, `cos`, `tan` | Trigonometric functions |
| `sqrt` | Square root (√) |
| `square` | x² |
| `power` | xʸ (type the base, tap this, then the exponent) |
| `factorial` | n! |
| `log` | Base-10 logarithm |
| `ln` | Natural logarithm |
| `pi` | Inserts π |
| `e` | Inserts Euler's number |

---

## 6. Examples

### Toggling degrees/radians

There's no built-in button ID for this (since it's just a label you're
showing, not a calculation), but it's two lines:

```html
<button id="mode-btn">DEG</button>
<script>
  Calculator.init();
  document.getElementById('mode-btn').addEventListener('click', () => {
    const next = Calculator.getAngleMode() === 'deg' ? 'rad' : 'deg';
    Calculator.setAngleMode(next);
    document.getElementById('mode-btn').textContent = next.toUpperCase();
  });
</script>
```

### A full working example

See `examples/plain-html/index.html` in this project for a complete,
styled calculator with all basic and scientific buttons wired up — copy
it as a starting point.

---

## 7. Troubleshooting

**Nothing happens when I click buttons.**
Open your browser's developer console (F12 → Console tab). If you see a
warning like `No element found with id="display"`, that tells you
exactly which ID is missing or misspelled. Double-check spelling and
that `Calculator.init()` runs *after* your HTML (put your `<script>` tag
at the end of `<body>`, or after the buttons).

**The display shows nothing after I click a number.**
Make sure you have `id="display"` on the element you want text to
appear in, spelled exactly that way.

**I see "Unable to copy to clipboard".**
The Copy button needs either a secure context (`https://`, or
`localhost` during development) or a fallback that most browsers support
automatically. If you're testing via `file://`, some browsers block
clipboard access entirely — try a local server instead.

**Numbers look wrong, like `0.30000000000000004`.**
This shouldn't happen — the library rounds results to avoid classic
floating-point display bugs. If you see this, please file an issue.

**My scientific functions give weird results.**
Check your angle mode — `sin(90)` gives `1` in degree mode (the default)
but a different number in radian mode. Call `Calculator.getAngleMode()`
in the console to check which mode you're in.

---

## 8. Frequently Asked Questions

**Do I need to know JavaScript?**
Only enough to add one `<script>` tag and, optionally, `Calculator.init()`
on the next line. Everything else is HTML.

**Can I style the buttons however I want?**
Yes, completely. The library only cares about `id`/`data-*` attributes,
never your CSS, class names, or layout.

**What if I only want some features, like no scientific buttons?**
Just don't add those buttons to your HTML. The library only wires up
elements that actually exist on the page.

**Does it work on mobile?**
Yes — it's just click/tap event listeners, which work the same on touch
devices.

**Can I have more than one calculator on the same page?**
Yes, but that needs a little JavaScript — see the "React/Vue/Angular
integration" and "multiple instances" sections in `docs/developer.md`.

**Is there a memory (M+, M-, MR, MC) feature?**
Not in this version.

**Does it support keyboard typing, like pressing number keys?**
Yes, automatically, once you call `Calculator.init()`. Numbers, `+ - * /`,
Enter (=), Escape (clear), Delete (clear entry), and Backspace all work.
