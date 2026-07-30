import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

const banner = `/*!
 * calc-engine v${process.env.npm_package_version || '1.0.0'}
 * (c) ${new Date().getFullYear()}
 * Released under the MIT License
 */`;

const input = 'src/index.js';
const umdInput = 'src/index.umd.js';
const name = 'Calculator'; // global var exposed in UMD builds, e.g. window.Calculator

export default [
  // ESM — for bundlers (Vite, Next.js, Webpack, Rollup)
  {
    input,
    output: {
      file: 'dist/calc-engine.esm.js',
      format: 'es',
      banner,
      sourcemap: true
    },
    plugins: [resolve()]
  },

  // CommonJS — for Node.js / require()
  {
    input,
    output: {
      file: 'dist/calc-engine.cjs',
      format: 'cjs',
      exports: 'named',
      banner,
      sourcemap: true
    },
    plugins: [resolve()]
  },

  // UMD — for plain <script> tags, works with AMD/CommonJS/global
  {
    input: umdInput,
    output: {
      file: 'dist/calc-engine.umd.js',
      format: 'umd',
      name,
      exports: 'default',
      banner,
      sourcemap: true
    },
    plugins: [resolve()]
  },

  // UMD minified — for CDN use (jsDelivr / UNPKG)
  {
    input: umdInput,
    output: {
      file: 'dist/calc-engine.umd.min.js',
      format: 'umd',
      name,
      exports: 'default',
      sourcemap: true
    },
    plugins: [resolve(), terser()]
  }
];
