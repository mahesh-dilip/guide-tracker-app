import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateProgress } from '../services/guideUtils.js';

test('returns 0 for a guide with no chapters', () => {
  assert.equal(calculateProgress({ chapters: [] }), 0);
});

test('returns 0 when there are chapters but no steps', () => {
  assert.equal(calculateProgress({ chapters: [{ steps: [] }, { steps: [] }] }), 0);
});

test('returns 100 when every step is completed', () => {
  const guide = {
    chapters: [
      { steps: [{ isCompleted: true }, { isCompleted: true }] },
      { steps: [{ isCompleted: true }] },
    ],
  };
  assert.equal(calculateProgress(guide), 100);
});

test('returns 0 when no step is completed', () => {
  const guide = { chapters: [{ steps: [{ isCompleted: false }, { isCompleted: false }] }] };
  assert.equal(calculateProgress(guide), 0);
});

test('computes the correct percentage across chapters', () => {
  // 2 of 4 steps completed = 50%
  const guide = {
    chapters: [
      { steps: [{ isCompleted: true }, { isCompleted: false }] },
      { steps: [{ isCompleted: true }, { isCompleted: false }] },
    ],
  };
  assert.equal(calculateProgress(guide), 50);
});

test('returns an unrounded fraction (1 of 3 = 33.33...)', () => {
  const guide = {
    chapters: [{ steps: [{ isCompleted: true }, { isCompleted: false }, { isCompleted: false }] }],
  };
  // The function intentionally does not round; rounding happens at render time.
  assert.ok(Math.abs(calculateProgress(guide) - 100 / 3) < 1e-9);
});

test('treats missing isCompleted as not completed', () => {
  const guide = { chapters: [{ steps: [{}, { isCompleted: true }] }] };
  assert.equal(calculateProgress(guide), 50);
});

test('tolerates missing chapters key', () => {
  assert.equal(calculateProgress({}), 0);
});
