import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Check,
  Flame,
  Heart,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import type {
  Exercise,
  FillBlankExercise,
  KanaRecognitionExercise,
  Lesson,
  MatchingPairsExercise,
  MultipleChoiceExercise,
  ScriptMode,
} from '../types/learning';
import { getComboBannerInfo, getCorrectAnswerSummary } from '../utils/lessonFeedback';
import { calculateAccuracy } from '../utils/progression';
import { playSoundEffect, speakJapanese } from '../utils/sound';
import { JapaneseDisplay, TurtleIcon } from './JapaneseDisplay';
import { ScriptControls } from './ScriptControls';
import { SenseiMascot, type MascotMood } from './SenseiMascot';

interface LessonPlayerProps {
  lesson: Lesson;
  unitTitle: string;
  hearts: number;
  streak: number;
  scriptMode: ScriptMode;
  showRomaji: boolean;
  soundEnabled: boolean;
  onChangeScriptMode: (mode: ScriptMode) => void;
  onToggleRomaji: () => void;
  onToggleSound: () => void;
  onLoseHeart: () => void;
  onRefillHearts: () => void;
  onRecordItemResult: (itemIds: string[], wasCorrect: boolean) => void;
  onCompleteLesson: (summary: {
    lesson: Lesson;
    mistakes: number;
    accuracy: number;
  }) => { xpEarned: number; nextStreak: number };
  onExit: () => void;
}

const CONFETTI_PIECES = [
  { left: '8%', color: '#58CC02', delay: '0s', duration: '2.3s', size: 'w-2.5 h-4' },
  { left: '17%', color: '#1CB0F6', delay: '0.3s', duration: '2.6s', size: 'w-3 h-3 rounded-full' },
  { left: '26%', color: '#FFC800', delay: '0.15s', duration: '2.2s', size: 'w-2.5 h-3.5' },
  { left: '36%', color: '#FF4B4B', delay: '0.5s', duration: '2.5s', size: 'w-3 h-2.5' },
  { left: '46%', color: '#CE82FF', delay: '0.1s', duration: '2.4s', size: 'w-2.5 h-4' },
  { left: '56%', color: '#58CC02', delay: '0.4s', duration: '2.7s', size: 'w-3 h-3 rounded-full' },
  { left: '66%', color: '#FFC800', delay: '0.2s', duration: '2.1s', size: 'w-2.5 h-3.5' },
  { left: '75%', color: '#1CB0F6', delay: '0.6s', duration: '2.5s', size: 'w-3 h-2.5' },
  { left: '84%', color: '#FF4B4B', delay: '0.25s', duration: '2.3s', size: 'w-2.5 h-4' },
  { left: '92%', color: '#CE82FF', delay: '0.45s', duration: '2.6s', size: 'w-3 h-3 rounded-full' },
];

