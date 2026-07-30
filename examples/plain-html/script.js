import Calculator from '../../src/index.js';

// This is the entire integration. init() finds every id/data-* element in
// index.html and wires it up automatically.
Calculator.init();

// The one piece of UI that isn't a standard id/data-attribute the binder
// recognizes is the "DEG/RAD" label toggle — that's presentation, not
// calculator logic, so it's a few lines of ordinary UI code calling the
// public API (setAngleMode/getAngleMode), same as any other app would.
const toggle = document.getElementById('angle-mode-toggle');
toggle.addEventListener('click', () => {
  const next = Calculator.getAngleMode() === 'deg' ? 'rad' : 'deg';
  Calculator.setAngleMode(next);
  toggle.textContent = next.toUpperCase();
});

// The "Copy" button (id="copy") is already wired automatically by init()
// via the DOM binder — no extra code needed for it.
