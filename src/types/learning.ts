export type ScriptMode = 'kana' | 'furigana' | 'kanji';

export type DailyGoalOption = 20 | 50 | 100;

export interface JapaneseText {
  /** Pure Hiragana / Katakana reading (e.g. わたしは がくせいです) */
  kana: string;
  /** Natural Japanese with Kanji when applicable (e.g. 私は学生です). Omit if identical to kana. */
  kanji?: string;
  /** Structured furigana ruby segments for progressive Kanji + Kana reading */
  segments?: Array<{ text: string; furigana?: string }>;
  /** Hepburn Romaji pronunciation (e.g. watashi wa gakusei desu) */
  romaji: string;
  /** Spoken TTS text (defaults to kanji || kana) */
  tts?: string;
}

export type VocabKind = 'hiragana' | 'katakana' | 'kanji' | 'vocab' | 'grammar';

export interface VocabGrammarItem {
  id: string;
  unitId: string;
  lessonId: string;
  kind: VocabKind;
  jp: JapaneseText;
  meaning: string;
  note?: string;
  example?: {
    jp: JapaneseText;
    meaning: string;
  };
}

export interface KanaChar {
  id: string;
  script: 'hiragana' | 'katakana';
  char: string;
  romaji: string;
  row: string;
  mnemonic: string;
  exampleWord: {
    kana: string;
    romaji: string;
    meaning: string;
  };
}

export interface ExerciseBase {
  id: string;
  itemIds: string[];
  instruction: string;
  explanation: string;
}

export interface MultipleChoiceOption {
  id: string;
  label?: string;
  jp?: JapaneseText;
}

export interface MultipleChoiceExercise extends ExerciseBase {
  type: 'multiple_choice';
  promptText?: string;
  promptJp?: JapaneseText;
  options: MultipleChoiceOption[];
  correctOptionId: string;
}

export interface MatchingPair {
  id: string;
  jp: JapaneseText;
  meaning: string;
}

export interface MatchingPairsExercise extends ExerciseBase {
  type: 'matching_pairs';
  pairs: MatchingPair[];
}

export interface FillBlankExercise extends ExerciseBase {
  type: 'fill_blank';
  englishPrompt: string;
  beforeBlank: JapaneseText;
  afterBlank: JapaneseText;
  options: Array<{
    id: string;
    jp: JapaneseText;
  }>;
  correctOptionId: string;
}

export interface KanaRecognitionExercise extends ExerciseBase {
  type: 'kana_recognition';
  script: 'hiragana' | 'katakana' | 'kanji';
  targetChar: string;
  targetReading: string;
  mnemonic?: string;
  promptMode: 'char-to-romaji' | 'romaji-to-char';
  options: Array<{
    id: string;
    label: string;
    sublabel?: string;
  }>;
  correctOptionId: string;
}

export type Exercise =
  | MultipleChoiceExercise
  | MatchingPairsExercise
  | FillBlankExercise
  | KanaRecognitionExercise;

export interface Lesson {
  id: string;
  unitId: string;
  order: number;
  title: string;
  subtitle: string;
  xpReward: number;
  estimatedMinutes: number;
  exercises: Exercise[];
}

export interface CourseSection {
  id: string;
  order: 1 | 2 | 3 | 4;
  title: string;
  japaneseTitle: string;
  subtitle: string;
  cefrTag: string;
  accent: Unit['accent'];
}

export interface Unit {
  id: string;
  section?: 1 | 2 | 3 | 4;
  order: number;
  title: string;
  japaneseTitle: string;
  description: string;
  accent: 'emerald' | 'sky' | 'amber' | 'rose' | 'indigo';
  guidebookTips: Array<{
    heading: string;
    body: string;
    exampleJp?: JapaneseText;
    exampleMeaning?: string;
  }>;
  lessons: Lesson[];
}

export type LessonNodeStatus = 'completed' | 'active' | 'locked';

export interface UserProgress {
  uid: string;
  displayName: string;
  xp: number;
  dailyXp: number;
  dailyGoal: DailyGoalOption;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD or ""
  hearts: number;
  maxHearts: 5;
  scriptMode: ScriptMode;
  showRomaji: boolean;
  soundEnabled: boolean;
  completedLessonIds: string[];
}

export interface LessonAttemptRecord {
  attemptId: string;
  userId: string;
  lessonId: string;
  unitId: string;
  xpEarned: number;
  accuracy: number;
  mistakes: number;
  completedAtIso: string;
}

export interface ItemMasteryRecord {
  itemId: string;
  userId: string;
  kind: VocabKind;
  correctCount: number;
  incorrectCount: number;
  masteryLevel: number; // 0..5
}