function deterministicShuffle<T>(items: T[], seedStr: string): T[] {
  const arr = [...items];
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  }
  for (let i = arr.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function LessonPlayer({
  lesson,
  unitTitle,
  hearts,
  scriptMode,
  showRomaji,
  soundEnabled,
  onChangeScriptMode,
  onToggleRomaji,
  onToggleSound,
  onLoseHeart,
  onRefillHearts,
  onRecordItemResult,
  onCompleteLesson,
  onExit,
}: LessonPlayerProps) {
  const [queue, setQueue] = useState<Exercise[]>(() => [...lesson.exercises]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [showMnemonic, setShowMnemonic] = useState(false);

  // Combo streak & heart shake feedback
  const [comboCount, setComboCount] = useState(0);
  const [heartShakeKey, setHeartShakeKey] = useState(0);

  // Matching pairs state
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [selectedRightId, setSelectedRightId] = useState<string | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [mismatchIds, setMismatchIds] = useState<{ left: string; right: string } | null>(null);

  // Session stats
  const [mistakes, setMistakes] = useState(0);
  const [missedFirstTryIds, setMissedFirstTryIds] = useState<string[]>([]);
  const [completionResult, setCompletionResult] = useState<{
    xpEarned: number;
    accuracy: number;
    nextStreak: number;
  } | null>(null);

  const currentExercise = queue[currentIndex];
  const totalInitial = lesson.exercises.length;
  const completedCount = Math.min(currentIndex + (feedback === 'correct' ? 1 : 0), queue.length);
  const progressPercent = queue.length > 0 ? Math.round((completedCount / queue.length) * 100) : 0;

  const comboBanner = getComboBannerInfo(comboCount);

  const shuffledRightPairs = useMemo(() => {
    if (!currentExercise || currentExercise.type !== 'matching_pairs') return [];
    return deterministicShuffle(currentExercise.pairs, `${currentExercise.id}-${currentIndex}`);
  }, [currentExercise, currentIndex]);

  const activeMascotMood: MascotMood =
    feedback === 'correct'
      ? comboCount >= 3
        ? 'combo'
        : 'happy'
      : feedback === 'wrong'
      ? 'encouraging'
      : 'idle';

  const triggerHeartLoss = () => {
    setHeartShakeKey((k) => k + 1);
    onLoseHeart();
  };

  const handleCorrectOutcome = () => {
    const nextCombo = comboCount + 1;
    setComboCount(nextCombo);
    setFeedback('correct');
    const nextMilestone = getComboBannerInfo(nextCombo);
    if (nextMilestone?.isSparkleMilestone) {
      playSoundEffect('streak', soundEnabled);
    } else {
      playSoundEffect('correct', soundEnabled);
    }
  };

  const resetExerciseState = () => {
    setSelectedOptionId(null);
    setFeedback('idle');
    setShowMnemonic(false);
    setSelectedLeftId(null);
    setSelectedRightId(null);
    setMatchedPairIds([]);
    setMismatchIds(null);
  };

  const handleCheckAnswer = () => {
    if (!currentExercise || feedback !== 'idle') return;
    if (currentExercise.type === 'matching_pairs') return;
    if (!selectedOptionId) return;

    const isCorrect = selectedOptionId === currentExercise.correctOptionId;
    onRecordItemResult(currentExercise.itemIds, isCorrect);

    if (isCorrect) {
      handleCorrectOutcome();
    } else {
      setComboCount(0);
      setFeedback('wrong');
      playSoundEffect('wrong', soundEnabled);
      setMistakes((prev) => prev + 1);
      triggerHeartLoss();
      if (!missedFirstTryIds.includes(currentExercise.id)) {
        setMissedFirstTryIds((prev) => [...prev, currentExercise.id]);
      }
      setQueue((prev) => [...prev, currentExercise]);
    }
  };

  const evaluatePairSelection = (
    exercise: MatchingPairsExercise,
    leftId: string,
    rightId: string
  ) => {
    if (leftId === rightId) {
      const nextMatched = [...matchedPairIds, leftId];
      setMatchedPairIds(nextMatched);
      setSelectedLeftId(null);
      setSelectedRightId(null);
      setMismatchIds(null);
      playSoundEffect('match', soundEnabled);

      if (nextMatched.length === exercise.pairs.length) {
        onRecordItemResult(exercise.itemIds, true);
        handleCorrectOutcome();
      }
    } else {
      setComboCount(0);
      setMismatchIds({ left: leftId, right: rightId });
      setMistakes((prev) => prev + 1);
      if (!missedFirstTryIds.includes(exercise.id)) {
        setMissedFirstTryIds((prev) => [...prev, exercise.id]);
      }
      onRecordItemResult(exercise.itemIds, false);
      triggerHeartLoss();
      playSoundEffect('wrong', soundEnabled);

      window.setTimeout(() => {
        setSelectedLeftId(null);
        setSelectedRightId(null);
        setMismatchIds(null);
      }, 480);
    }
  };

  const handleSelectLeftPair = (exercise: MatchingPairsExercise, pairId: string) => {
    if (feedback !== 'idle' || matchedPairIds.includes(pairId) || mismatchIds) return;
    playSoundEffect('tap', soundEnabled);
    const pair = exercise.pairs.find((p) => p.id === pairId);
    if (pair) {
      speakJapanese(pair.jp.tts || pair.jp.kanji || pair.jp.kana, soundEnabled);
    }
    setSelectedLeftId(pairId);
    if (selectedRightId) {
      evaluatePairSelection(exercise, pairId, selectedRightId);
    }
  };

  const handleSelectRightPair = (exercise: MatchingPairsExercise, pairId: string) => {
    if (feedback !== 'idle' || matchedPairIds.includes(pairId) || mismatchIds) return;
    playSoundEffect('tap', soundEnabled);
    setSelectedRightId(pairId);
    if (selectedLeftId) {
      evaluatePairSelection(exercise, selectedLeftId, pairId);
    }
  };

  const handleContinue = () => {
    playSoundEffect('tap', soundEnabled);
    if (currentIndex + 1 >= queue.length) {
      const correctFirstTry = Math.max(0, totalInitial - missedFirstTryIds.length);
      const accuracy = calculateAccuracy(correctFirstTry, totalInitial);
      const result = onCompleteLesson({ lesson, mistakes, accuracy });
      setCompletionResult({
        xpEarned: result.xpEarned,
        accuracy,
        nextStreak: result.nextStreak,
      });
      playSoundEffect('complete', soundEnabled);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    resetExerciseState();
  };

  // ================= END-OF-LESSON CELEBRATION SCREEN =================
  if (completionResult) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        {/* Confetti Layer */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
          {CONFETTI_PIECES.map((piece, idx) => (
            <span
              key={idx}
              className={`animate-confetti absolute -top-6 rounded-sm ${piece.size}`}
              style={{
                left: piece.left,
                backgroundColor: piece.color,
                ['--confetti-delay' as string]: piece.delay,
                ['--confetti-duration' as string]: piece.duration,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-lg w-full bg-white rounded-3xl border-2 border-stone-200 border-b-4 p-6 sm:p-8 text-center space-y-6"
        >
          <div className="flex justify-center pt-1">
            <SenseiMascot mood="celebrating" size="lg" />
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-extrabold text-[#46A302]">
              {unitTitle} · {lesson.title}
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
              Lesson Complete!
            </h1>
            <p className="text-sm text-stone-600">
              {mistakes === 0
                ? 'Flawless run! You earned a +5 XP accuracy bonus and +1 heart.'
                : 'Great persistence! Every mistake you reviewed strengthened your Japanese.'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="rounded-2xl bg-[#FFF6D6] border-2 border-[#FFC800] border-b-4 p-3.5">
              <p className="text-xs font-extrabold text-[#B27B00]">Total XP</p>
              <p className="mt-1 text-2xl font-extrabold text-[#784F00] font-mono tabular-nums">
                +{completionResult.xpEarned}
              </p>
            </div>
            <div className="rounded-2xl bg-[#E9FCD8] border-2 border-[#58CC02] border-b-4 p-3.5">
              <p className="text-xs font-extrabold text-[#3D8F00]">Accuracy</p>
              <p className="mt-1 text-2xl font-extrabold text-[#2B6600] font-mono tabular-nums">
                {completionResult.accuracy}%
              </p>
            </div>
            <div className="rounded-2xl bg-[#FFF0DB] border-2 border-[#FF9600] border-b-4 p-3.5">
              <p className="text-xs font-extrabold text-[#C76F00]">Streak</p>
              <p className="mt-1 text-2xl font-extrabold text-[#8A4A00] font-mono tabular-nums inline-flex items-center justify-center gap-1">
                <Flame
                  className="w-5 h-5 text-[#FF9600] fill-current animate-flame"
                  aria-hidden="true"
                />
                {completionResult.nextStreak}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playSoundEffect('tap', soundEnabled);
              onExit();
            }}
            className="tactile-btn duo-btn-green w-full py-3.5 px-6 rounded-2xl font-extrabold text-base cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#58CC02]"
          >
            Continue to Path
          </button>
        </motion.div>
      </div>
    );
  }

  // ================= OUT OF HEARTS GATE =================
  if (hearts <= 0) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-white rounded-3xl border-2 border-stone-200 border-b-4 p-6 sm:p-8 text-center space-y-5">
          <div className="flex justify-center">
            <SenseiMascot mood="encouraging" size="lg" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-extrabold text-stone-900">Out of Hearts</h1>
            <p className="text-sm text-stone-600">
              Don’t worry! Refill your 5 hearts to jump right back into this Japanese lesson.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => {
                playSoundEffect('streak', soundEnabled);
                onRefillHearts();
              }}
              className="tactile-btn duo-btn-green w-full py-3 px-5 rounded-2xl font-extrabold text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              Refill 5 Hearts & Resume
            </button>
            <button
              type="button"
              onClick={() => {
                playSoundEffect('tap', soundEnabled);
                onExit();
              }}
              className="tactile-btn w-full py-2.5 px-5 rounded-2xl bg-white border-2 border-stone-200 border-b-4 text-stone-700 font-bold text-sm hover:bg-stone-50 cursor-pointer"
            >
              Return to Learning Path
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= RENDER CURRENT EXERCISE =================
  const renderExerciseContent = (exercise: Exercise) => {
    switch (exercise.type) {
      case 'kana_recognition':
        return renderKanaRecognition(exercise);
      case 'multiple_choice':
        return renderMultipleChoice(exercise);
      case 'matching_pairs':
        return renderMatchingPairs(exercise);
      case 'fill_blank':
        return renderFillBlank(exercise);
    }
  };

  const renderKanaRecognition = (ex: KanaRecognitionExercise) => {
    const isCharPrompt = ex.promptMode === 'char-to-romaji';
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex flex-col items-center justify-center w-40 h-40 sm:w-44 sm:h-44 rounded-3xl bg-white border-2 border-stone-200 border-b-4">
              <span
                className={
                  isCharPrompt
                    ? 'font-jp text-7xl sm:text-8xl font-bold text-stone-900'
                    : 'text-4xl sm:text-5xl font-extrabold text-stone-900'
                }
              >
                {isCharPrompt ? ex.targetChar : ex.targetReading}
              </span>
            </div>

            {/* Normal Speaker + Slow Turtle Controls */}
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  playSoundEffect('tap', soundEnabled);
                  speakJapanese(ex.targetChar, soundEnabled, 0.92);
                }}
                aria-label={`Play pronunciation for ${ex.targetReading}`}
                className="tactile-btn duo-btn-blue w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer"
              >
                <Volume2 className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => {
                  playSoundEffect('tap', soundEnabled);
                  speakJapanese(ex.targetChar, soundEnabled, 0.55);
                }}
                aria-label={`Play slow pronunciation for ${ex.targetReading}`}
                title="Play slowly"
                className="tactile-btn w-12 h-11 rounded-2xl bg-sky-50 text-[#1899D6] border-2 border-[#BAE6FD] border-b-4 hover:bg-sky-100 flex items-center justify-center cursor-pointer"
              >
                <TurtleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {ex.mnemonic && (
            <div className="text-center">
              <button
                type="button"
                aria-expanded={showMnemonic}
                onClick={() => {
                  playSoundEffect('tap', soundEnabled);
                  setShowMnemonic((prev) => !prev);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-[#1899D6] cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" aria-hidden="true" />
                {showMnemonic ? 'Hide memory hint' : 'Show memory hint'}
              </button>
              {showMnemonic && (
                <p className="mt-2 text-sm font-medium text-amber-950 bg-[#FFF6D6] border-2 border-[#FFC800] rounded-2xl px-4 py-2 max-w-md">
                  {ex.mnemonic}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3.5 max-w-lg mx-auto">
          {ex.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            const isRight = feedback !== 'idle' && opt.id === ex.correctOptionId;
            const isWrongSelected =
              feedback === 'wrong' && isSelected && opt.id !== ex.correctOptionId;

            return (
              <button
                key={opt.id}
                type="button"
                disabled={feedback !== 'idle'}
                onClick={() => {
                  playSoundEffect('tap', soundEnabled);
                  setSelectedOptionId(opt.id);
                }}
                aria-pressed={isSelected}
                className={`tactile-btn min-h-[80px] p-4 rounded-2xl border-2 border-b-4 text-center flex flex-col items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1CB0F6] ${
                  isRight
                    ? 'bg-[#D7FFB8] border-[#58CC02] border-b-[#46A302] text-[#2B6600]'
                    : isWrongSelected
                    ? 'bg-[#FFDFE0] border-[#FF4B4B] border-b-[#EA2B2B] text-[#B91C1C] animate-shake'
                    : isSelected
                    ? 'bg-[#DDF4FF] border-[#1CB0F6] border-b-[#1899D6] text-[#146C94]'
                    : 'bg-white border-stone-200 border-b-stone-300 hover:bg-stone-50 text-stone-900'
                }`}
              >
                <span
                  className={
                    isCharPrompt ? 'text-2xl font-extrabold' : 'font-jp text-4xl font-bold'
                  }
                >
                  {opt.label}
                </span>
                {opt.sublabel && (
                  <span className="text-xs font-medium text-stone-500 mt-1">{opt.sublabel}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMultipleChoice = (ex: MultipleChoiceExercise) => {
    return (
      <div className="space-y-6 max-w-xl mx-auto">
        {/* Sensei Speech Bubble */}
        <div className="flex items-center gap-3.5">
          <div className="hidden sm:block shrink-0">
            <SenseiMascot mood={activeMascotMood} size="md" />
          </div>

          <div className="relative flex-1 rounded-2xl bg-white border-2 border-stone-200 border-b-4 p-4 sm:p-5">
            {ex.promptJp ? (
              <JapaneseDisplay
                jp={ex.promptJp}
                scriptMode={scriptMode}
                showRomaji={showRomaji}
                soundEnabled={soundEnabled}
                showSpeaker
                size="lg"
              />
            ) : (
              <p className="text-xl sm:text-2xl font-extrabold text-stone-900">{ex.promptText}</p>
            )}
          </div>
        </div>

        {/* Chunky 3D Answer Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {ex.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            const isRight = feedback !== 'idle' && opt.id === ex.correctOptionId;
            const isWrongSelected =
              feedback === 'wrong' && isSelected && opt.id !== ex.correctOptionId;

            return (
              <button
                key={opt.id}
                type="button"
                disabled={feedback !== 'idle'}
                onClick={() => {
                  playSoundEffect('tap', soundEnabled);
                  if (opt.jp) {
                    speakJapanese(opt.jp.tts || opt.jp.kanji || opt.jp.kana, soundEnabled);
                  }
                  setSelectedOptionId(opt.id);
                }}
                aria-pressed={isSelected}
                className={`tactile-btn min-h-[72px] p-4 rounded-2xl border-2 border-b-4 text-left flex items-center justify-between gap-3 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1CB0F6] ${
                  isRight
                    ? 'bg-[#D7FFB8] border-[#58CC02] border-b-[#46A302] text-[#2B6600]'
                    : isWrongSelected
                    ? 'bg-[#FFDFE0] border-[#FF4B4B] border-b-[#EA2B2B] text-[#B91C1C] animate-shake'
                    : isSelected
                    ? 'bg-[#DDF4FF] border-[#1CB0F6] border-b-[#1899D6] text-[#146C94]'
                    : 'bg-white border-stone-200 border-b-stone-300 hover:bg-stone-50 text-stone-900'
                }`}
              >
                {opt.jp ? (
                  <JapaneseDisplay
                    jp={opt.jp}
                    scriptMode={scriptMode}
                    showRomaji={showRomaji}
                    soundEnabled={soundEnabled}
                    size="md"
                  />
                ) : (
                  <span className="text-base font-extrabold text-stone-900">{opt.label}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMatchingPairs = (ex: MatchingPairsExercise) => {
    const isReadingDrill = ex.pairs.every(
      (p) => p.meaning.trim().toLowerCase() === p.jp.romaji.trim().toLowerCase()
    );

    return (
      <div className="max-w-xl mx-auto space-y-3">
        <p className="text-xs font-bold text-stone-500 text-center tabular-nums">
          Matched {matchedPairIds.length} of {ex.pairs.length} pairs
          {isReadingDrill ? ' · Kana reading check' : ''}
        </p>

        <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
          {/* Left Column: Japanese */}
          <div className="space-y-3" role="group" aria-label="Japanese items">
            {ex.pairs.map((pair) => {
              const isMatched = matchedPairIds.includes(pair.id);
              const isSelected = selectedLeftId === pair.id;
              const isMismatch = mismatchIds?.left === pair.id;

              return (
                <button
                  key={`left-${pair.id}`}
                  type="button"
                  disabled={isMatched || feedback !== 'idle'}
                  onClick={() => handleSelectLeftPair(ex, pair.id)}
                  aria-pressed={isSelected}
                  className={`tactile-btn w-full h-[84px] px-3.5 py-2 rounded-2xl border-2 border-b-4 flex items-center justify-center text-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1CB0F6] ${
                    isMatched
                      ? 'bg-[#E9FCD8] border-[#B8F28B] border-b-[#B8F28B] text-[#46A302] opacity-55 cursor-default'
                      : isMismatch
                      ? 'bg-[#FFDFE0] border-[#FF4B4B] border-b-[#EA2B2B] text-[#B91C1C] animate-shake'
                      : isSelected
                      ? 'bg-[#DDF4FF] border-[#1CB0F6] border-b-[#1899D6] text-stone-900'
                      : 'bg-white border-stone-200 border-b-stone-300 hover:bg-stone-50 text-stone-900'
                  }`}
                >
                  <JapaneseDisplay
                    jp={pair.jp}
                    scriptMode={scriptMode}
                    showRomaji={isReadingDrill ? false : showRomaji}
                    soundEnabled={soundEnabled}
                    size={isReadingDrill ? 'lg' : 'md'}
                    align="center"
                  />
                </button>
              );
            })}
          </div>

          {/* Right Column: English / Romaji meanings */}
          <div className="space-y-3" role="group" aria-label="English meanings">
            {shuffledRightPairs.map((pair) => {
              const isMatched = matchedPairIds.includes(pair.id);
              const isSelected = selectedRightId === pair.id;
              const isMismatch = mismatchIds?.right === pair.id;

              return (
                <button
                  key={`right-${pair.id}`}
                  type="button"
                  disabled={isMatched || feedback !== 'idle'}
                  onClick={() => handleSelectRightPair(ex, pair.id)}
                  aria-pressed={isSelected}
                  className={`tactile-btn w-full h-[84px] px-3.5 py-2 rounded-2xl border-2 border-b-4 flex items-center justify-center text-center font-extrabold text-sm sm:text-base cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1CB0F6] ${
                    isMatched
                      ? 'bg-[#E9FCD8] border-[#B8F28B] border-b-[#B8F28B] text-[#46A302] opacity-55 cursor-default'
                      : isMismatch
                      ? 'bg-[#FFDFE0] border-[#FF4B4B] border-b-[#EA2B2B] text-[#B91C1C] animate-shake'
                      : isSelected
                      ? 'bg-[#DDF4FF] border-[#1CB0F6] border-b-[#1899D6] text-stone-900'
                      : 'bg-white border-stone-200 border-b-stone-300 hover:bg-stone-50 text-stone-900'
                  }`}
                >
                  {pair.meaning}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderFillBlank = (ex: FillBlankExercise) => {
    const selectedOpt = ex.options.find((o) => o.id === selectedOptionId);
    const fullSentenceSpeak = `${ex.beforeBlank.kanji || ex.beforeBlank.kana}${
      selectedOpt?.jp.kanji || selectedOpt?.jp.kana || ''
    }${ex.afterBlank.kanji || ex.afterBlank.kana}`;

    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="rounded-2xl bg-white border-2 border-stone-200 border-b-4 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-stone-500">Meaning: {ex.englishPrompt}</p>
            {fullSentenceSpeak.trim() && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    playSoundEffect('tap', soundEnabled);
                    speakJapanese(fullSentenceSpeak, soundEnabled, 0.92);
                  }}
                  aria-label="Play Japanese sentence"
                  className="tactile-btn duo-btn-blue w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSoundEffect('tap', soundEnabled);
                    speakJapanese(fullSentenceSpeak, soundEnabled, 0.55);
                  }}
                  aria-label="Play Japanese sentence slowly"
                  title="Play slowly"
                  className="tactile-btn w-9 h-9 rounded-xl bg-sky-50 text-[#1899D6] border-2 border-[#BAE6FD] border-b-4 hover:bg-sky-100 flex items-center justify-center cursor-pointer"
                >
                  <TurtleIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-2xl sm:text-3xl font-jp font-bold text-stone-900">
            {ex.beforeBlank.kana && (
              <JapaneseDisplay
                jp={ex.beforeBlank}
                scriptMode={scriptMode}
                showRomaji={showRomaji}
                inline
                size="lg"
              />
            )}

            <span
              className={`inline-flex items-center justify-center min-w-[82px] px-3.5 py-1.5 rounded-2xl border-2 border-dashed transition-colors ${
                selectedOpt
                  ? feedback === 'correct'
                    ? 'bg-[#D7FFB8] border-[#58CC02] border-solid text-[#2B6600]'
                    : feedback === 'wrong'
                    ? 'bg-[#FFDFE0] border-[#FF4B4B] border-solid text-[#B91C1C]'
                    : 'bg-[#DDF4FF] border-[#1CB0F6] border-solid text-stone-900'
                  : 'bg-stone-50 border-stone-300 text-stone-400'
              }`}
            >
              {selectedOpt ? (
                <JapaneseDisplay
                  jp={selectedOpt.jp}
                  scriptMode={scriptMode}
                  showRomaji={showRomaji}
                  inline
                  size="md"
                />
              ) : (
                <span className="text-base font-sans font-bold">___</span>
              )}
            </span>

            {ex.afterBlank.kana && (
              <JapaneseDisplay
                jp={ex.afterBlank}
                scriptMode={scriptMode}
                showRomaji={showRomaji}
                inline
                size="lg"
              />
            )}
          </div>
        </div>

        {/* Selectable Chunky 3D Tile Bank */}
        <div className="grid grid-cols-2 gap-3.5">
          {ex.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            const isRight = feedback !== 'idle' && opt.id === ex.correctOptionId;
            const isWrongSelected =
              feedback === 'wrong' && isSelected && opt.id !== ex.correctOptionId;

            return (
              <button
                key={opt.id}
                type="button"
                disabled={feedback !== 'idle'}
                onClick={() => {
                  playSoundEffect('tap', soundEnabled);
                  speakJapanese(opt.jp.tts || opt.jp.kanji || opt.jp.kana, soundEnabled);
                  setSelectedOptionId(opt.id);
                }}
                aria-pressed={isSelected}
                className={`tactile-btn min-h-[72px] p-4 rounded-2xl border-2 border-b-4 flex items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1CB0F6] ${
                  isRight
                    ? 'bg-[#D7FFB8] border-[#58CC02] border-b-[#46A302] text-[#2B6600]'
                    : isWrongSelected
                    ? 'bg-[#FFDFE0] border-[#FF4B4B] border-b-[#EA2B2B] text-[#B91C1C] animate-shake'
                    : isSelected
                    ? 'bg-[#DDF4FF] border-[#1CB0F6] border-b-[#1899D6] text-stone-900'
                    : 'bg-white border-stone-200 border-b-stone-300 hover:bg-stone-50 text-stone-900'
                }`}
              >
                <JapaneseDisplay
                  jp={opt.jp}
                  scriptMode={scriptMode}
                  showRomaji={showRomaji}
                  soundEnabled={soundEnabled}
                  size="md"
                  align="center"
                />
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const wrongSummary =
    feedback === 'wrong' && currentExercise ? getCorrectAnswerSummary(currentExercise) : null;

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      {/* Top Progress Header */}
      <header className="sticky top-0 z-20 bg-[#FAFAF8]/95 backdrop-blur-xs border-b-2 border-stone-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => {
              playSoundEffect('tap', soundEnabled);
              onExit();
            }}
            aria-label="Exit lesson"
            className="p-2 rounded-xl text-stone-500 hover:bg-stone-200/70 hover:text-stone-900 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>

          {/* Animated Glossy Progress Bar */}
          <div className="flex-1 min-w-0">
            <div
              role="progressbar"
              aria-label="Lesson progress"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-4 w-full rounded-full bg-[#E5E5E5] overflow-hidden"
            >
              <motion.div
                className="relative h-full bg-[#58CC02] rounded-full"
                initial={false}
                animate={{ width: `${Math.max(8, progressPercent)}%` }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <span
                  aria-hidden="true"
                  className="absolute top-1 left-2 right-2 h-1.5 rounded-full bg-white/30"
                />
              </motion.div>
            </div>
          </div>

          {/* Quick Sound Mute Toggle in Top Bar */}
          <button
            type="button"
            onClick={onToggleSound}
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            className={`p-2 rounded-xl border-2 shrink-0 cursor-pointer transition-colors ${
              soundEnabled
                ? 'bg-sky-50 border-[#BAE6FD] text-[#1899D6]'
                : 'bg-stone-100 border-stone-200 text-stone-400'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" aria-hidden="true" />
            ) : (
              <VolumeX className="w-4 h-4" aria-hidden="true" />
            )}
          </button>

          {/* Animated Heart Loss Counter */}
          <div
            key={heartShakeKey}
            className={`inline-flex items-center gap-1.5 text-[#FF4B4B] font-extrabold text-base font-mono tabular-nums shrink-0 ${
              heartShakeKey > 0 ? 'animate-heart-shake' : ''
            }`}
            aria-label={`${hearts} hearts remaining`}
          >
            <Heart className="w-6 h-6 fill-current" aria-hidden="true" />
            <span>{hearts}</span>
          </div>
        </div>

        {/* Inline Script Controls Bar */}
        <div className="max-w-3xl mx-auto px-4 pb-2.5 flex items-center justify-between gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-stone-500 whitespace-nowrap shrink-0">
            {lesson.title} · {currentIndex + 1}/{queue.length}
          </span>
          <ScriptControls
            compact
            showSoundToggle={false}
            scriptMode={scriptMode}
            showRomaji={showRomaji}
            soundEnabled={soundEnabled}
            onChangeScriptMode={onChangeScriptMode}
            onToggleRomaji={onToggleRomaji}
            onToggleSound={onToggleSound}
          />
        </div>
      </header>

      {/* Main Interactive Exercise Stage */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 sm:py-8 pb-36 flex flex-col justify-center">
        {/* Combo Streak Banner */}
        <AnimatePresence>
          {comboBanner && (
            <motion.div
              key={comboCount}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              role="status"
              className="mx-auto mb-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-[#FFF6D6] border-2 border-[#FFC800] border-b-4 text-[#9A6700] text-sm font-extrabold"
            >
              <Flame className="w-4 h-4 text-[#FF9600] fill-current animate-flame" aria-hidden="true" />
              <span>{comboBanner.label}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {currentExercise && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <p className="text-xs font-extrabold text-[#1899D6]">
                {currentExercise.type === 'kana_recognition'
                  ? 'Character Recognition'
                  : currentExercise.type === 'matching_pairs'
                  ? 'Matching Pairs'
                  : currentExercise.type === 'fill_blank'
                  ? 'Fill in the Blank'
                  : 'Translation'}
              </p>
              <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 text-balance">
                {currentExercise.instruction}
              </h1>
            </div>

            {renderExerciseContent(currentExercise)}
          </div>
        )}
      </main>

      {/* Idle Action Footer vs Full-Width Slide-Up Bottom Feedback Drawer */}
      <div className="fixed bottom-0 inset-x-0 z-30">
        <AnimatePresence mode="wait">
          {feedback === 'idle' && (
            <motion.footer
              key="idle-footer"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.16 }}
              className="bg-white border-t-2 border-stone-200"
            >
              <div className="max-w-3xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs font-semibold text-stone-500 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#58CC02] shrink-0" aria-hidden="true" />
                  <span>
                    {currentExercise?.type === 'matching_pairs'
                      ? 'Tap a Japanese card and its matching meaning.'
                      : 'Choose an answer above, then check.'}
                  </span>
                </div>
                {currentExercise?.type !== 'matching_pairs' && (
                  <button
                    type="button"
                    disabled={!selectedOptionId}
                    onClick={handleCheckAnswer}
                    className={`tactile-btn sm:w-auto w-full py-3 px-10 rounded-2xl font-extrabold text-sm whitespace-nowrap shrink-0 ${
                      selectedOptionId
                        ? 'duo-btn-green cursor-pointer'
                        : 'bg-[#E5E5E5] text-stone-400 border-2 border-[#E5E5E5] border-b-4 border-b-[#D4D4D4] cursor-not-allowed'
                    }`}
                  >
                    Check Answer
                  </button>
                )}
              </div>
            </motion.footer>
          )}

          {feedback === 'correct' && currentExercise && (
            <motion.footer
              key="correct-drawer"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              role="status"
              aria-live="polite"
              className="bg-[#D7FFB8] border-t-2 border-[#A5ED6E]"
            >
              <div className="max-w-3xl mx-auto px-4 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="hidden sm:block shrink-0">
                    <SenseiMascot mood={comboCount >= 3 ? 'combo' : 'happy'} size="sm" />
                  </div>
                  <div className="w-11 h-11 rounded-full bg-white text-[#58CC02] flex items-center justify-center shrink-0 border-2 border-[#A5ED6E]">
                    <Check className="w-6 h-6 stroke-[3.5]" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-[#2B6600]">
                      {comboCount >= 5
                        ? 'Unstoppable!'
                        : comboCount >= 3
                        ? 'Awesome streak!'
                        : 'Nicely done!'}
                    </p>
                    <p className="text-sm font-medium text-[#3B7A00]">
                      {currentExercise.explanation}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleContinue}
                  className="tactile-btn duo-btn-green sm:w-auto w-full py-3 px-10 rounded-2xl font-extrabold text-sm cursor-pointer whitespace-nowrap shrink-0"
                >
                  Continue
                </button>
              </div>
            </motion.footer>
          )}

          {feedback === 'wrong' && currentExercise && (
            <motion.footer
              key="wrong-drawer"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              role="alert"
              className="bg-[#FFDFE0] border-t-2 border-[#FFB2B2]"
            >
              <div className="max-w-3xl mx-auto px-4 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="hidden sm:block shrink-0">
                    <SenseiMascot mood="encouraging" size="sm" />
                  </div>
                  <div className="w-11 h-11 rounded-full bg-white text-[#FF4B4B] flex items-center justify-center shrink-0 border-2 border-[#FFB2B2]">
                    <X className="w-6 h-6 stroke-[3.5]" aria-hidden="true" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-base font-extrabold text-[#B91C1C]">
                      Correct solution:
                    </p>
                    {wrongSummary && (
                      <p className="text-sm font-extrabold text-[#991B1B]">
                        <span className="font-jp">{wrongSummary.japanese}</span>
                        {wrongSummary.romaji && <span> · {wrongSummary.romaji}</span>}
                        {wrongSummary.english && <span> — {wrongSummary.english}</span>}
                      </p>
                    )}
                    <p className="text-xs font-medium text-[#B91C1C]/90">
                      {currentExercise.explanation}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleContinue}
                  className="tactile-btn duo-btn-red sm:w-auto w-full py-3 px-10 rounded-2xl font-extrabold text-sm cursor-pointer whitespace-nowrap shrink-0"
                >
                  Continue
                </button>
              </div>
            </motion.footer>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
