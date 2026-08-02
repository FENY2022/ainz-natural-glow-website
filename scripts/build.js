const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'dist');
const files = ['index.html', 'styles.css', 'app.js', 'assets'];

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const file of files) {
  fs.cpSync(path.join(root, file), path.join(outDir, file), { recursive: true });
}

console.log('Static website built to dist');
