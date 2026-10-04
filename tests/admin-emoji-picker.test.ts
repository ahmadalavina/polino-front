import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const editorPath = new URL(
  '../src/features/admin-content/components/BlockPayloadEditor.tsx',
  import.meta.url,
);

test('emoji picker escapes clipping ancestors via a fixed portal', async () => {
  const source = await readFile(editorPath, 'utf8');
  assert.match(source, /createPortal/);
  assert.match(source, /position:\s*"fixed"/);
  assert.match(source, /document\.body/);
  assert.doesNotMatch(source, /className="absolute z-40/);
});
