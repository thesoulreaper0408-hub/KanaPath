import type {
  DailyGoalOption,
  Lesson,
  LessonNodeStatus,
  ScriptMode,
  Unit,
  UserProgress,
} from '../types/learning';

export const MAX_HEARTS = 5 as const;
export const MAX_COMPLETED_LESSONS = 100;

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(todayIso: string): string {
  const [y, m, d] = todayIso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - 1);
  const year = dt.getUTCFullYear();
  const month = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const day = String(dt.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createDefaultProgress(uid = 'guest', displayName = 'Learner'): UserProgress {
  return {
    uid,
    displayName: displayName.slice(0, 80) || 'Learner',
    xp: 0,
    dailyXp: 0,
    dailyGoal: 50,
    streak: 0,
    lastActiveDate: '',
    hearts: MAX_HEARTS,
    maxHearts: MAX_HEARTS,
    scriptMode: 'furigana',
    showRomaji: true,
    soundEnabled: true,
    completedLessonIds: [],
  };
}

/**
 * Computes completed / active / locked statuses across all lessons in unit order.
 * The first uncompleted lesson is always 'active', all prior completed are 'completed',
 * and all subsequent uncompleted lessons remain 'locked'.
 */
export function getLessonStatuses(
  units: Unit[],
  completedLessonIds: string[]
): Record<string, LessonNodeStatus> {
  const completedSet = new Set(completedLessonIds);
  const statuses: Record<string, LessonNodeStatus> = {};
  let activeAssigned = false;

  for (const unit of units) {
    for (const lesson of unit.lessons) {
      if (completedSet.has(lesson.id)) {
        statuses[lesson.id] = 'completed';
      } else if (!activeAssigned) {
        statuses[lesson.id] = 'active';
        activeAssigned = true;
      } else {
        statuses[lesson.id] = 'locked';
      }
    }
  }

  return statuses;
}

/**
 * Normalizes dailyXp and streak relative to today's YYYY-MM-DD date.
 */
export function getEffectiveDailyStats(
  progress: Pick<UserProgress, 'dailyXp' | 'streak' | 'lastActiveDate'>,
  todayIso: string
): { dailyXp: number; streak: number; isActiveToday: boolean } {
  if (!progress.lastActiveDate) {
    return { dailyXp: 0, streak: 0, isActiveToday: false };
  }

  if (progress.lastActiveDate === todayIso) {
    return {
      dailyXp: progress.dailyXp,
      streak: progress.streak,
      isActiveToday: true,
    };
  }

  const yesterday = getYesterdayDateString(todayIso);
  if (progress.lastActiveDate === yesterday) {
    return {
      dailyXp: 0,
      streak: progress.streak,
      isActiveToday: false,
    };
  }

  // Missed more than one full calendar day -> streak resets to 0
  return {
    dailyXp: 0,
    streak: 0,
    isActiveToday: false,
  };
}

export function calculateAccuracy(correctFirstTry: number, totalQuestions: number): number {
  if (totalQuestions <= 0) return 100;
  const clamped = Math.max(0, Math.min(correctFirstTry, totalQuestions));
  return Math.round((clamped / totalQuestions) * 100);
}

export function calculateLessonXp(
  lesson: Pick<Lesson, 'xpReward'>,
  mistakes: number,
  isReplay: boolean
): number {
  const base = isReplay ? Math.max(10, Math.round(lesson.xpReward * 0.5)) : lesson.xpReward;
  const perfectBonus = mistakes === 0 ? 5 : 0;
  return base + perfectBonus;
}

export function applyLessonCompletion(
  progress: UserProgress,
  lesson: Pick<Lesson, 'id' | 'xpReward'>,
  mistakes: number,
  todayIso: string
): { nextProgress: UserProgress; xpEarned: number } {
  const isReplay = progress.completedLessonIds.includes(lesson.id);
  const xpEarned = calculateLessonXp(lesson, mistakes, isReplay);

  const effective = getEffectiveDailyStats(progress, todayIso);
  const nextDailyXp = effective.dailyXp + xpEarned;

  let nextStreak = effective.streak;
  if (!effective.isActiveToday) {
    nextStreak = effective.streak + 1;
  }

  const nextCompleted = isReplay
    ? [...progress.completedLessonIds]
    : [...progress.completedLessonIds, lesson.id].slice(0, MAX_COMPLETED_LESSONS);

  // Reward a bonus heart on a zero-mistake lesson (capped at maxHearts)
  const nextHearts =
    mistakes === 0 ? Math.min(progress.maxHearts, progress.hearts + 1) : progress.hearts;

  const nextProgress: UserProgress = {
    ...progress,
    xp: progress.xp + xpEarned,
    dailyXp: nextDailyXp,
    streak: nextStreak,
    lastActiveDate: todayIso,
    hearts: nextHearts,
    completedLessonIds: nextCompleted,
  };

  return { nextProgress, xpEarned };
}

export function applyMistakeHeartLoss(progress: UserProgress): UserProgress {
  return {
    ...progress,
    hearts: Math.max(0, progress.hearts - 1),
  };
}

export function applyHeartRefill(progress: UserProgress, amount: number = MAX_HEARTS): UserProgress {
  return {
    ...progress,
    hearts: Math.min(progress.maxHearts, Math.max(0, progress.hearts + amount)),
  };
}

export function calculateMasteryLevel(correctCount: number, incorrectCount: number): number {
  if (correctCount <= 0) return 0;
  const net = correctCount - Math.floor(incorrectCount * 0.5);
  if (net >= 8) return 5;
  if (net >= 6) return 4;
  if (net >= 4) return 3;
  if (net >= 2) return 2;
  return 1;
}

/**
 * Merges guest local progress into a signed-in remote profile without losing completed lessons or XP.
 */
export function mergeProgressRecords(local: UserProgress, remote: UserProgress): UserProgress {
  const mergedCompleted = Array.from(
    new Set([...remote.completedLessonIds, ...local.completedLessonIds])
  ).slice(0, MAX_COMPLETED_LESSONS);

  const latestDate =
    local.lastActiveDate > remote.lastActiveDate ? local.lastActiveDate : remote.lastActiveDate;

  const mergedDailyXp =
    local.lastActiveDate === remote.lastActiveDate
      ? Math.max(local.dailyXp, remote.dailyXp)
      : latestDate === local.lastActiveDate
      ? local.dailyXp
      : remote.dailyXp;

  return {
    ...remote,
    xp: Math.max(remote.xp, local.xp),
    dailyXp: mergedDailyXp,
    streak: Math.max(remote.streak, local.streak),
    lastActiveDate: latestDate,
    hearts: Math.max(remote.hearts, local.hearts),
    completedLessonIds: mergedCompleted,
  };
}

const VALID_ID_REGEX = /^[a-zA-Z0-9_-]+$/;
const VALID_DATE_REGEX = /^(\d{4}-\d{2}-\d{2})?$/;
const VALID_GOALS: DailyGoalOption[] = [20, 50, 100];
const VALID_SCRIPTS: ScriptMode[] = ['kana', 'furigana', 'kanji'];

/**
 * Programmatically enforces all firebase-blueprint.json constraints before writing to Firestore.
 */
export function sanitizeUserProgressForFirestore(progress: UserProgress): UserProgress {
  const safeUid = VALID_ID_REGEX.test(progress.uid) ? progress.uid.slice(0, 128) : 'guest';
  const safeName = (progress.displayName || 'Learner').trim().slice(0, 80) || 'Learner';
  const safeGoal: DailyGoalOption = VALID_GOALS.includes(progress.dailyGoal)
    ? progress.dailyGoal
    : 50;
  const safeScript: ScriptMode = VALID_SCRIPTS.includes(progress.scriptMode)
    ? progress.scriptMode
    : 'furigana';
  const safeDate = VALID_DATE_REGEX.test(progress.lastActiveDate) ? progress.lastActiveDate : '';
  const safeCompleted = Array.from(
    new Set(
      progress.completedLessonIds.filter(
        (id) => typeof id === 'string' && id.length > 0 && id.length <= 64 && VALID_ID_REGEX.test(id)
      )
    )
  ).slice(0, MAX_COMPLETED_LESSONS);

  return {
    uid: safeUid,
    displayName: safeName,
    xp: Math.max(0, Math.min(1_000_000, Math.floor(progress.xp || 0))),
    dailyXp: Math.max(0, Math.min(50_000, Math.floor(progress.dailyXp || 0))),
    dailyGoal: safeGoal,
    streak: Math.max(0, Math.min(10_000, Math.floor(progress.streak || 0))),
    lastActiveDate: safeDate,
    hearts: Math.max(0, Math.min(MAX_HEARTS, Math.floor(progress.hearts ?? MAX_HEARTS))),
    maxHearts: MAX_HEARTS,
    scriptMode: safeScript,
    showRomaji: Boolean(progress.showRomaji),
    soundEnabled: Boolean(progress.soundEnabled),
    completedLessonIds: safeCompleted,
  };
}
