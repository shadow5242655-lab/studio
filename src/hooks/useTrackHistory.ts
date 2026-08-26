import { useEffect, useRef } from "react";
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  runTransaction,
  serverTimestamp,
  increment,
} from "firebase/firestore";

/**
 * Hook: useTrackHistory
 * - Records when a track starts (on mount / songId change)
 * - On unmount or when songId changes, saves a history entry to Firestore's `userHistory` collection
 *   with duration (seconds) and completed: boolean (default threshold: 30s)
 * - Also increments `playCount` on the `songs/{songId}` document.
 *
 * Usage:
 *   useTrackHistory(userId, songId, { completedThresholdSeconds: 30 })
 *
 * Notes:
 * - This uses the Firebase client SDK and expects client-side env vars prefixed with NEXT_PUBLIC_
 *   (e.g. NEXT_PUBLIC_FIREBASE_PROJECT_ID). In Next.js, ensure these are exposed to the browser.
 * - The hook is resilient to missing env/config — it will log errors instead of throwing during render.
 */

type Options = { completedThresholdSeconds?: number };

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!getApps().length) {
  try {
    // Don't throw if config is incomplete; allow dev-time graceful failure and logging.
    if (firebaseConfig.projectId) {
      initializeApp(firebaseConfig);
    }
  } catch (e) {
    // initialization failures will be surfaced when trying to use Firestore below
    // but don't break rendering
    // eslint-disable-next-line no-console
    console.warn("Firebase initializeApp warning:", e);
  }
}

const db = getFirestore();

export default function useTrackHistory(
  userId?: string | null,
  songId?: string | null,
  options?: Options
) {
  const startRef = useRef<number | null>(null);
  const startedSongRef = useRef<string | null>(null);
  const opts = { completedThresholdSeconds: 30, ...(options || {}) };

  // Helper to persist the previous track's listening record and increment playCount
  async function persistPreviousIfAny() {
    const startedAtMs = startRef.current;
    const prevSongId = startedSongRef.current;

    // reset refs immediately so repeated calls don't double-write
    startRef.current = null;
    startedSongRef.current = null;

    if (!userId || !prevSongId || !startedAtMs) return;

    const endedAtMs = Date.now();
    const durationSeconds = Math.max(0, (endedAtMs - startedAtMs) / 1000);
    const completed = durationSeconds >= (opts.completedThresholdSeconds || 30);

    try {
      // 1) Save history entry
      const historyCol = collection(db, "userHistory");
      await addDoc(historyCol, {
        userId,
        songId: prevSongId,
        duration: durationSeconds,
        completed,
        startedAt: new Date(startedAtMs).toISOString(),
        endedAt: new Date(endedAtMs).toISOString(),
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to write userHistory entry", err);
    }

    try {
      // 2) Increment playCount on songs/{songId} using a transaction to be safe
      const songRef = doc(db, "songs", prevSongId);
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(songRef);
        if (snap.exists()) {
          // use increment to avoid race conditions
          tx.update(songRef, { playCount: increment(1) });
        } else {
          // create the doc with playCount = 1 if it doesn't exist
          tx.set(songRef, { playCount: 1 }, { merge: true });
        }
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to increment song playCount", err);
    }
  }

  // Start or restart timer when songId changes to a new non-null value
  useEffect(() => {
    // If there's an already-started song and it's different, persist it first
    if (startedSongRef.current && startedSongRef.current !== songId) {
      // Fire-and-forget the persist; we don't want to block render or cause state updates
      void persistPreviousIfAny();
    }

    // If valid userId and songId, start timing
    if (userId && songId) {
      startRef.current = Date.now();
      startedSongRef.current = songId;
    } else {
      // if no valid params, clear any stored start
      startRef.current = null;
      startedSongRef.current = null;
    }

    return () => {
      // On cleanup (component unmount or deps change), persist the previous play
      void persistPreviousIfAny();
    };
    // We intentionally include only userId and songId here; options are treated as static for simplicity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, songId]);
}
