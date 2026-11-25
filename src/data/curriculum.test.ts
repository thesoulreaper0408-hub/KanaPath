import assert from 'node:assert/strict';
import test from 'node:test';
import {
  COURSE_SECTIONS,
  CURRICULUM_UNITS,
  VOCAB_GRAMMAR_ITEMS,
  getAllLessons,
} from './curriculum';
import { getCorrectAnswerSummary } from '../utils/lessonFeedback';
import { MAX_COMPLETED_LESSONS } from '../utils/progression';

const VALID_ID = /^[a-zA-Z0-9_-]+$/;

test('Expanded Japanese curriculum has 4 sections, 15 units, and 60 lessons within Firestore cap', () => {
  assert.equal(COURSE_SECTIONS.length, 4);
  assert.equal(CURRICULUM_UNITS.length, 15);

  const lessons = getAllLessons();
  assert.equal(lessons.length, 60);
  assert.ok(
    lessons.length <= MAX_COMPLETED_LESSONS,
    `Lesson count (${lessons.length}) must stay within Firestore MAX_COMPLETED_LESSONS (${MAX_COMPLETED_LESSONS})`
  );
  assert.ok(VOCAB_GRAMMAR_ITEMS.length >= 100, 'Expected at least 100 curated vocab/kanji/grammar items');
});

test('Every unit, lesson, exercise, and vocab item has unique Firestore-safe IDs and valid answers', () => {
  const unitIds = new Set<string>();
  const lessonIds = new Set<string>();
  const exerciseIds = new Set<string>();
  const vocabIds = new Set<string>();

  for (const item of VOCAB_GRAMMAR_ITEMS) {
    assert.ok(VALID_ID.test(item.id) && item.id.length <= 64, `Invalid vocab ID: ${item.id}`);
    assert.ok(!vocabIds.has(item.id), `Duplicate vocab ID: ${item.id}`);
    vocabIds.add(item.id);
    assert.ok(item.jp.kana.length > 0 && item.jp.romaji.length > 0, `Missing kana/romaji on ${item.id}`);
  }

  for (const unit of CURRICULUM_UNITS) {
    assert.ok(VALID_ID.test(unit.id) && unit.id.length <= 64, `Invalid unit ID: ${unit.id}`);
    assert.ok(!unitIds.has(unit.id), `Duplicate unit ID: ${unit.id}`);
    unitIds.add(unit.id);
    assert.equal(unit.lessons.length, 4, `Unit ${unit.id} should have 4 lessons`);

    for (const lesson of unit.lessons) {
      assert.ok(VALID_ID.test(lesson.id) && lesson.id.length <= 64, `Invalid lesson ID: ${lesson.id}`);
      assert.ok(!lessonIds.has(lesson.id), `Duplicate lesson ID: ${lesson.id}`);
      lessonIds.add(lesson.id);
      assert.equal(lesson.unitId, unit.id);
      assert.ok(lesson.exercises.length >= 3, `Lesson ${lesson.id} must have >= 3 exercises`);

      for (const ex of lesson.exercises) {
        assert.ok(!exerciseIds.has(ex.id), `Duplicate exercise ID: ${ex.id}`);
        exerciseIds.add(ex.id);

        if (ex.type === 'matching_pairs') {
          assert.ok(ex.pairs.length >= 3, `Matching exercise ${ex.id} needs >= 3 pairs`);
        } else {
          const validOpt = ex.options.some((o) => o.id === ex.correctOptionId);
          assert.ok(validOpt, `Exercise ${ex.id} has invalid correctOptionId ${ex.correctOptionId}`);
        }

        const summary = getCorrectAnswerSummary(ex);
        assert.ok(summary.japanese.length > 0, `Empty feedback summary for ${ex.id}`);
      }
    }
  }

  assert.ok(exerciseIds.size >= 280, `Expected >= 280 unique exercises, found ${exerciseIds.size}`);
});
