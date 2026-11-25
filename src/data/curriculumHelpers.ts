import type {
  FillBlankExercise,
  JapaneseText,
  KanaRecognitionExercise,
  MatchingPairsExercise,
  MultipleChoiceExercise,
} from '../types/learning';

export function jp(
  kana: string,
  romaji: string,
  kanji?: string,
  segments?: Array<{ text: string; furigana?: string }>
): JapaneseText {
  const result: JapaneseText = { kana, romaji };
  if (kanji) result.kanji = kanji;
  if (segments && segments.length > 0) result.segments = segments;
  return result;
}

export function mcJpToEn(
  id: string,
  itemIds: string[],
  instruction: string,
  promptJp: JapaneseText,
  options: Array<[string, string]>,
  correctOptionId: string,
  explanation: string
): MultipleChoiceExercise {
  return {
    id,
    type: 'multiple_choice',
    itemIds,
    instruction,
    promptJp,
    options: options.map(([optId, label]) => ({ id: optId, label })),
    correctOptionId,
    explanation,
  };
}

export function mcEnToJp(
  id: string,
  itemIds: string[],
  instruction: string,
  promptText: string,
  options: Array<[string, JapaneseText]>,
  correctOptionId: string,
  explanation: string
): MultipleChoiceExercise {
  return {
    id,
    type: 'multiple_choice',
    itemIds,
    instruction,
    promptText,
    options: options.map(([optId, optJp]) => ({ id: optId, jp: optJp })),
    correctOptionId,
    explanation,
  };
}

export function matchPairs(
  id: string,
  itemIds: string[],
  instruction: string,
  pairs: Array<[string, JapaneseText, string]>,
  explanation: string
): MatchingPairsExercise {
  return {
    id,
    type: 'matching_pairs',
    itemIds,
    instruction,
    pairs: pairs.map(([pairId, pairJp, meaning]) => ({
      id: pairId,
      jp: pairJp,
      meaning,
    })),
    explanation,
  };
}

export function fillBlank(
  id: string,
  itemIds: string[],
  instruction: string,
  englishPrompt: string,
  beforeBlank: JapaneseText,
  afterBlank: JapaneseText,
  options: Array<[string, JapaneseText]>,
  correctOptionId: string,
  explanation: string
): FillBlankExercise {
  return {
    id,
    type: 'fill_blank',
    itemIds,
    instruction,
    englishPrompt,
    beforeBlank,
    afterBlank,
    options: options.map(([optId, optJp]) => ({ id: optId, jp: optJp })),
    correctOptionId,
    explanation,
  };
}

export function kanaQuiz(
  id: string,
  itemIds: string[],
  script: 'hiragana' | 'katakana' | 'kanji',
  promptMode: 'char-to-romaji' | 'romaji-to-char',
  instruction: string,
  targetChar: string,
  targetReading: string,
  mnemonic: string,
  options: Array<[string, string, string?]>,
  correctOptionId: string,
  explanation: string
): KanaRecognitionExercise {
  return {
    id,
    type: 'kana_recognition',
    itemIds,
    script,
    promptMode,
    instruction,
    targetChar,
    targetReading,
    mnemonic,
    options: options.map(([optId, label, sublabel]) =>
      sublabel ? { id: optId, label, sublabel } : { id: optId, label }
    ),
    correctOptionId,
    explanation,
  };
}
