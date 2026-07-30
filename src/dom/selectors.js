/**
 * Default element IDs and data-attribute names the binder looks for.
 * All are overridable via config, e.g. `Calculator.init({ selectors: { display: 'my-display' } })`.
 */
export const DEFAULT_SELECTORS = {
  display: 'display',
  equals: 'equals',
  clear: 'clear',
  clearEntry: 'clear-entry',
  backspace: 'backspace',
  toggleSign: 'toggle-sign',
  copy: 'copy'
};

export const DEFAULT_ATTRIBUTES = {
  value: 'data-value', // digits, operators, decimal point, parentheses
  action: 'data-action', // 'equals' | 'clear' | 'clear-entry' | 'backspace' | 'toggle-sign' | 'copy'
  function: 'data-function' // 'sin' | 'cos' | 'tan' | 'sqrt' | 'log' | 'ln' | 'square' | 'power' | 'factorial' | 'pi' | 'e'
};
