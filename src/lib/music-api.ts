export interface Song {
  id: string;
  name: string;
  artists: { primary: { name: string; id?: string }[] };
  image: { link: string; url?: string; quality: string }[];
  downloadUrl: { link: string; url?: string; quality: string }[];
  duration: number;
}

const API_BASE = 'https://jiosvvnn.vercel.app/api';

/**
 * High-Fidelity Entity Decoder
 */
export function decodeEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, '&')
    .replace(/&#039;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&copy;/gi, '©')
    .replace(/&reg;/gi, '®');
}

/**
 * SmartRank3 Algorithm
 */
export function applySmartRank3(songs: Song[], localPopularity: Record<string, number> = {}): Song[] {
  return [...songs].sort((a, b) => {
    const getScore = (song: Song) => {
      let score = 0;
      const name = (song.name || '').toLowerCase();
      if (name.includes('cover') || name.includes('tribute') || name.includes('reprise')) score -= 100;
      if (name.includes('original') || name.includes('official') || name.includes('ost')) score += 30;
      score += (localPopularity[song.id] || 0) * 15;
      if (song.duration > 120) score += 10;
      return score;
    };
    return getScore(b) - getScore(a);
  });
}

export async function searchSongs(query: string, page: number = 1): Promise<Song[]> {
  try {
    const res = await fetch(`${API_BASE}/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=50`);
    const data = await res.json();
    return data.data?.results || data.data || [];
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
}

export async function getTrending(page: number = 1): Promise<Song[]> {
  try {
    const res = await fetch(`${API_BASE}/search/songs?query=Latest%20Top%20Trending%20Hits&page=${page}&limit=50`);
    const data = await res.json();
    return data.data?.results || data.data || [];
  } catch (error) {
    console.error('Trending fetch failed:', error);
    return [];
  }
}

/**
 * Neural Mood Analysis Engine (Twinword API)
 */
export async function analyzeMood(text: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY || 'YOUR_API_KEY';
  try {
    const response = await fetch("https://twinword-emotion-analysis-v1.p.rapidapi.com/analyze/", {
      method: "POST",
      headers: {
        "x-rapidapi-key": apiKey,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: `text=${encodeURIComponent(text)}`,
    });
    const data = await response.json();
    
    if (data.emotion_scores) {
      const scores = data.emotion_scores;
      // Get the dominant emotion key
      const dominant = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
      return dominant;
    }
    return "neutral";
  } catch (error) {
    console.error("Mood analysis failed:", error);
    return "neutral";
  }
}

export function mapMoodToGenre(emotion: string): string {
  const mapping: Record<string, string> = {
    joy: "Party",
    sadness: "Romantic",
    anger: "Rap",
    surprise: "Bollywood",
    fear: "Lo-Fi",
    disgust: "Lo-Fi",
    neutral: "Acoustic"
  };
  return mapping[emotion.toLowerCase()] || "Latest Hits";
}

export function formatDuration(seconds: number) {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getBestImage(item: any): string | null {
  if (!item?.image?.length) return null;
  const best = item.image[item.image.length - 1];
  return best?.link || best?.url || null;
}

export function getBestDownload(song: Song): string {
  if (!song?.downloadUrl?.length) return '';
  const best = song.downloadUrl[song.downloadUrl.length - 1];
  return best?.link || best?.url || '';
}
