# KanaPath Firestore Security Specification (Phase 0)

## 1. Data Invariants
1. **Strict Ownership Isolation**: Every document under `/users/{userId}`, `/users/{userId}/lessonAttempts/{attemptId}`, and `/users/{userId}/itemMastery/{itemId}` belongs exclusively to `userId` (`request.auth.uid == userId`). No user can read, list, create, update, or delete another user's progress.
2. **Verified Identity**: All writes require `request.auth != null && request.auth.token.email_verified == true`.
3. **Master Gate Relational Sync**: Subcollections (`lessonAttempts`, `itemMastery`) verify that the parent `/users/{userId}` document exists and matches `request.auth.uid`.
4. **Immutable Audit Trail**: `lessonAttempts` are append-only (no client updates or deletes). `createdAt` and `uid` on `/users/{userId}` are immutable after creation.
5. **Action-Based Updates & Strict Keys**: Updates to `/users/{userId}` are restricted to explicit allowlisted actions (`updatePreferences`, `updateHearts`, `completeLesson`) via `affectedKeys().hasOnly(...)` wrapped by `isValidUserProgress(incoming())`.
6. **Temporal & Volumetric Integrity**: All timestamps must equal `request.time`. All IDs match `^[a-zA-Z0-9_-]+$` (max 128 chars), strings have explicit `.size()` caps, and `completedLessonIds` is bounded to `<= 100` items.

## 2. The "Dirty Dozen" Adversarial Payloads (Must All Return PERMISSION_DENIED)
1. **Cross-User Read**: User B attempts `get` on `/users/userA`.
2. **Unverified Write**: User A with `email_verified: false` attempts `create` on `/users/userA`.
3. **Identity Spoofing**: User A attempts `create` on `/users/userA` with `{ uid: "userB", ... }`.
4. **Shadow Field Injection**: User A attempts `create` or `update` with extra ghost key `isAdmin: true`.
5. **Client Timestamp Spoofing**: User A sets `createdAt` or `updatedAt` to a past/future timestamp instead of `request.time`.
6. **Path Variable Poisoning**: User A writes to `/users/userA/lessonAttempts/bad id with spaces and $$$`.
7. **Value Poisoning on Hearts**: User A updates `hearts: 999` (exceeds max 5) or `hearts: "five"`.
8. **Invalid Script Mode**: User A updates `scriptMode: "romaji_only"` (not in `['kana', 'furigana', 'kanji']`).
9. **Array Exhaustion**: User A sends `completedLessonIds` with 101 elements.
10. **Immutable Field Mutation**: User A attempts to change `uid` or `createdAt` during an update.
11. **Attempt Tampering**: User A attempts `update` or `delete` on an existing `/users/userA/lessonAttempts/{attemptId}`.
12. **Blanket Collection Scrape**: User A attempts `list` on `/users` or queries `/users/userB/lessonAttempts`.
