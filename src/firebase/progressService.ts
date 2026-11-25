import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config';
import type {
  DailyGoalOption,
  ItemMasteryRecord,
  LessonAttemptRecord,
  ScriptMode,
  UserProgress,
  VocabKind,
} from '../types/learning';
import {
  calculateMasteryLevel,
  createDefaultProgress,
  mergeProgressRecords,
  sanitizeUserProgressForFirestore,
} from '../utils/progression';

const LOCAL_PROGRESS_KEY = 'kanapath_progress_v1';
const LOCAL_ATTEMPTS_KEY = 'kanapath_attempts_v1';
const LOCAL_MASTERY_KEY = 'kanapath_mastery_v1';

export function loadLocalProgress(): UserProgress {
  if (typeof window === 'undefined') return createDefaultProgress();
  try {
    const raw = window.localStorage.getItem(LOCAL_PROGRESS_KEY);
    if (!raw) return createDefaultProgress();
    const parsed = JSON.parse(raw) as Partial<UserProgress>;
    return sanitizeUserProgressForFirestore({
      ...createDefaultProgress(),
      ...parsed,
      uid: 'guest',
    });
  } catch {
    return createDefaultProgress();
  }
}

export function saveLocalProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadLocalAttempts(): LessonAttemptRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_ATTEMPTS_KEY);
    return raw ? (JSON.parse(raw) as LessonAttemptRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalAttempts(attempts: LessonAttemptRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_ATTEMPTS_KEY, JSON.stringify(attempts.slice(0, 30)));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadLocalMastery(): Record<string, ItemMasteryRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(LOCAL_MASTERY_KEY);
    return raw ? (JSON.parse(raw) as Record<string, ItemMasteryRecord>) : {};
  } catch {
    return {};
  }
}

export function saveLocalMastery(mastery: Record<string, ItemMasteryRecord>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_MASTERY_KEY, JSON.stringify(mastery));
  } catch {
    // Ignore storage quota errors
  }
}

function docDataToUserProgress(uid: string, data: Record<string, unknown>): UserProgress {
  return sanitizeUserProgressForFirestore({
    uid,
    displayName: typeof data.displayName === 'string' ? data.displayName : 'Learner',
    xp: typeof data.xp === 'number' ? data.xp : 0,
    dailyXp: typeof data.dailyXp === 'number' ? data.dailyXp : 0,
    dailyGoal: (data.dailyGoal === 20 || data.dailyGoal === 50 || data.dailyGoal === 100
      ? data.dailyGoal
      : 50) as DailyGoalOption,
    streak: typeof data.streak === 'number' ? data.streak : 0,
    lastActiveDate: typeof data.lastActiveDate === 'string' ? data.lastActiveDate : '',
    hearts: typeof data.hearts === 'number' ? data.hearts : 5,
    maxHearts: 5,
    scriptMode: (data.scriptMode === 'kana' ||
    data.scriptMode === 'furigana' ||
    data.scriptMode === 'kanji'
      ? data.scriptMode
      : 'furigana') as ScriptMode,
    showRomaji: typeof data.showRomaji === 'boolean' ? data.showRomaji : true,
    soundEnabled: typeof data.soundEnabled === 'boolean' ? data.soundEnabled : true,
    completedLessonIds: Array.isArray(data.completedLessonIds)
      ? data.completedLessonIds.filter((v): v is string => typeof v === 'string')
      : [],
  });
}

