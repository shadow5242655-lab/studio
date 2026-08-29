import { NextRequest, NextResponse } from 'next/server';

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getSpotifyToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured');
  }

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    throw new Error(`Spotify token failed: ${res.status}`);
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

/**
 * GET /api/spotify/search?q=QUERY&limit=20
 * 
 * Searches Spotify for tracks and returns results in a format
 * compatible with our Song interface (converted from Spotify format).
 * 
 * Uses client credentials flow (no user auth needed).
 * Market=IN ensures Indian songs are prioritized.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = searchParams.get('limit') || '30';

    if (!query) {
      return NextResponse.json({ tracks: [] });
    }

    const token = await getSpotifyToken();

    // Search tracks on Spotify
    const spotifyUrl = `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&market=IN`;

    const res = await fetch(spotifyUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error(`AYUMUSIC Spotify search failed: ${res.status}`);
      return NextResponse.json({ tracks: [] });
    }

    const data = await res.json();
    const tracks = data.tracks?.items || [];

    // Convert Spotify tracks to our Song format
    const songs = tracks.map((track: any) => ({
      id: track.id,
      name: track.name,
      artists: {
        primary: (track.artists || []).map((a: any) => ({
          name: a.name,
          id: a.id,
        })),
      },
      image: (track.album?.images || []).map((img: any) => ({
        link: img.url,
        url: img.url,
        quality: img.width >= 300 ? 'high' : 'low',
      })),
      // Spotify doesn't provide direct download URLs
      // but we store a preview_url if available
      downloadUrl: track.preview_url
        ? [{ link: track.preview_url, quality: 'preview' }]
        : [],
      duration: Math.floor((track.duration_ms || 0) / 1000),
      // Store Spotify-specific metadata for identification
      _spotify: {
        trackId: track.id,
        previewUrl: track.preview_url,
        externalUrl: track.external_urls?.spotify,
        albumName: track.album?.name,
        releaseDate: track.album?.release_date,
        explicit: track.explicit,
        popularity: track.popularity,
      },
    }));

    return NextResponse.json({ tracks: songs });
  } catch (error: any) {
    console.error('AYUMUSIC Spotify search error:', error.message);
    return NextResponse.json({ tracks: [] });
  }
}
