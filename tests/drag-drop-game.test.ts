import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  createDragDropCompletionRequest,
  dragDropDefaults,
  isDragDropTargetCorrect,
  parseDragDropPayload,
  tryBeginDragDropSubmission,
} from '../src/features/drag-drop-game/dragDropGame.ts';

test('admin defaults construct the documented drag_drop payload', () => {
  const parsed = parseDragDropPayload(dragDropDefaults);
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.deepEqual(parsed.data.items, [
      { id: 'item-coin', content: 'سکه' },
      { id: 'item-note', content: 'اسکناس' },
    ]);
    assert.deepEqual(parsed.data.targets, [
      { id: 'target-saving', label: 'پس‌انداز', acceptsItemId: 'item-coin' },
      { id: 'target-spending', label: 'هزینه', acceptsItemId: 'item-note' },
    ]);
    assert.deepEqual(parsed.data.scoring, { correct: 10, wrong: 0, maxScore: 100 });
  }
});

test('the documented payload shape parses and keeps defaults for absent scoring', () => {
  const parsed = parseDragDropPayload({
    introduction: 'هر سکه را به جای درستش بکش.',
    items: [
      { id: 'item-coin', content: 'سکه' },
      { id: 'item-note', content: 'اسکناس' },
    ],
    targets: [
      { id: 'target-saving', label: 'پس‌انداز', acceptsItemId: 'item-coin' },
      { id: 'target-spending', label: 'هزینه', acceptsItemId: 'item-note' },
    ],
  });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.introduction, 'هر سکه را به جای درستش بکش.');
    assert.equal(parsed.data.scoring.correct, 10);
    assert.equal(parsed.data.scoring.wrong, 0);
    assert.equal(parsed.data.scoring.maxScore, undefined);
  }
});

test('legacy string items and targets are normalized into id/content objects', () => {
  const parsed = parseDragDropPayload({
    instruction: 'راهنمای قدیمی',
    items: ['سکه', 'اسکناس'],
    targets: ['پس‌انداز', 'هزینه'],
  });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.deepEqual(parsed.data.items, [
      { id: 'item-1', content: 'سکه' },
      { id: 'item-2', content: 'اسکناس' },
    ]);
    assert.deepEqual(parsed.data.targets, [
      { id: 'target-1', label: 'پس‌انداز' },
      { id: 'target-2', label: 'هزینه' },
    ]);
    assert.equal(parsed.data.introduction, 'راهنمای قدیمی');
  }
});

test('empty items or targets are rejected', () => {
  assert.equal(parseDragDropPayload({ items: [], targets: [{ id: 't', label: 'x' }] }).success, false);
  assert.equal(parseDragDropPayload({ items: [{ id: 'i', content: 'x' }], targets: [] }).success, false);
});

test('an item with a blank id or content is rejected', () => {
  assert.equal(
    parseDragDropPayload({
      items: [{ id: '  ', content: 'x' }],
      targets: [{ id: 't', label: 'y' }],
    }).success,
    false,
  );
  assert.equal(
    parseDragDropPayload({
      items: [{ id: 'i', content: '  ' }],
      targets: [{ id: 't', label: 'y' }],
    }).success,
    false,
  );
});

test('duplicate item ids are rejected', () => {
  const parsed = parseDragDropPayload({
    items: [
      { id: 'item', content: 'a' },
      { id: 'item', content: 'b' },
    ],
    targets: [{ id: 't', label: 'y' }],
  });
  assert.equal(parsed.success, false);
});

test('a target pointing to a missing item is rejected', () => {
  const parsed = parseDragDropPayload({
    items: [{ id: 'item-1', content: 'a' }],
    targets: [{ id: 't', label: 'y', acceptsItemId: 'item-404' }],
  });
  assert.equal(parsed.success, false);
});

test('isDragDropTargetCorrect only matches the accepted item id', () => {
  const target = { id: 'target-saving', label: 'پس‌انداز', acceptsItemId: 'item-coin' };
  assert.equal(isDragDropTargetCorrect(target, 'item-coin'), true);
  assert.equal(isDragDropTargetCorrect(target, 'item-note'), false);
  assert.equal(isDragDropTargetCorrect(target, null), false);
  assert.equal(isDragDropTargetCorrect({ id: 't', label: 'l' }, 'item-coin'), false);
});

test('completion request sends dragDropPlacements with timing', () => {
  const dto = createDragDropCompletionRequest(
    [
      { itemId: 'item-coin', targetId: 'target-saving' },
      { itemId: 'item-note', targetId: 'target-spending' },
    ],
    '2026-10-10T11:40:00.000Z',
    '2026-10-10T11:40:20.000Z',
  );
  assert.deepEqual(dto, {
    gameType: 'drag_drop',
    dragDropPlacements: [
      { itemId: 'item-coin', targetId: 'target-saving' },
      { itemId: 'item-note', targetId: 'target-spending' },
    ],
    startedAt: '2026-10-10T11:40:00.000Z',
    completedAt: '2026-10-10T11:40:20.000Z',
  });
  assert.equal('matchedPairIds' in dto, false);
});

test('submission guard prevents duplicate requests', () => {
  const flag = { current: false };
  assert.equal(tryBeginDragDropSubmission(flag), true);
  assert.equal(tryBeginDragDropSubmission(flag), false);
});

test('lesson renderer registers drag_drop and admin routes its payload schema', async () => {
  const lessonPlayer = await readFile(
    new URL('../src/features/lesson-payer/component/LessonPlayer.tsx', import.meta.url),
    'utf8',
  );
  assert.match(lessonPlayer, /case 'drag_drop':/);
  assert.match(lessonPlayer, /<DragDropBlock/);

  const schemas = await readFile(
    new URL('../src/features/admin-content/schemas.ts', import.meta.url),
    'utf8',
  );
  assert.match(schemas, /type === 'drag_drop'/);
  assert.match(schemas, /dragDropPayloadSchema/);
});
