import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  limit as fsLimit,
  getDocs,
  DocumentData,
} from "firebase/firestore";

type HistoryEntry = {
  songId?: string;
  artist?: string;
  genres?: string[] | string;
  mood?: string;
  playedAt?: any;
};

// Initialize Firebase client SDK using environment variables.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

if (!firebaseConfig.projectId) {
  // We intentionally don't throw at import time to keep dev experience smooth, but handler will check.
}

if (!getApps().length) {
  try {
    initializeApp(firebaseConfig);
  } catch (e) {
    // If initialize fails, the handler will surface a clearer error.
    // ignore here to allow runtime checks.
  }
}

const db = getFirestore();

function normalizeGenres(g: string[] | string | undefined): string[] {
  if (!g) return [];
  if (Array.isArray(g)) return g.map((s) => s.toLowerCase().trim());
  return g
    .split(/[,|;\/]+/) // split on common separators
    .map((s) => s.toLowerCase().trim())
    .filter(Boolean);
}

function topNFromCounts(map: Map<string, number>, n = 3): string[] {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map((e) => e[0]);
}

export async function POST(req: Request) {
  try {
    if (!firebaseConfig.projectId) {
      return new Response(JSON.stringify({ error: "Firebase not configured (missing env vars)" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const userId = (body && body.userId) || new URL(req.url).searchParams.get("userId");
    if (!userId || typeof userId !== "string") {
      return new Response(JSON.stringify({ error: "Missing userId. Send { userId } in POST JSON or ?userId= in query." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 1) Fetch user's last 50 listening history entries
    const historyRef = collection(db, "users", userId, "listeningHistory");
    const historyQ = query(historyRef, orderBy("playedAt", "desc"), fsLimit(50));
    const historySnap = await getDocs(historyQ);

    const history: HistoryEntry[] = [];
    const seenSongIds = new Set<string>();

    historySnap.forEach((doc) => {
      const data = doc.data() as DocumentData;
      const entry: HistoryEntry = {
        songId: data.songId || data.trackId || data.id,
        artist: data.artist,
        genres: data.genres || data.genre,
        mood: data.mood,
        playedAt: data.playedAt,
      };
      if (entry.songId) seenSongIds.add(String(entry.songId));
      history.push(entry);
    });

    if (history.length === 0) {
      // If no history, return empty recommendations to avoid wide queries
      return new Response(JSON.stringify({ recommendations: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2) Compute top genres (top 3), top artist, and mood
    const genreCounts = new Map<string, number>();
    const artistCounts = new Map<string, number>();
    const moodCounts = new Map<string, number>();

    for (const h of history) {
      if (h.artist) {
        const a = h.artist.toLowerCase().trim();
        artistCounts.set(a, (artistCounts.get(a) || 0) + 1);
      }
      if (h.mood) {
        const m = h.mood.toLowerCase().trim();
        moodCounts.set(m, (moodCounts.get(m) || 0) + 1);
      }
      const gs = normalizeGenres(h.genres);
      for (const g of gs) {
        genreCounts.set(g, (genreCounts.get(g) || 0) + 1);
      }
    }

    const topGenres = topNFromCounts(genreCounts, 3);
    const topArtist = topNFromCounts(artistCounts, 1)[0] || null;
    const topMood = topNFromCounts(moodCounts, 1)[0] || null;

    // 3) Query Firestore for candidate songs matching those traits
    // We'll run multiple queries (genres, artist, mood) and dedupe client-side.
    const candidatesById = new Map<string, any>();

    const songsCol = collection(db, "songs");

    // Helper to run a query and add to candidates map
    async function addQueryResults(q: any) {
      try {
        const snap = await getDocs(q);
        snap.forEach((d) => {
          const data = d.data();
          const id = d.id;
          if (!id) return;
          if (seenSongIds.has(id)) return; // exclude seen songs
          if (!candidatesById.has(id)) {
            candidatesById.set(id, { id, ...(data as Record<string, unknown>) });
          }
        });
      } catch (e) {
        // swallow individual query errors but log
        console.warn("Query failed", e);
      }
    }

    const genreQueries: Promise<void>[] = [];
    for (const g of topGenres) {
      // Try genres stored in an array field 'genres' with array-contains
      genreQueries.push(addQueryResults(query(songsCol, where("genres", "array-contains", g), fsLimit(100))));
      // Also try a single-field 'genre' equality as fallback
      genreQueries.push(addQueryResults(query(songsCol, where("genre", "==", g), fsLimit(100))));
    }

    const otherQueries: Promise<void>[] = [];
    if (topArtist) {
      otherQueries.push(addQueryResults(query(songsCol, where("artistLower", "==", topArtist), fsLimit(200))));
      // fallback to 'artist'
      otherQueries.push(addQueryResults(query(songsCol, where("artist", "==", topArtist), fsLimit(200))));
    }
    if (topMood) {
      otherQueries.push(addQueryResults(query(songsCol, where("mood", "==", topMood), fsLimit(200))));
    }

    // Run queries in parallel
    await Promise.all([...genreQueries, ...otherQueries]);

    // 4) Score candidates
    // Scoring weights - tweakable
    const WEIGHTS = {
      genreMatch: 30,
      artistMatch: 50,
      moodMatch: 15,
      popularityScale: 0.5, // popularity (0-100) multiplied by this and added
    };

    function scoreSong(song: any): number {
      let score = 0;
      const songGenres = normalizeGenres(song.genres || song.genre);
      for (const g of topGenres) {
        if (songGenres.includes(g)) score += WEIGHTS.genreMatch;
      }
      if (topArtist) {
        const songArtistLower = (song.artistLower || song.artist || "").toLowerCase();
        if (songArtistLower === topArtist) score += WEIGHTS.artistMatch;
      }
      if (topMood && song.mood && song.mood.toLowerCase() === topMood) {
        score += WEIGHTS.moodMatch;
      }
      if (typeof song.popularity === "number") {
        score += song.popularity * WEIGHTS.popularityScale;
      }
      return score;
    }

    const scored: Array<{ id: string; score: number; doc: any }> = [];
    for (const [id, doc] of candidatesById.entries()) {
      const s = scoreSong(doc);
      scored.push({ id, score: s, doc });
    }

    scored.sort((a, b) => b.score - a.score);

    // Return top 20
    const top = scored.slice(0, 20).map((s) => ({ id: s.id, score: s.score, ...s.doc }));

    return new Response(JSON.stringify({ recommendations: top, meta: { topGenres, topArtist, topMood } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("recommendations route error", e);
    return new Response(JSON.stringify({ error: (e && e.message) || String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
