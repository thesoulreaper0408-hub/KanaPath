import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import {
  BookOpen,
  Cloud,
  Compass,
  Flame,
  Heart,
  Languages,
  LogIn,
  RotateCcw,
  Trophy,
  User as UserIcon,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CURRICULUM_UNITS, VOCAB_GRAMMAR_ITEMS, findLessonById } from './data/curriculum';
import { auth, googleProvider } from './firebase/config';
import {
  ensureAndMergeRemoteProfile,
  loadLocalAttempts,
  loadLocalMastery,
  loadLocalProgress,
  persistRemoteLessonCompletion,
  saveLocalAttempts,
  saveLocalMastery,
  saveLocalProgress,
  subscribeToRemoteAttempts,
  subscribeToRemoteMastery,
  subscribeToRemoteProgress,
  updateRemoteHearts,
  updateRemotePreferences,
  upsertRemoteItemMastery,
} from './firebase/progressService';
import type {
  DailyGoalOption,
  ItemMasteryRecord,
  Lesson,
  LessonAttemptRecord,
  ScriptMode,
  UserProgress,
  VocabKind,
} from './types/learning';
import {
  applyHeartRefill,
  applyLessonCompletion,
  applyMistakeHeartLoss,
  calculateMasteryLevel,
  getEffectiveDailyStats,
  getLessonStatuses,
  getLocalDateString,
} from './utils/progression';
import { ErrorBoundary } from './components/ErrorBoundary';
import { KanaChartView } from './components/KanaChartView';
import { LearningPathView } from './components/LearningPathView';
import { LessonPlayer } from './components/LessonPlayer';
import { ProfileView } from './components/ProfileView';
import { ScriptControls } from './components/ScriptControls';
import { VocabLibraryView } from './components/VocabLibraryView';

type NavTab = 'learn' | 'kana' | 'library' | 'profile';

const NAV_ITEMS: Array<{ id: NavTab; label: string; icon: typeof Compass }> = [
  { id: 'learn', label: 'Learn', icon: Compass },
  { id: 'kana', label: 'Kana Chart', icon: Languages },
  { id: 'library', label: 'Vocab & Grammar', icon: BookOpen },
  { id: 'profile', label: 'Profile', icon: UserIcon },
];

function inferItemKind(itemId: string): VocabKind {
  if (itemId.startsWith('h-')) return 'hiragana';
  if (itemId.startsWith('k-')) return 'katakana';
  const found = VOCAB_GRAMMAR_ITEMS.find((i) => i.id === itemId);
  return found ? found.kind : 'vocab';
}

