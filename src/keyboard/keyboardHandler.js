// Keys that map directly to a raw character passed through to engine.input().
const PASSTHROUGH_KEYS = new Set([
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '.', '+', '-', '*', '/', '^', '%', '(', ')'
]);

/**
 * Creates a togglable keyboard handler bound to a CalculatorEngine.
 * Listens on `target` (defaults to `document`) so it works regardless of
 * which element currently has focus — matching how physical/software
 * calculators normally behave.
 *
 * @param {import('../core/engine.js').CalculatorEngine} engine
 * @param {{ onUpdate?: () => void, target?: EventTarget }} [options]
 */
export function createKeyboardHandler(engine, options = {}) {
  const target = options.target || (typeof document !== 'undefined' ? document : null);
  const onUpdate = typeof options.onUpdate === 'function' ? options.onUpdate : () => {};

  let enabled = false;

  function handleKeydown(event) {
    const key = event.key;

    if (PASSTHROUGH_KEYS.has(key)) {
      engine.input(key);
      onUpdate();
      event.preventDefault();
      return;
    }

    switch (key) {
      case 'Enter':
      case '=':
        engine.calculate();
        onUpdate();
        event.preventDefault();
        break;
      case 'Escape':
        engine.clear();
        onUpdate();
        event.preventDefault();
        break;
      case 'Delete':
        engine.clearEntry();
        onUpdate();
        event.preventDefault();
        break;
      case 'Backspace':
        engine.backspace();
        onUpdate();
        event.preventDefault();
        break;
      default:
        // Unrecognized key — ignore, let the browser handle it normally.
        break;
    }
  }

  return {
    enable() {
      if (enabled || !target) return;
      target.addEventListener('keydown', handleKeydown);
      enabled = true;
    },
    disable() {
      if (!enabled || !target) return;
      target.removeEventListener('keydown', handleKeydown);
      enabled = false;
    },
    isEnabled() {
      return enabled;
    }
  };
}
