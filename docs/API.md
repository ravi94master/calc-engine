
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
