import { Cloud, CloudOff, Flame, Heart, LogIn, LogOut, RotateCcw, Trophy } from 'lucide-react';
import { findLessonById } from '../data/curriculum';
import type { DailyGoalOption, LessonAttemptRecord, UserProgress } from '../types/learning';

interface ProfileViewProps {
  progress: UserProgress;
  effectiveDailyXp: number;
  effectiveStreak: number;
  attempts: LessonAttemptRecord[];
  isSignedIn: boolean;
  userEmail: string | null;
  authLoading: boolean;
  authError: string | null;
  onSignIn: () => void;
  onSignOut: () => void;
  onChangeDailyGoal: (goal: DailyGoalOption) => void;
  onRefillHearts: () => void;
}

const DAILY_GOALS: Array<{ xp: DailyGoalOption; label: string; desc: string }> = [
  { xp: 20, label: 'Casual', desc: '20 XP / day' },
  { xp: 50, label: 'Regular', desc: '50 XP / day' },
  { xp: 100, label: 'Dedicated', desc: '100 XP / day' },
];

export function ProfileView({
  progress,
  effectiveDailyXp,
  effectiveStreak,
  attempts,
  isSignedIn,
  userEmail,
  authLoading,
  authError,
  onSignIn,
  onSignOut,
  onChangeDailyGoal,
  onRefillHearts,
}: ProfileViewProps) {
  const dailyPct = Math.min(100, Math.round((effectiveDailyXp / progress.dailyGoal) * 100));

  return (
    <div className="space-y-6 pb-10">
      <div>
        <p className="text-xs font-semibold text-emerald-700">Learner Profile & Cloud Sync</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-0.5">
          {progress.displayName}
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Track your Japanese XP, daily streak, hearts, and persistent Firestore account sync.
        </p>
      </div>

      {/* Cloud Sync Card */}
      <section className="rounded-2xl bg-white border border-stone-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isSignedIn ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-600'
            }`}
          >
            {isSignedIn ? (
              <Cloud className="w-5 h-5" aria-hidden="true" />
            ) : (
              <CloudOff className="w-5 h-5" aria-hidden="true" />
            )}
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-900">
              {isSignedIn ? 'Synced to Firebase Cloud Database' : 'Saving locally on this device'}
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              {isSignedIn
                ? `Signed in as ${userEmail || progress.displayName}. Your XP, streak, and completed lessons sync automatically.`
                : 'Sign in with Google to back up your Japanese progress to Firestore across devices.'}
            </p>
            {authError && <p className="text-xs text-rose-600 font-medium mt-1">{authError}</p>}
          </div>
        </div>

        {isSignedIn ? (
          <button
            type="button"
            disabled={authLoading}
            onClick={onSignOut}
            className="tactile-btn inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-stone-100 border-2 border-stone-200 border-b-4 text-stone-800 text-xs font-extrabold hover:bg-stone-200 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Sign Out
          </button>
        ) : (
          <button
            type="button"
            disabled={authLoading}
            onClick={onSignIn}
            className="tactile-btn duo-btn-green inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap shrink-0 cursor-pointer"
          >
            <LogIn className="w-4 h-4" aria-hidden="true" />
            {authLoading ? 'Connecting...' : 'Sign in with Google'}
          </button>
        )}
      </section>

      {/* Core Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border-2 border-stone-200 border-b-4 p-5">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
            <span>Total XP</span>
            <Trophy className="w-4 h-4 text-[#FFC800]" aria-hidden="true" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-stone-900 font-mono tabular-nums">
            {progress.xp}
          </p>
          <p className="mt-1 text-xs text-stone-500 tabular-nums">
            {progress.completedLessonIds.length} of 15 lessons mastered
          </p>
        </div>

        <div className="rounded-2xl bg-white border-2 border-stone-200 border-b-4 p-5">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
            <span>Current Streak</span>
            <Flame className="w-4 h-4 text-[#FF9600] fill-current" aria-hidden="true" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-stone-900 font-mono tabular-nums">
            {effectiveStreak} {effectiveStreak === 1 ? 'day' : 'days'}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            {effectiveDailyXp > 0 ? 'Streak secured for today' : 'Complete a lesson today'}
          </p>
        </div>

        <div className="rounded-2xl bg-white border-2 border-stone-200 border-b-4 p-5">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
            <span>Hearts</span>
            <Heart className="w-4 h-4 text-[#FF4B4B] fill-current" aria-hidden="true" />
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <p className="text-3xl font-extrabold text-stone-900 font-mono tabular-nums">
              {progress.hearts}/{progress.maxHearts}
            </p>
            {progress.hearts < progress.maxHearts && (
              <button
                type="button"
                onClick={onRefillHearts}
                className="inline-flex items-center gap-1 text-xs font-extrabold text-[#1899D6] hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                Refill
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-stone-500">Perfect lessons restore +1 heart</p>
        </div>
      </div>

      {/* Daily XP Goal Selector */}
      <section className="rounded-2xl bg-white border-2 border-stone-200 border-b-4 p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-stone-900">Daily XP Goal</h2>
            <p className="text-xs text-stone-500 mt-0.5 tabular-nums">
              Today’s progress: {effectiveDailyXp} / {progress.dailyGoal} XP ({dailyPct}%)
            </p>
          </div>
        </div>

        <div className="h-3.5 w-full rounded-full bg-[#E5E5E5] overflow-hidden">
          <div
            className="h-full bg-[#FFC800] rounded-full transition-all duration-300"
            style={{ width: `${dailyPct}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {DAILY_GOALS.map((g) => {
            const active = progress.dailyGoal === g.xp;
            return (
              <button
                key={g.xp}
                type="button"
                onClick={() => onChangeDailyGoal(g.xp)}
                aria-pressed={active}
                className={`tactile-btn p-3 rounded-2xl border-2 border-b-4 text-left cursor-pointer transition-colors ${
                  active
                    ? 'bg-[#E9FCD8] border-[#58CC02] border-b-[#46A302] text-[#2B6600]'
                    : 'bg-white border-stone-200 border-b-stone-300 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <p className="text-sm font-extrabold">{g.label}</p>
                <p className="text-xs text-stone-500 font-mono tabular-nums">{g.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Recent Lesson History */}
      <section className="rounded-2xl bg-white border border-stone-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-200">
          <h2 className="text-base font-bold text-stone-900">Recent Lessons</h2>
        </div>

        {attempts.length === 0 ? (
          <div className="p-6 text-center text-sm text-stone-500">
            No completed lessons yet. Start Lesson 1 on the Learn tab to record your first session.
          </div>
        ) : (
          <ul className="divide-y divide-stone-100">
            {attempts.slice(0, 8).map((att) => {
              const info = findLessonById(att.lessonId);
              return (
                <li
                  key={att.attemptId}
                  className="px-5 py-3.5 flex items-center justify-between gap-4 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-stone-900 truncate">
                      {info ? info.lesson.title : att.lessonId}
                    </p>
                    <p className="text-xs text-stone-500">
                      {info ? info.unit.title : att.unitId} · Accuracy {att.accuracy}%
                    </p>
                  </div>
                  <span className="font-mono font-bold text-amber-700 tabular-nums shrink-0">
                    +{att.xpEarned} XP
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
