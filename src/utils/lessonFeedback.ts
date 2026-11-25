import type { Exercise } from '../types/learning';

export interface CorrectAnswerSummary {
  japanese: string;
  romaji?: string;
  english?: string;
}

/**
 * Extracts a clear, structured representation of the right answer for the
 * slide-up wrong-answer feedback banner across all 4 exercise types.
 */
export function getCorrectAnswerSummary(exercise: Exercise): CorrectAnswerSummary {
  switch (exercise.type) {
    case 'kana_recognition': {
      return {
        japanese: exercise.targetChar,
        romaji: exercise.targetReading,
        english: exercise.script === 'kanji' ? exercise.targetReading : `Read "${exercise.targetReading}"`,
      };
    }

    case 'multiple_choice': {
      const rightOpt = exercise.options.find((o) => o.id === exercise.correctOptionId);
      if (rightOpt?.jp) {
        return {
          japanese: rightOpt.jp.kanji ? `${rightOpt.jp.kanji} (${rightOpt.jp.kana})` : rightOpt.jp.kana,
          romaji: rightOpt.jp.romaji,
          english: exercise.promptText,
        };
      }
      if (exercise.promptJp) {
        return {
          japanese: exercise.promptJp.kanji
            ? `${exercise.promptJp.kanji} (${exercise.promptJp.kana})`
            : exercise.promptJp.kana,
          romaji: exercise.promptJp.romaji,
          english: rightOpt?.label,
        };
      }
      return {
        japanese: rightOpt?.label || '',
        english: rightOpt?.label,
      };
    }

    case 'fill_blank': {
      const rightOpt = exercise.options.find((o) => o.id === exercise.correctOptionId);
      const beforeKana = exercise.beforeBlank.kana || '';
      const midKana = rightOpt?.jp.kana || '';
      const afterKana = exercise.afterBlank.kana || '';
      const fullKana = `${beforeKana}${midKana}${afterKana}`.replace(/\s+/g, ' ').trim();

      const beforeKanji = exercise.beforeBlank.kanji || beforeKana;
      const midKanji = rightOpt?.jp.kanji || midKana;
      const afterKanji = exercise.afterBlank.kanji || afterKana;
      const fullKanji = `${beforeKanji}${midKanji}${afterKanji}`.replace(/\s+/g, ' ').trim();

      const fullRomaji = `${exercise.beforeBlank.romaji || ''}${rightOpt?.jp.romaji || ''}${exercise.afterBlank.romaji || ''}`
        .replace(/\s+/g, ' ')
        .trim();

      return {
        japanese: fullKanji !== fullKana ? `${fullKanji} (${fullKana})` : fullKana,
        romaji: fullRomaji,
        english: exercise.englishPrompt,
      };
    }

    case 'matching_pairs': {
      const sample = exercise.pairs[0];
      return {
        japanese: sample ? sample.jp.kana : '',
        romaji: sample ? sample.jp.romaji : undefined,
        english: sample ? sample.meaning : undefined,
      };
    }
  }
}

export interface ComboMilestoneInfo {
  label: string;
  isSparkleMilestone: boolean;
}

/**
 * Returns combo streak banner metadata when the learner hits consecutive correct answers.
 */
export function getComboBannerInfo(comboCount: number): ComboMilestoneInfo | null {
  if (comboCount < 2) return null;
  const isSparkleMilestone = comboCount === 3 || comboCount === 5 || (comboCount >= 8 && comboCount % 3 === 0);
  if (comboCount >= 5) {
    return {
      label: `${comboCount} in a row! Unstoppable!`,
      isSparkleMilestone,
    };
  }
  return {
    label: `${comboCount} in a row!`,
    isSparkleMilestone,
  };
}
