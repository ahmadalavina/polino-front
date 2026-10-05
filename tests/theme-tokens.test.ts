import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const globalsPath = new URL('../src/app/globals.css', import.meta.url);
const layoutPath = new URL('../src/app/layout.tsx', import.meta.url);
const themeStorePath = new URL('../src/store/themeStore.ts', import.meta.url);

test('palette defines semantic tokens for light and dark', async () => {
  const css = await readFile(globalsPath, 'utf8');
  assert.match(css, /--color-brand:/);
  assert.match(css, /--color-surface:/);
  assert.match(css, /--color-foreground:/);
  assert.match(css, /--color-success-soft:/);
  assert.match(css, /:root\[data-theme="dark"\]/);
  assert.match(css, /@custom-variant dark/);
});

test('theme store persists preference and applies it to the documentElement', async () => {
  const source = await readFile(themeStorePath, 'utf8');
  assert.match(source, /poolino-theme/);
  assert.match(source, /dataset\.theme/);
  assert.match(source, /classList\.toggle\('dark'/);
  assert.match(source, /prefers-color-scheme: dark/);
});

test('root layout blocks the theme flash before paint', async () => {
  const source = await readFile(layoutPath, 'utf8');
  assert.match(source, /suppressHydrationWarning/);
  assert.match(source, /poolino-theme/);
  assert.match(source, /dataset\.theme/);
});