export async function ensureAndMergeRemoteProfile(
  uid: string,
  displayName: string,
  localProgress: UserProgress
): Promise<UserProgress> {
  const path = `users/${uid}`;
  const userRef = doc(db, 'users', uid);

  let snap;
  try {
    snap = await getDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  if (!snap.exists()) {
    const initial = sanitizeUserProgressForFirestore({
      ...localProgress,
      uid,
      displayName: displayName || localProgress.displayName || 'Learner',
    });
    try {
      await setDoc(userRef, {
        ...initial,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
    return initial;
  }

  const remote = docDataToUserProgress(uid, snap.data());
  const merged = sanitizeUserProgressForFirestore(mergeProgressRecords(localProgress, remote));

  const hasNewProgress =
    merged.xp !== remote.xp ||
    merged.dailyXp !== remote.dailyXp ||
    merged.streak !== remote.streak ||
    merged.completedLessonIds.length !== remote.completedLessonIds.length;

  if (hasNewProgress) {
    try {
      await updateDoc(userRef, {
        xp: merged.xp,
        dailyXp: merged.dailyXp,
        streak: merged.streak,
        lastActiveDate: merged.lastActiveDate,
        hearts: merged.hearts,
        completedLessonIds: merged.completedLessonIds,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  return merged;
}

export function subscribeToRemoteProgress(
  uid: string,
  onChange: (progress: UserProgress) => void
): Unsubscribe {
  const path = `users/${uid}`;
  return onSnapshot(
    doc(db, 'users', uid),
    (snapshot) => {
      if (snapshot.exists()) {
        onChange(docDataToUserProgress(uid, snapshot.data()));
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeToRemoteAttempts(
  uid: string,
  onChange: (attempts: LessonAttemptRecord[]) => void
): Unsubscribe {
  const path = `users/${uid}/lessonAttempts`;
  const q = query(
    collection(db, 'users', uid, 'lessonAttempts'),
    where('userId', '==', uid),
    orderBy('completedAt', 'desc'),
    limit(20)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const items: LessonAttemptRecord[] = snapshot.docs.map((d) => {
        const data = d.data();
        const ts = data.completedAt as { toDate?: () => Date } | undefined;
        return {
          attemptId: typeof data.attemptId === 'string' ? data.attemptId : d.id,
          userId: uid,
          lessonId: typeof data.lessonId === 'string' ? data.lessonId : '',
          unitId: typeof data.unitId === 'string' ? data.unitId : '',
          xpEarned: typeof data.xpEarned === 'number' ? data.xpEarned : 0,
          accuracy: typeof data.accuracy === 'number' ? data.accuracy : 100,
          mistakes: typeof data.mistakes === 'number' ? data.mistakes : 0,
          completedAtIso: ts?.toDate ? ts.toDate().toISOString() : new Date().toISOString(),
        };
      });
      onChange(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToRemoteMastery(
  uid: string,
  onChange: (mastery: Record<string, ItemMasteryRecord>) => void
): Unsubscribe {
  const path = `users/${uid}/itemMastery`;
  const q = query(
    collection(db, 'users', uid, 'itemMastery'),
    where('userId', '==', uid),
    limit(150)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const map: Record<string, ItemMasteryRecord> = {};
      for (const d of snapshot.docs) {
        const data = d.data();
        const itemId = typeof data.itemId === 'string' ? data.itemId : d.id;
        map[itemId] = {
          itemId,
          userId: uid,
          kind: (data.kind as VocabKind) || 'vocab',
          correctCount: typeof data.correctCount === 'number' ? data.correctCount : 0,
          incorrectCount: typeof data.incorrectCount === 'number' ? data.incorrectCount : 0,
          masteryLevel: typeof data.masteryLevel === 'number' ? data.masteryLevel : 0,
        };
      }
      onChange(map);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function updateRemotePreferences(
  uid: string,
  prefs: Partial<Pick<UserProgress, 'scriptMode' | 'showRomaji' | 'soundEnabled' | 'dailyGoal'>>
): Promise<void> {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...prefs,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateRemoteHearts(uid: string, hearts: number): Promise<void> {
  const path = `users/${uid}`;
  const safeHearts = Math.max(0, Math.min(5, Math.floor(hearts)));
  try {
    await updateDoc(doc(db, 'users', uid), {
      hearts: safeHearts,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function persistRemoteLessonCompletion(
  uid: string,
  nextProgress: UserProgress,
  attempt: Omit<LessonAttemptRecord, 'completedAtIso'>
): Promise<void> {
  const clean = sanitizeUserProgressForFirestore({ ...nextProgress, uid });
  const userPath = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      xp: clean.xp,
      dailyXp: clean.dailyXp,
      streak: clean.streak,
      lastActiveDate: clean.lastActiveDate,
      hearts: clean.hearts,
      completedLessonIds: clean.completedLessonIds,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, userPath);
  }

  const attemptPath = `users/${uid}/lessonAttempts/${attempt.attemptId}`;
  try {
    await setDoc(doc(db, 'users', uid, 'lessonAttempts', attempt.attemptId), {
      attemptId: attempt.attemptId,
      userId: uid,
      lessonId: attempt.lessonId,
      unitId: attempt.unitId,
      xpEarned: Math.max(0, Math.min(500, Math.floor(attempt.xpEarned))),
      accuracy: Math.max(0, Math.min(100, Math.floor(attempt.accuracy))),
      mistakes: Math.max(0, Math.min(100, Math.floor(attempt.mistakes))),
      completedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, attemptPath);
  }
}

export async function upsertRemoteItemMastery(
  uid: string,
  itemId: string,
  kind: VocabKind,
  existing: ItemMasteryRecord | undefined,
  wasCorrect: boolean
): Promise<ItemMasteryRecord> {
  const correctCount = Math.min(10_000, (existing?.correctCount ?? 0) + (wasCorrect ? 1 : 0));
  const incorrectCount = Math.min(10_000, (existing?.incorrectCount ?? 0) + (wasCorrect ? 0 : 1));
  const masteryLevel = calculateMasteryLevel(correctCount, incorrectCount);

  const record: ItemMasteryRecord = {
    itemId,
    userId: uid,
    kind,
    correctCount,
    incorrectCount,
    masteryLevel,
  };

  const path = `users/${uid}/itemMastery/${itemId}`;
  try {
    await setDoc(doc(db, 'users', uid, 'itemMastery', itemId), {
      ...record,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }

  return record;
}
