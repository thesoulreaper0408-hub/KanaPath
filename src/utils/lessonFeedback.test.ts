import test from 'node:test';
import assert from 'node:assert/strict';
import { CURRICULUM_UNITS } from '../data/curriculum';
import { getComboBannerInfo, getCorrectAnswerSummary } from './lessonFeedback';

test('getCorrectAnswerSummary extracts Japanese, Romaji, and English across exercise types', () => {
  const u1l1 = CURRICULUM_UNITS[0].lessons[0];

  // kana_recognition
  const kanaSummary = getCorrectAnswerSummary(u1l1.exercises[0]);
  assert.equal(kanaSummary.japanese, 'あ');
  assert.equal(kanaSummary.romaji, 'a');

  // multiple_choice (Japanese prompt -> English answer)
  const mcSummary = getCorrectAnswerSummary(u1l1.exercises[3]);
  assert.match(mcSummary.japanese, /愛.*あい/);
  assert.equal(mcSummary.romaji, 'ai');
  assert.equal(mcSummary.english, 'Love');

  // fill_blank (い + え -> house)
  const fbSummary = getCorrectAnswerSummary(u1l1.exercises[4]);
  assert.equal(fbSummary.japanese, 'いえ');
  assert.equal(fbSummary.romaji, 'ie');
  assert.equal(fbSummary.english, 'house (ie)');
});

test('getComboBannerInfo triggers streak milestones cleanly', () => {
  assert.equal(getComboBannerInfo(0), null);
  assert.equal(getComboBannerInfo(1), null);

  const two = getComboBannerInfo(2);
  assert.deepEqual(two, { label: '2 in a row!', isSparkleMilestone: false });

  const three = getComboBannerInfo(3);
  assert.deepEqual(three, { label: '3 in a row!', isSparkleMilestone: true });

  const five = getComboBannerInfo(5);
  assert.deepEqual(five, { label: '5 in a row! Unstoppable!', isSparkleMilestone: true });
});
