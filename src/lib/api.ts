// ==========================================
// API Configuration
// ==========================================

// Load API keys from environment variables
const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY || "";
const YOUTUBE_OFFICIAL_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || "";
const YOUTUBE_HOST = import.meta.env.VITE_YOUTUBE_HOST || "youtube-v31.p.rapidapi.com";
const SHAZAM_HOST = import.meta.env.VITE_SHAZAM_HOST || "shazam-core.p.rapidapi.com";

// YouTube API (Primary)
// YouTube API (Official)
const YOUTUBE_OFFICIAL_BASE_URL = "https://www.googleapis.com/youtube/v3";

// YouTube API (RapidAPI Proxy - Fallback)
const YOUTUBE_RAPID_BASE_URL = `https://${YOUTUBE_HOST}`;

// Shazam API (Fallback)
const SHAZAM_BASE_URL = `https://${SHAZAM_HOST}`;

const youtubeHeaders = {
  "X-RapidAPI-Key": RAPIDAPI_KEY,
  "X-RapidAPI-Host": YOUTUBE_HOST,
};

const shazamHeaders = {
  "X-RapidAPI-Key": RAPIDAPI_KEY,
  "X-RapidAPI-Host": SHAZAM_HOST,
};

// ==========================================
// Cache Configuration
// ==========================================
// Simple in-memory cache to prevent redundant API calls for same queries in one session
const searchCache = new Map<string, { data: SearchTrack[], timestamp: number }>();
const CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes cache

// ==========================================
// Types
// ==========================================

export interface TrackAttributes {
  name: string;
  artistName: string;
  albumName: string;
  durationInMillis: number;
  artwork: {
    url: string;
    bgColor: string;
  };
  previews: { url: string }[];
  genreNames: string[];
  releaseDate: string;
}

export interface SearchTrack {
  id: string;
  type: string; // 'youtube' | 'shazam'
  attributes: TrackAttributes;
  // YouTube specific
  videoId?: string;
  channelTitle?: string;
}

export interface TrackDetail {
  key: string;
  title: string;
  subtitle: string;
  images?: {
    coverart?: string;
    coverarthq?: string;
    background?: string;
  };
  hub?: {
    actions?: { name: string; type: string; id?: string; uri?: string }[];
  };
  genres?: { primary: string };
  sections?: { type: string; metadata?: { title: string; text: string }[] }[];
}

export interface YouTubeSearchItem {
  kind: string;
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
    };
    channelTitle: string;
    liveBroadcastContent: string;
    publishTime: string;
  };
}

export interface YouTubeSearchResponse {
  kind: string;
  nextPageToken?: string;
  regionCode: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: YouTubeSearchItem[];
}

// ==========================================
// YouTube API Functions
// ==========================================

// ==========================================
// YouTube API Strategies
// ==========================================

// Official YouTube Data API v3 Implementation
async function searchYouTubeOfficial(query: string): Promise<SearchTrack[]> {
  if (!YOUTUBE_OFFICIAL_KEY) throw new Error("No official YouTube API key configured");

  const url = `${YOUTUBE_OFFICIAL_BASE_URL}/search?` + new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    videoCategoryId: "10", // Music category
    maxResults: "12",
    key: YOUTUBE_OFFICIAL_KEY
  });

  const res = await fetch(url);

  if (!res.ok) {
    // Handle specific error codes if needed (e.g., 403 quota exceeded)
    const errorData = await res.json().catch(() => ({}));
    console.warn("Official YouTube API Error:", res.status, errorData);
    throw new Error(`Official YouTube API failed: ${res.status}`);
  }

  const data: YouTubeSearchResponse = await res.json();
  return transformYouTubeResults(data);
}

// RapidAPI YouTube Proxy Implementation (Fallback)
async function searchYouTubeRapid(query: string): Promise<SearchTrack[]> {
  const res = await fetch(
    `${YOUTUBE_RAPID_BASE_URL}/search?q=${encodeURIComponent(query)}&part=snippet&type=video&videoCategoryId=10&maxResults=12`,
    { headers: youtubeHeaders }
  );

  if (!res.ok) {
    console.error("RapidAPI YouTube proxy failed:", res.status);
    throw new Error("RapidAPI YouTube search failed");
  }

  const data: YouTubeSearchResponse = await res.json();
  return transformYouTubeResults(data);
}