function KanaPathApp() {
  const [activeTab, setActiveTab] = useState<NavTab>('learn');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [progress, setProgress] = useState<UserProgress>(() => loadLocalProgress());
  const [attempts, setAttempts] = useState<LessonAttemptRecord[]>(() => loadLocalAttempts());
  const [mastery, setMastery] = useState<Record<string, ItemMasteryRecord>>(() =>
    loadLocalMastery()
  );

  // Sync Firebase Authentication & Firestore live listeners
  useEffect(() => {
    let unsubProgress: (() => void) | null = null;
    let unsubAttempts: (() => void) | null = null;
    let unsubMastery: (() => void) | null = null;

    const cleanupListeners = () => {
      unsubProgress?.();
      unsubAttempts?.();
      unsubMastery?.();
      unsubProgress = null;
      unsubAttempts = null;
      unsubMastery = null;
    };

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      cleanupListeners();
      setFirebaseUser(user);

      if (!user) {
        setProgress(loadLocalProgress());
        setAttempts(loadLocalAttempts());
        setMastery(loadLocalMastery());
        return;
      }

      try {
        const local = loadLocalProgress();
        const merged = await ensureAndMergeRemoteProfile(
          user.uid,
          user.displayName || 'Learner',
          local
        );
        setProgress(merged);
        saveLocalProgress(merged);

        unsubProgress = subscribeToRemoteProgress(user.uid, (remote) => {
          setProgress(remote);
          saveLocalProgress(remote);
        });
        unsubAttempts = subscribeToRemoteAttempts(user.uid, (remoteAttempts) => {
          setAttempts(remoteAttempts);
          saveLocalAttempts(remoteAttempts);
        });
        unsubMastery = subscribeToRemoteMastery(user.uid, (remoteMastery) => {
          setMastery(remoteMastery);
          saveLocalMastery(remoteMastery);
        });
      } catch (err) {
        console.error('Failed to sync Firestore profile:', err);
      }
    });

    return () => {
      cleanupListeners();
      unsubAuth();
    };
  }, []);

  const todayIso = getLocalDateString();
  const effectiveDaily = useMemo(
    () => getEffectiveDailyStats(progress, todayIso),
    [progress, todayIso]
  );
  const statuses = useMemo(
    () => getLessonStatuses(CURRICULUM_UNITS, progress.completedLessonIds),
    [progress.completedLessonIds]
  );

  const handleSignIn = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to sign in right now.';
      if (!msg.includes('popup-closed-by-user')) {
        setAuthError('Sign-in did not complete. Your progress stays saved locally.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      await signOut(auth);
    } finally {
      setAuthLoading(false);
    }
  };

  const updatePreferences = (
    patch: Partial<Pick<UserProgress, 'scriptMode' | 'showRomaji' | 'soundEnabled' | 'dailyGoal'>>
  ) => {
    setProgress((prev) => {
      const next = { ...prev, ...patch };
      saveLocalProgress(next);
      return next;
    });
    if (firebaseUser) {
      void updateRemotePreferences(firebaseUser.uid, patch);
    }
  };

  const handleChangeScriptMode = (scriptMode: ScriptMode) => updatePreferences({ scriptMode });
  const handleToggleRomaji = () => updatePreferences({ showRomaji: !progress.showRomaji });
  const handleToggleSound = () => updatePreferences({ soundEnabled: !progress.soundEnabled });
  const handleChangeDailyGoal = (dailyGoal: DailyGoalOption) => updatePreferences({ dailyGoal });

  const handleLoseHeart = () => {
    setProgress((prev) => {
      const next = applyMistakeHeartLoss(prev);
      saveLocalProgress(next);
      if (firebaseUser) {
        void updateRemoteHearts(firebaseUser.uid, next.hearts);
      }
      return next;
    });
  };

  const handleRefillHearts = () => {
    setProgress((prev) => {
      const next = applyHeartRefill(prev, 5);
      saveLocalProgress(next);
      if (firebaseUser) {
        void updateRemoteHearts(firebaseUser.uid, next.hearts);
      }
      return next;
    });
  };

  const handleRecordItemResult = (itemIds: string[], wasCorrect: boolean) => {
    setMastery((prev) => {
      const next = { ...prev };
      for (const itemId of itemIds) {
        const existing = next[itemId];
        const kind = inferItemKind(itemId);
        const correctCount = (existing?.correctCount ?? 0) + (wasCorrect ? 1 : 0);
        const incorrectCount = (existing?.incorrectCount ?? 0) + (wasCorrect ? 0 : 1);
        const updatedRecord: ItemMasteryRecord = {
          itemId,
          userId: firebaseUser?.uid || 'guest',
          kind,
          correctCount,
          incorrectCount,
          masteryLevel: calculateMasteryLevel(correctCount, incorrectCount),
        };
        next[itemId] = updatedRecord;

        if (firebaseUser) {
          void upsertRemoteItemMastery(firebaseUser.uid, itemId, kind, existing, wasCorrect);
        }
      }
      saveLocalMastery(next);
      return next;
    });
  };

  const handleCompleteLesson = ({
    lesson,
    mistakes,
    accuracy,
  }: {
    lesson: Lesson;
    mistakes: number;
    accuracy: number;
  }) => {
    const { nextProgress, xpEarned } = applyLessonCompletion(progress, lesson, mistakes, todayIso);
    setProgress(nextProgress);
    saveLocalProgress(nextProgress);

    const attemptId = `${lesson.id}_${Date.now()}`;
    const newAttempt: LessonAttemptRecord = {
      attemptId,
      userId: firebaseUser?.uid || 'guest',
      lessonId: lesson.id,
      unitId: lesson.unitId,
      xpEarned,
      accuracy,
      mistakes,
      completedAtIso: new Date().toISOString(),
    };

    setAttempts((prev) => {
      const updated = [newAttempt, ...prev].slice(0, 30);
      saveLocalAttempts(updated);
      return updated;
    });

    if (firebaseUser) {
      void persistRemoteLessonCompletion(firebaseUser.uid, nextProgress, {
        attemptId,
        userId: firebaseUser.uid,
        lessonId: lesson.id,
        unitId: lesson.unitId,
        xpEarned,
        accuracy,
        mistakes,
      });
    }

    return { xpEarned, nextStreak: nextProgress.streak };
  };

  // Full-screen interactive Lesson Player mode
  if (activeLesson) {
    const info = findLessonById(activeLesson.id);
    return (
      <LessonPlayer
        lesson={activeLesson}
        unitTitle={info ? info.unit.title : 'Japanese Lesson'}
        hearts={progress.hearts}
        streak={effectiveDaily.streak}
        scriptMode={progress.scriptMode}
        showRomaji={progress.showRomaji}
        soundEnabled={progress.soundEnabled}
        onChangeScriptMode={handleChangeScriptMode}
        onToggleRomaji={handleToggleRomaji}
        onToggleSound={handleToggleSound}
        onLoseHeart={handleLoseHeart}
        onRefillHearts={handleRefillHearts}
        onRecordItemResult={handleRecordItemResult}
        onCompleteLesson={handleCompleteLesson}
        onExit={() => setActiveLesson(null)}
      />
    );
  }

  const dailyPct = Math.min(100, Math.round((effectiveDaily.dailyXp / progress.dailyGoal) * 100));

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-stone-900 flex flex-col lg:flex-row">
      {/* Left Navigation Sidebar (Desktop) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen bg-white border-r-2 border-stone-200 px-4 py-6 justify-between">
        <div className="space-y-8">
          <div className="px-3 flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-2xl bg-[#58CC02] border-b-4 border-[#46A302] text-white font-jp font-bold text-lg flex items-center justify-center shrink-0">
              あ
            </span>
            <span className="text-xl font-extrabold tracking-tight text-[#58CC02] whitespace-nowrap">
              KanaPath
            </span>
          </div>

          <nav aria-label="Primary navigation" className="space-y-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-extrabold whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1CB0F6] ${
                    isActive
                      ? 'bg-[#DDF4FF] text-[#1899D6] border-2 border-[#84D8FF]'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 border-2 border-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Account Sync Quick Footer */}
        <div className="pt-4 border-t-2 border-stone-200 px-1">
          {firebaseUser ? (
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-stone-50 hover:bg-stone-100 border-2 border-stone-200 text-left transition-colors cursor-pointer"
            >
              <Cloud className="w-4 h-4 text-[#58CC02] shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-stone-900 truncate">{progress.displayName}</p>
                <p className="text-[11px] text-stone-500">Cloud synced</p>
              </div>
            </button>
          ) : (
            <button
              type="button"
              disabled={authLoading}
              onClick={handleSignIn}
              className="tactile-btn duo-btn-blue w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-extrabold cursor-pointer whitespace-nowrap"
            >
              <LogIn className="w-4 h-4" aria-hidden="true" />
              {authLoading ? 'Connecting...' : 'Sign in to Sync'}
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Compact Header (strictly <= 7% viewport height) */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b-2 border-stone-200 px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-7 h-7 rounded-xl bg-[#58CC02] border-b-2 border-[#46A302] text-white font-jp font-bold text-sm flex items-center justify-center">
            あ
          </span>
          <span className="text-base font-extrabold tracking-tight text-[#58CC02] whitespace-nowrap">
            KanaPath
          </span>
        </div>

        <div className="flex items-center gap-3.5 text-xs font-extrabold font-mono tabular-nums">
          <span className="inline-flex items-center gap-1 text-[#CC7800]" aria-label={`${effectiveDaily.streak} day streak`}>
            <Flame className="w-4 h-4 text-[#FF9600] fill-current" aria-hidden="true" />
            {effectiveDaily.streak}
          </span>
          <span className="inline-flex items-center gap-1 text-[#B27B00]" aria-label={`${effectiveDaily.dailyXp} daily XP`}>
            <Trophy className="w-4 h-4 text-[#FFC800]" aria-hidden="true" />
            {effectiveDaily.dailyXp}
          </span>
          <span className="inline-flex items-center gap-1 text-[#FF4B4B]" aria-label={`${progress.hearts} hearts`}>
            <Heart className="w-4 h-4 fill-current" aria-hidden="true" />
            {progress.hearts}
          </span>
          <button
            type="button"
            onClick={handleToggleSound}
            aria-label={progress.soundEnabled ? 'Mute audio' : 'Unmute audio'}
            className="p-1.5 rounded-xl bg-stone-100 text-stone-700 cursor-pointer"
          >
            {progress.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#1899D6]" aria-hidden="true" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-400" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      {/* Center Content Workspace */}
      <main className="flex-1 min-w-0 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 lg:pb-10">
        {/* Global Script Display Toolbar */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 pb-3 sm:pb-4 border-b border-stone-200">
          <span className="text-xs font-semibold text-stone-500">
            Japanese Script Display
          </span>
          <ScriptControls
            scriptMode={progress.scriptMode}
            showRomaji={progress.showRomaji}
            soundEnabled={progress.soundEnabled}
            onChangeScriptMode={handleChangeScriptMode}
            onToggleRomaji={handleToggleRomaji}
            onToggleSound={handleToggleSound}
          />
        </div>

        {activeTab === 'learn' && (
          <LearningPathView
            units={CURRICULUM_UNITS}
            statuses={statuses}
            scriptMode={progress.scriptMode}
            showRomaji={progress.showRomaji}
            soundEnabled={progress.soundEnabled}
            hearts={progress.hearts}
            onStartLesson={(lesson) => setActiveLesson(lesson)}
            onRefillHearts={handleRefillHearts}
          />
        )}

        {activeTab === 'kana' && (
          <KanaChartView
            soundEnabled={progress.soundEnabled}
            showRomaji={progress.showRomaji}
            mastery={mastery}
          />
        )}

        {activeTab === 'library' && (
          <VocabLibraryView
            scriptMode={progress.scriptMode}
            showRomaji={progress.showRomaji}
            soundEnabled={progress.soundEnabled}
            completedLessonIds={progress.completedLessonIds}
            mastery={mastery}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            progress={progress}
            effectiveDailyXp={effectiveDaily.dailyXp}
            effectiveStreak={effectiveDaily.streak}
            attempts={attempts}
            isSignedIn={Boolean(firebaseUser)}
            userEmail={firebaseUser?.email ?? null}
            authLoading={authLoading}
            authError={authError}
            onSignIn={handleSignIn}
            onSignOut={handleSignOut}
            onChangeDailyGoal={handleChangeDailyGoal}
            onRefillHearts={handleRefillHearts}
          />
        )}
      </main>

      {/* Right Gamification Sidebar (Desktop) */}
      <aside className="hidden xl:flex xl:flex-col xl:w-80 xl:shrink-0 xl:sticky xl:top-0 xl:h-screen border-l-2 border-stone-200 bg-white px-5 py-6 space-y-6 overflow-y-auto">
        {/* Top Metrics Row */}
        <div className="grid grid-cols-3 gap-2 text-center pb-5 border-b-2 border-stone-200">
          <div className="p-2.5 rounded-2xl bg-[#FFF6D6]/60 border border-[#FFE58F]">
            <Flame className="w-5 h-5 mx-auto text-[#FF9600] fill-current" aria-hidden="true" />
            <p className="mt-1 text-lg font-extrabold text-stone-900 font-mono tabular-nums">
              {effectiveDaily.streak}
            </p>
            <p className="text-[11px] font-bold text-stone-500">Streak</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-[#FFF6D6]/60 border border-[#FFE58F]">
            <Trophy className="w-5 h-5 mx-auto text-[#FFC800]" aria-hidden="true" />
            <p className="mt-1 text-lg font-extrabold text-stone-900 font-mono tabular-nums">
              {progress.xp}
            </p>
            <p className="text-[11px] font-bold text-stone-500">Total XP</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-[#FFDFE0]/50 border border-[#FFC1C1]">
            <Heart className="w-5 h-5 mx-auto text-[#FF4B4B] fill-current" aria-hidden="true" />
            <p className="mt-1 text-lg font-extrabold text-stone-900 font-mono tabular-nums">
              {progress.hearts}/{progress.maxHearts}
            </p>
            <p className="text-[11px] font-bold text-stone-500">Hearts</p>
          </div>
        </div>

        {/* Daily XP Goal Card */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-stone-900">Daily XP Goal</h2>
            <span className="text-xs font-extrabold text-[#B27B00] font-mono tabular-nums">
              {effectiveDaily.dailyXp} / {progress.dailyGoal} XP
            </span>
          </div>
          <div className="h-3.5 w-full rounded-full bg-[#E5E5E5] overflow-hidden">
            <div
              className="h-full bg-[#FFC800] rounded-full transition-all duration-300"
              style={{ width: `${dailyPct}%` }}
            />
          </div>
          <p className="text-xs text-stone-500">
            {dailyPct >= 100
              ? 'Daily goal reached! Fantastic work today.'
              : `${progress.dailyGoal - effectiveDaily.dailyXp} XP left to hit today’s goal.`}
          </p>
        </section>

        {/* Hearts Refill Utility */}
        <section className="pt-4 border-t-2 border-stone-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-stone-900">Hearts</h2>
            <span className="text-xs font-bold text-stone-500 tabular-nums">
              {progress.hearts} of {progress.maxHearts} full
            </span>
          </div>
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {Array.from({ length: progress.maxHearts }).map((_, idx) => (
              <Heart
                key={idx}
                className={`w-6 h-6 ${
                  idx < progress.hearts
                    ? 'text-[#FF4B4B] fill-current'
                    : 'text-stone-200 fill-current'
                }`}
              />
            ))}
          </div>
          {progress.hearts < progress.maxHearts ? (
            <button
              type="button"
              onClick={handleRefillHearts}
              className="tactile-btn duo-btn-red w-full mt-2 py-2.5 px-3 rounded-2xl text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Refill Hearts
            </button>
          ) : (
            <p className="text-xs text-stone-500">
              You have full hearts. Perfect lessons restore lost hearts automatically.
            </p>
          )}
        </section>

        {/* Progressive Reading Tip */}
        <section className="pt-4 border-t-2 border-stone-200 space-y-2">
          <h2 className="text-sm font-extrabold text-stone-900">Reading Progression</h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            Start with <strong>Kana</strong> and <strong>Romaji On</strong>. Once Hiragana feels comfortable, switch to <strong>Furigana</strong> and turn <strong>Romaji Off</strong> to read real Japanese naturally.
          </p>
        </section>
      </aside>

      {/* Mobile Bottom Navigation Bar (compact height ~60px, well under 15% mobile cap) */}
      <nav
        aria-label="Mobile navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t-2 border-stone-200 grid grid-cols-4 px-2 py-1.5"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-2xl text-[11px] font-extrabold cursor-pointer ${
                isActive ? 'text-[#1899D6] bg-[#DDF4FF]' : 'text-stone-500'
              }`}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span className="truncate max-w-full">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <KanaPathApp />
    </ErrorBoundary>
  );
}
