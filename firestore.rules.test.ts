import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
const draftPath = path.resolve(process.cwd(), 'DRAFT_firestore.rules');
const activePath = fs.existsSync(rulesPath) ? rulesPath : draftPath;
const rulesSource = fs.readFileSync(activePath, 'utf8');

test('Global default-deny catch-all rule is declared first', () => {
  assert.match(rulesSource, /match \/\{document=\*\*\}\s*\{\s*allow read, write: if false;\s*\}/);
});

test('All blueprint collections are explicitly matched and secured', () => {
  assert.match(rulesSource, /match \/users\/\{userId\}/);
  assert.match(rulesSource, /match \/lessonAttempts\/\{attemptId\}/);
  assert.match(rulesSource, /match \/itemMastery\/\{itemId\}/);
});

test('Verified user, path variable hardening, and strict server timestamp checks are enforced', () => {
  assert.match(rulesSource, /request\.auth\.token\.email_verified == true/);
  assert.match(rulesSource, /function isValidId\(id\)/);
  assert.match(rulesSource, /incoming\(\)\.createdAt == request\.time/);
  assert.match(rulesSource, /incoming\(\)\.updatedAt == request\.time/);
  assert.match(rulesSource, /incoming\(\)\.completedAt == request\.time/);
});

test('Dirty Dozen protections: no blanket reads, strict hasOnly keys, array cap, immutable attempts', () => {
  // No blanket reads
  assert.doesNotMatch(rulesSource, /allow read:\s*if isSignedIn\(\);/);
  assert.doesNotMatch(rulesSource, /allow list:\s*if isSignedIn\(\);/);

  // Strict allow list enforces resource.data.userId
  assert.match(rulesSource, /allow list:\s*if isOwner\(userId\)\s*&&\s*resource\.data\.userId == request\.auth\.uid;/);

  // Action-based update with affectedKeys().hasOnly() wrapped by validation blueprint
  assert.match(rulesSource, /isValidUserProgress\(incoming\(\), userId\)/);
  assert.match(rulesSource, /affectedKeys\(\)\.hasOnly\(/);

  // Bounded array guard
  assert.match(rulesSource, /completedLessonIds\.size\(\) <= 100/);

  // Immutable attempts
  assert.match(rulesSource, /allow update:\s*if false;\s*allow delete:\s*if false;/);
});
