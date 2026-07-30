// Type declarations for calc-engine

export type AngleMode = 'deg' | 'rad';

export interface CalculatorErrorObject {
  code: string;
  message: string;
  details?: unknown;
}

export interface CalculatorSelectors {
  display?: string;
  equals?: string;
  clear?: string;
  clearEntry?: string;
  backspace?: string;
  toggleSign?: string;
  copy?: string;
}

export interface CalculatorAttributes {
  value?: string; // default: 'data-value'
  action?: string; // default: 'data-action'
  function?: string; // default: 'data-function'
}

export interface CalculatorConfig {
  angleMode?: AngleMode;
  keyboardEnabled?: boolean;
  autoInit?: boolean;
  precision?: number; // 0-15
  root?: Document | Element | null;
  selectors?: CalculatorSelectors;
  attributes?: CalculatorAttributes;
  onUpdate?: (instance: CalculatorInstance) => void;
}

export interface InitResult {
  warnings: CalculatorErrorObject[];
}

export declare class CalculatorEngine {
  constructor(options?: { precision?: number; angleMode?: AngleMode });
  context: {
    functions: Record<string, (...args: number[]) => number>;
    constants: Record<string, number>;
  };
  lastError: CalculatorErrorObject | null;
  input(value: string): string;
  backspace(): string;
  clear(): string;
  clearEntry(): string;
  toggleSign(): string;
  calculate(): number | CalculatorErrorObject;
  getResult(): number;
  getExpression(): string;
  getDisplayValue(): string;
  registerFunction(name: string, fn: (...args: number[]) => number): void;
  registerConstant(name: string, value: number): void;
  setAngleMode(mode: AngleMode): void;
  getAngleMode(): AngleMode;
}

export declare class CalculatorInstance {
  constructor(config?: CalculatorConfig);
  engine: CalculatorEngine;
  init(): InitResult;
  destroy(): void;
  calculate(expression?: string): number | CalculatorErrorObject;
  clear(): string;
  clearEntry(): string;
  backspace(): string;
  input(value: string): string;
  toggleSign(): string;
  getResult(): number;
  getExpression(): string;
  getLastError(): CalculatorErrorObject | null;
  setAngleMode(mode: AngleMode): void;
  getAngleMode(): AngleMode;
  registerFunction(name: string, fn: (...args: number[]) => number): void;
  registerConstant(name: string, value: number): void;
  enableKeyboard(): void;
  disableKeyboard(): void;
  isKeyboardEnabled(): boolean;
  copyResult(): Promise<boolean>;
}

export interface CalculatorStatic {
  version: string;
  CalculatorEngine: typeof CalculatorEngine;
  CalculatorInstance: typeof CalculatorInstance;
  evaluateExpression(
    expression: string,
    context?: { functions?: Record<string, Function>; constants?: Record<string, number> }
  ): number;

  create(config?: CalculatorConfig): CalculatorInstance;

  // Singleton convenience API — delegates to one lazily-created default instance
  init(config?: CalculatorConfig): InitResult;
  destroy(): void;
  calculate(expression?: string): number | CalculatorErrorObject;
  clear(): string;
  clearEntry(): string;
  backspace(): string;
  input(value: string): string;
  toggleSign(): string;
  getResult(): number;
  getExpression(): string;
  copyResult(): Promise<boolean>;
  setAngleMode(mode: AngleMode): void;
  getAngleMode(): AngleMode;
  enableKeyboard(): void;
  disableKeyboard(): void;
  registerFunction(name: string, fn: (...args: number[]) => number): void;
  registerConstant(name: string, value: number): void;
}

declare const Calculator: CalculatorStatic;
export default Calculator;
