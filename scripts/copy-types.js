// Copies the hand-written TypeScript declarations into dist/types/ after
// the Rollup build. A plain Node script (not `cp`/`mkdir -p`) so `npm run
// build` works identically on Windows, macOS, and Linux without extra
// dependencies like `shx`.
import { mkdirSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const src = join(root, 'src', 'types', 'index.d.ts');
const destDir = join(root, 'dist', 'types');
const dest = join(destDir, 'index.d.ts');

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);

console.log('Copied src/types/index.d.ts -> dist/types/index.d.ts');
