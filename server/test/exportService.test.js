import { test } from 'node:test';
import assert from 'node:assert/strict';
import { exportToMarkdown } from '../services/exportService.js';

// A representative guide reused across several tests.
function sampleGuide(overrides = {}) {
  return {
    title: 'My Guide',
    contentType: 'RECIPE',
    progress: 66.66,
    chapters: [
      {
        title: 'Prep',
        steps: [
          {
            content: 'Chop onions',
            isCompleted: true,
            notes: [{ content: 'use red onions' }],
            attachments: [{ fileUrl: 'http://x/a.png' }],
          },
          { content: 'Boil water', isCompleted: false },
        ],
      },
    ],
    ...overrides,
  };
}

test('exportToMarkdown renders the full document exactly', () => {
  const expected =
    '# My Guide\n\n' +
    '**Content Type:** RECIPE\n' +
    '**Progress:** 67% Complete\n\n' +
    '## Prep\n\n' +
    '- [x] Chop onions\n' +
    '  - *Note:* use red onions\n' +
    '  - *Attachment:* [View Image](http://x/a.png)\n\n' +
    '- [ ] Boil water\n\n';
  assert.equal(exportToMarkdown(sampleGuide()), expected);
});

test('completed steps use [x] and incomplete steps use [ ]', () => {
  const md = exportToMarkdown(sampleGuide());
  assert.match(md, /- \[x\] Chop onions/);
  assert.match(md, /- \[ \] Boil water/);
});

test('progress is rounded to the nearest integer percent', () => {
  // 66.66 -> 67
  assert.match(exportToMarkdown(sampleGuide({ progress: 66.66 })), /\*\*Progress:\*\* 67% Complete/);
  // 12.4 -> 12 (rounds down)
  assert.match(exportToMarkdown(sampleGuide({ progress: 12.4 })), /\*\*Progress:\*\* 12% Complete/);
});

test('missing progress defaults to 0%', () => {
  const guide = sampleGuide();
  delete guide.progress;
  assert.match(exportToMarkdown(guide), /\*\*Progress:\*\* 0% Complete/);
});

test('notes are rendered as nested italic Note bullets', () => {
  const guide = {
    title: 'T',
    contentType: 'GENERAL',
    progress: 0,
    chapters: [
      {
        title: 'C',
        steps: [
          { content: 'Step one', isCompleted: false, notes: [{ content: 'first' }, { content: 'second' }] },
        ],
      },
    ],
  };
  const md = exportToMarkdown(guide);
  assert.match(md, /  - \*Note:\* first\n/);
  assert.match(md, /  - \*Note:\* second\n/);
});

test('attachments are rendered as nested View Image links', () => {
  const guide = {
    title: 'T',
    contentType: 'GENERAL',
    progress: 0,
    chapters: [
      {
        title: 'C',
        steps: [
          { content: 'Step', isCompleted: false, attachments: [{ fileUrl: 'https://cdn/img.png' }] },
        ],
      },
    ],
  };
  assert.match(exportToMarkdown(guide), /  - \*Attachment:\* \[View Image\]\(https:\/\/cdn\/img\.png\)\n/);
});

test('a step without notes or attachments emits no nested bullets', () => {
  const guide = {
    title: 'T',
    contentType: 'GENERAL',
    progress: 100,
    chapters: [{ title: 'C', steps: [{ content: 'Lonely step', isCompleted: true }] }],
  };
  const md = exportToMarkdown(guide);
  assert.doesNotMatch(md, /\*Note:\*/);
  assert.doesNotMatch(md, /\*Attachment:\*/);
  assert.match(md, /- \[x\] Lonely step\n\n/);
});

test('empty notes/attachments arrays produce no nested bullets', () => {
  const guide = {
    title: 'T',
    contentType: 'GENERAL',
    progress: 0,
    chapters: [{ title: 'C', steps: [{ content: 'S', isCompleted: false, notes: [], attachments: [] }] }],
  };
  const md = exportToMarkdown(guide);
  assert.doesNotMatch(md, /\*Note:\*/);
  assert.doesNotMatch(md, /\*Attachment:\*/);
});

test('multiple chapters each get an h2 heading', () => {
  const guide = {
    title: 'Multi',
    contentType: 'STUDY_GUIDE',
    progress: 0,
    chapters: [
      { title: 'Alpha', steps: [{ content: 'a', isCompleted: false }] },
      { title: 'Beta', steps: [{ content: 'b', isCompleted: false }] },
    ],
  };
  const md = exportToMarkdown(guide);
  assert.match(md, /## Alpha\n/);
  assert.match(md, /## Beta\n/);
});

test('a guide with no steps still renders title, content type and progress', () => {
  const guide = { title: 'Empty', contentType: 'GENERAL', progress: 0, chapters: [] };
  assert.equal(
    exportToMarkdown(guide),
    '# Empty\n\n**Content Type:** GENERAL\n**Progress:** 0% Complete\n\n'
  );
});
