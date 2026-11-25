import test from 'node:test';
import assert from 'node:assert/strict';
import { CURRICULUM_UNITS } from '../data/curriculum';
import {
  applyHeartRefill,
  applyLessonCompletion,
  applyMistakeHeartLoss,
  calculateAccuracy,
  calculateMasteryLevel,
  createDefaultProgress,
  getEffectiveDailyStats,
  getLessonStatuses,
  mergeProgressRecords,
  sanitizeUserProgressForFirestore,
} from './progression';

test('getLessonStatuses unlocks only the first uncompleted lesson and marks subsequent locked', () => {
  const initial = getLessonStatuses(CURRICULUM_UNITS, []);
  assert.equal(initial['u1-l1'], 'active');
  assert.equal(initial['u1-l2'], 'locked');
  assert.equal(initial['u2-l1'], 'locked');

  const afterFirst = getLessonStatuses(CURRICULUM_UNITS, ['u1-l1']);
  assert.equal(afterFirst['u1-l1'], 'completed');
  assert.equal(afterFirst['u1-l2'], 'active');
  assert.equal(afterFirst['u1-l3'], 'locked');

  const afterUnit1 = getLessonStatuses(CURRICULUM_UNITS, ['u1-l1', 'u1-l2', 'u1-l3', 'u1-l4']);
  assert.equal(afterUnit1['u1-l4'], 'completed');
  assert.equal(afterUnit1['u2-l1'], 'active');
  assert.equal(afterUnit1['u2-l2'], 'locked');
});

test('applyLessonCompletion awards XP, perfect bonus, starts streak, and adds completed lesson', () => {
  const base = createDefaultProgress('user_1', 'Aiko');
  const lesson = CURRICULUM_UNITS[0].lessons[0]; // 20 XP

  const { nextProgress, xpEarned } = applyLessonCompletion(base, lesson, 0, '2026-11-19');
  assert.equal(xpEarned, 25); // 20 base + 5 perfect bonus
  assert.equal(nextProgress.xp, 25);
  assert.equal(nextProgress.dailyXp, 25);
  assert.equal(nextProgress.streak, 1);
  assert.equal(nextProgress.lastActiveDate, '2026-11-19');
  assert.deepEqual(nextProgress.completedLessonIds, ['u1-l1']);

  // Second lesson same day does not double-increment streak
  const lesson2 = CURRICULUM_UNITS[0].lessons[1]; // 25 XP
  const res2 = applyLessonCompletion(nextProgress, lesson2, 1, '2026-11-19');
  assert.equal(res2.xpEarned, 25); // 1 mistake -> no perfect bonus
  assert.equal(res2.nextProgress.streak, 1);
  assert.equal(res2.nextProgress.dailyXp, 50);
  assert.deepEqual(res2.nextProgress.completedLessonIds, ['u1-l1', 'u1-l2']);
});

test('streak continues on consecutive day and resets after missing a full day', () => {
  const yesterday = { dailyXp: 40, streak: 4, lastActiveDate: '2026-11-18' };
  const statsNextDay = getEffectiveDailyStats(yesterday, '2026-11-19');
  assert.equal(statsNextDay.dailyXp, 0);
  assert.equal(statsNextDay.streak, 4);
  assert.equal(statsNextDay.isActiveToday, false);

  const twoDaysAgo = { dailyXp: 40, streak: 4, lastActiveDate: '2026-11-17' };
  const statsBroken = getEffectiveDailyStats(twoDaysAgo, '2026-11-19');
  assert.equal(statsBroken.streak, 0);
  assert.equal(statsBroken.dailyXp, 0);
});

test('hearts decrement safely to 0 and refill cleanly up to 5', () => {
  let p = createDefaultProgress('user_1', 'Ken');
  assert.equal(p.hearts, 5);
  for (let i = 0; i < 7; i++) {
    p = applyMistakeHeartLoss(p);
  }
  assert.equal(p.hearts, 0);

  p = applyHeartRefill(p, 2);
  assert.equal(p.hearts, 2);
  p = applyHeartRefill(p, 10);
  assert.equal(p.hearts, 5);
});

test('accuracy and mastery level compute bounded integers', () => {
  assert.equal(calculateAccuracy(4, 5), 80);
  assert.equal(calculateAccuracy(5, 5), 100);
  assert.equal(calculateAccuracy(0, 0), 100);

  assert.equal(calculateMasteryLevel(0, 2), 0);
  assert.equal(calculateMasteryLevel(1, 0), 1);
  assert.equal(calculateMasteryLevel(4, 0), 3);
  assert.equal(calculateMasteryLevel(10, 0), 5);
});

test('mergeProgressRecords preserves union of completed lessons and higher XP/streak', () => {
  const local = {
    ...createDefaultProgress('guest', 'Learner'),
    xp: 45,
    dailyXp: 45,
    streak: 1,
    lastActiveDate: '2026-11-19',
    completedLessonIds: ['u1-l1', 'u1-l2'],
  };
  const remote = {
    ...createDefaultProgress('uid-abc', 'Haru'),
    xp: 20,
    dailyXp: 20,
    streak: 2,
    lastActiveDate: '2026-11-18',
    completedLessonIds: ['u1-l1'],
  };

  const merged = mergeProgressRecords(local, remote);
  assert.equal(merged.uid, 'uid-abc');
  assert.equal(merged.xp, 45);
  assert.equal(merged.streak, 2);
  assert.equal(merged.dailyXp, 45);
  assert.deepEqual(merged.completedLessonIds, ['u1-l1', 'u1-l2']);
});

test('sanitizeUserProgressForFirestore enforces blueprint constraints and rejects invalid lesson IDs', () => {
  const dirty = {
    ...createDefaultProgress('valid_uid-123', 'A'.repeat(120)),
    xp: -50,
    hearts: 99,
    lastActiveDate: 'not-a-date',
    completedLessonIds: ['u1-l1', 'bad id with spaces!', 'u1-l1'],
  };
  const clean = sanitizeUserProgressForFirestore(dirty);
  assert.equal(clean.displayName.length, 80);
  assert.equal(clean.xp, 0);
  assert.equal(clean.hearts, 5);
  assert.equal(clean.lastActiveDate, '');
  assert.deepEqual(clean.completedLessonIds, ['u1-l1']);
});