// Shared transformer for both API responses
function transformYouTubeResults(data: YouTubeSearchResponse): SearchTrack[] {
  // Filter only videos (not channels or playlists)
  const videos = data.items.filter(item => item.id.kind === "youtube#video");

  return videos.map((item): SearchTrack => ({
    id: item.id.videoId,
    type: "youtube",
    videoId: item.id.videoId,
    channelTitle: item.snippet.channelTitle,
    attributes: {
      name: decodeHTMLEntities(item.snippet.title),
      artistName: item.snippet.channelTitle,
      albumName: "YouTube",
      durationInMillis: 0, // YouTube search doesn't provide duration
      artwork: {
        url: item.snippet.thumbnails.high.url,
        bgColor: "#000000",
      },
      previews: [], // YouTube uses video embed instead
      genreNames: ["Music"],
      releaseDate: item.snippet.publishedAt,
    },
  }));
}

// Helper to decode HTML entities in titles
function decodeHTMLEntities(text: string): string {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}

// ==========================================
// Shazam API Functions (Fallback)
// ==========================================

export async function searchShazam(query: string): Promise<SearchTrack[]> {
  const res = await fetch(
    `${SHAZAM_BASE_URL}/v1/search/multi?search_type=SONGS&offset=0&query=${encodeURIComponent(query)}`,
    { headers: shazamHeaders }
  );

  if (!res.ok) throw new Error("Shazam search failed");

  const data = await res.json();
  const tracks = data.data || [];

  // Mark as shazam type
  return tracks.map((track: SearchTrack) => ({
    ...track,
    type: "shazam",
  }));
}

export async function getTrackDetails(trackId: string): Promise<TrackDetail> {
  const res = await fetch(
    `${SHAZAM_BASE_URL}/v1/tracks/details?track_id=${trackId}`,
    { headers: shazamHeaders }
  );
  if (!res.ok) throw new Error("Track details failed");
  return res.json();
}

// ==========================================
// Unified Search (YouTube First, Shazam Fallback)
// ==========================================

export async function searchTracks(query: string): Promise<SearchTrack[]> {
  const normalizedQuery = query.trim().toLowerCase();

  // 1. Check Cache First (The most effective way to save credits)
  const cached = searchCache.get(normalizedQuery);
  if (cached && (Date.now() - cached.timestamp) < CACHE_EXPIRY) {
    console.log("Using cached results for:", normalizedQuery);
    return cached.data;
  }

  console.log("Searching for:", query);

  let results: SearchTrack[] = [];

  // API Strategy: Official -> RapidAPI -> Shazam
  // This implements a failover mechanism to prioritize free/official quota over paid/proxied quota

  // 1. Try Official YouTube API
  try {
    console.log("Attempting search via Official YouTube API...");
    results = await searchYouTubeOfficial(query);
    if (results.length > 0) {
      console.log("Using Official YouTube results:", results.length, "tracks");
    }
  } catch (error) {
    console.warn("Official YouTube API failed, failing over to RapidAPI proxy...", error);
  }

  // 2. Fallback to RapidAPI YouTube Proxy
  if (results.length === 0) {
    try {
      console.log("Attempting search via RapidAPI YouTube Proxy...");
      results = await searchYouTubeRapid(query);
      if (results.length > 0) {
        console.log("Using RapidAPI results:", results.length, "tracks");
      }
    } catch (error) {
      console.warn("RapidAPI YouTube proxy failed, failing over to Shazam...", error);
    }
  }

  // 3. Fallback to Shazam if YouTube fails or returns no results
  if (results.length === 0) {
    try {
      const shazamResults = await searchShazam(query);
      console.log("Using Shazam fallback:", shazamResults.length, "tracks");
      results = shazamResults;
    } catch (error) {
      console.error("Both APIs failed:", error);
      throw new Error("Search failed - please try again later");
    }
  }

  // Save to cache before returning
  if (results.length > 0) {
    searchCache.set(normalizedQuery, { data: results, timestamp: Date.now() });
  }

  return results;
}

// ==========================================
// Utility Functions
// ==========================================

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function getArtworkUrl(url: string, size = 300): string {
  // YouTube thumbnails have fixed URLs, Shazam uses size replacement
  if (url.includes("ytimg.com")) {
    // For YouTube, return maxresdefault for highest quality
    return url.replace(/default\.jpg|mqdefault\.jpg|hqdefault\.jpg/, "maxresdefault.jpg");
  }
  return url.replace(/\d+x\d+/, `${size}x${size}`);
}

// Get YouTube video URL for embedding
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&modestbranding=1&rel=0`;
}

// Check if track is from YouTube
export function isYouTubeTrack(track: SearchTrack): boolean {
  return track.type === "youtube" || !!track.videoId;
}
