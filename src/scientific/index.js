import { AngleMode } from './angleMode.js';
import { createTrigFunctions } from './trigonometry.js';
import { sqrt, log10, ln } from './functions.js';
import { CONSTANTS } from './constants.js';

/**
 * Installs the scientific feature set (√, sin/cos/tan, log, ln, π, e,
 * deg/rad mode) onto a CalculatorEngine instance by populating its
 * `context.functions` / `context.constants` registries.
 *
 * Deliberately NOT included, per spec: sinh/cosh/tanh, inverse trig,
 * cube root, log base 2, exponential (exp), random, graphing, symbolic math.
 * (x² and xʸ are not separate functions — they're handled by the `^`
 * power operator already implemented in the core parser: x² is `x^2`,
 * xʸ is `x^y`. Same for n!, which is the postfix `!` operator.)
 *
 * @param {import('../core/engine.js').CalculatorEngine} engine
 * @param {{ angleMode?: 'deg'|'rad' }} [options]
 */
export function installScientificFunctions(engine, options = {}) {
  const angleMode = new AngleMode(options.angleMode || 'deg');
  const trig = createTrigFunctions(angleMode);

  engine._angleMode = angleMode; // internal handle; engine exposes it via setAngleMode/getAngleMode

  engine.registerFunction('sin', trig.sin);
  engine.registerFunction('cos', trig.cos);
  engine.registerFunction('tan', trig.tan);
  engine.registerFunction('sqrt', sqrt);
  engine.registerFunction('log', log10);
  engine.registerFunction('ln', ln);

  engine.registerConstant('pi', CONSTANTS.pi);
  engine.registerConstant('e', CONSTANTS.e);
}
