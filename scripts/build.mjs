import { promises as fs } from 'fs';
import path from 'path';
import { transform } from 'esbuild';
import { minify as minifyHtml } from 'html-minifier-terser';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'dist');

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (full.includes(path.sep + 'dist' + path.sep)) continue;
    if (e.isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

function outPath(srcPath) {
  const rel = path.relative(ROOT, srcPath);
  return path.join(OUT_DIR, rel);
}

async function copyFile(src, dest) {
  await ensureDir(path.dirname(dest));
  await fs.copyFile(src, dest);
}

async function processCss(src, dest) {
  const code = await fs.readFile(src, 'utf8');
  const result = await transform(code, { loader: 'css', minify: true });
  await ensureDir(path.dirname(dest));
  await fs.writeFile(dest, result.code, 'utf8');
}

async function processJs(src, dest) {
  const code = await fs.readFile(src, 'utf8');
  const result = await transform(code, { loader: 'js', minify: true, target: 'es2019' });
  await ensureDir(path.dirname(dest));
  await fs.writeFile(dest, result.code, 'utf8');
}

async function processHtml(src, dest) {
  const code = await fs.readFile(src, 'utf8');
  const result = await minifyHtml(code, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true
  });
  await ensureDir(path.dirname(dest));
  await fs.writeFile(dest, result, 'utf8');
}

async function build() {
  await fs.rm(OUT_DIR, { recursive: true, force: true });
  for await (const file of walk(ROOT)) {
    const ext = path.extname(file).toLowerCase();
    const dest = outPath(file);
    // Skip node_modules, .git and workflow output dirs
    if (file.includes(path.sep + 'node_modules' + path.sep)) continue;
    if (file.includes(path.sep + '.git' + path.sep)) continue;
    if (file.includes(path.sep + '.github' + path.sep)) continue;
    if (file.endsWith(path.sep + 'README.md')) continue;
    switch (ext) {
      case '.css':
        await processCss(file, dest);
        break;
      case '.js':
        await processJs(file, dest);
        break;
      case '.html':
        await processHtml(file, dest);
        break;
      default:
        await copyFile(file, dest);
        break;
    }
  }
  console.log('Build concluído em:', OUT_DIR);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
