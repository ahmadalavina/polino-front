import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  parseStoryPayload,
  storyDefaults,
} from '../src/features/story-block/storyContent.ts';

test('admin defaults construct a valid story payload', () => {
  assert.equal(parseStoryPayload(storyDefaults).success, true);
});

test('the documented content shape parses into ordered text and image items', () => {
  const result = parseStoryPayload({
    title: 'عنوان داستان',
    content: [
      { type: 'text', value: 'متن قبل از تصویر...' },
      {
        type: 'image',
        url: '/assets/story/coin.png',
        alt: 'سکه',
        caption: 'پس‌انداز کن!',
        width: 320,
        align: 'center',
      },
      { type: 'text', value: 'متن بعد از تصویر...' },
    ],
  });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.title, 'عنوان داستان');
    assert.deepEqual(result.data.content, [
      { type: 'text', value: 'متن قبل از تصویر...' },
      {
        type: 'image',
        url: '/assets/story/coin.png',
        alt: 'سکه',
        caption: 'پس‌انداز کن!',
        width: 320,
        align: 'center',
      },
      { type: 'text', value: 'متن بعد از تصویر...' },
    ]);
  }
});

test('legacy single-text story migrates into a single text content item', () => {
  const result = parseStoryPayload({
    title: 'داستان قدیمی',
    text: 'متن قدیمی داستان',
  });
  assert.equal(result.success, true);
  if (result.success) {
    assert.deepEqual(result.data.content, [
      { type: 'text', value: 'متن قدیمی داستان' },
    ]);
  }
});

test('an empty story is rejected', () => {
  assert.equal(parseStoryPayload({ title: 'خالی' }).success, false);
  assert.equal(parseStoryPayload({ content: [] }).success, false);
});

test('a text item with blank value is rejected', () => {
  assert.equal(
    parseStoryPayload({ content: [{ type: 'text', value: '   ' }] }).success,
    false,
  );
});

test('an image item without url is rejected', () => {
  assert.equal(
    parseStoryPayload({ content: [{ type: 'image', url: '' }] }).success,
    false,
  );
});

test('an unknown content item type is rejected', () => {
  assert.equal(
    parseStoryPayload({ content: [{ type: 'video', url: 'x' }] }).success,
    false,
  );
});

test('a non-positive image width is rejected', () => {
  assert.equal(
    parseStoryPayload({
      content: [{ type: 'image', url: 'a.png', width: 0 }],
    }).success,
    false,
  );
});

test('image align defaults are optional and restricted to known values', () => {
  const ok = parseStoryPayload({
    content: [{ type: 'image', url: 'a.png' }],
  });
  assert.equal(ok.success, true);
  if (ok.success) {
    assert.equal(ok.data.content[0].type, 'image');
  }

  assert.equal(
    parseStoryPayload({
      content: [{ type: 'image', url: 'a.png', align: 'top' }],
    }).success,
    false,
  );
});

test('admin block preset uses the new story content shape', async () => {
  const source = await readFile(
    new URL('../src/features/admin-content/AdminContentManager.tsx', import.meta.url),
    'utf8',
  );
  assert.match(source, /content:\s*\[/);
  assert.match(source, /story:\s*\{[\s\S]*?content:\s*\[/);
  assert.doesNotMatch(source, /story:\s*\{[\s\S]*?text:\s*'متن داستان را اینجا وارد کنید\.'/);
});
