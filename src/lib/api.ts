const API_KEY = "0e8903e27emsh2333e866a960be6p1d76cbjsn8250ba0b208d";
const API_HOST = "shazam-core.p.rapidapi.com";
const BASE_URL = `https://${API_HOST}`;

const headers = {
  "X-RapidAPI-Key": API_KEY,
  "X-RapidAPI-Host": API_HOST,
};

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
  type: string;
  attributes: TrackAttributes;
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

export async function searchTracks(query: string): Promise<SearchTrack[]> {
  const res = await fetch(
    `${BASE_URL}/v1/search/multi?search_type=SONGS&offset=0&query=${encodeURIComponent(query)}`,
    { headers }
  );
  if (!res.ok) throw new Error("Search failed");
  const data = await res.json();
  return data.data || [];
}

export async function getTrackDetails(trackId: string): Promise<TrackDetail> {
  const res = await fetch(
    `${BASE_URL}/v1/tracks/details?track_id=${trackId}`,
    { headers }
  );
  if (!res.ok) throw new Error("Track details failed");
  return res.json();
}

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
  return url.replace(/\d+x\d+/, `${size}x${size}`);
}
