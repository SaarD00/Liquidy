import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { SearchTrack, getTrackDetails, getArtworkUrl, isYouTubeTrack } from "@/lib/api";

interface PlayerState {
  currentTrack: SearchTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  audioUrl: string | null;
  queue: SearchTrack[];
  isYouTube: boolean;
  videoId: string | null;
}

interface PlayerContextType extends PlayerState {
  playTrack: (track: SearchTrack) => void;
  togglePlay: () => void;
  seekTo: (time: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  addToQueue: (tracks: SearchTrack[]) => void;
  coverArtUrl: string | null;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [state, setState] = useState<PlayerState>({
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    audioUrl: null,
    queue: [],
    isYouTube: false,
    videoId: null,
  });

  // Initialize audio element for Shazam tracks
  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;

    audio.addEventListener("timeupdate", () => {
      setState((s) => ({ ...s, currentTime: audio.currentTime }));
    });
    audio.addEventListener("loadedmetadata", () => {
      setState((s) => ({ ...s, duration: audio.duration }));
    });
    audio.addEventListener("ended", () => {
      setState((s) => ({ ...s, isPlaying: false }));
    });

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  const playTrack = useCallback(async (track: SearchTrack) => {
    const audio = audioRef.current;

    // Check if it's a YouTube track
    if (isYouTubeTrack(track)) {
      // Stop any playing audio
      if (audio) {
        audio.pause();
        audio.src = "";
      }

      setState((s) => ({
        ...s,
        currentTrack: track,
        isPlaying: true,
        isYouTube: true,
        videoId: track.videoId || track.id,
        audioUrl: null,
        currentTime: 0,
        duration: 0,
      }));

      return;
    }

    // Handle Shazam tracks with audio preview
    if (!audio) return;

    // Try preview URL from search results first
    let url = track.attributes.previews?.[0]?.url;

    if (!url) {
      // Fallback to track details API
      try {
        const details = await getTrackDetails(track.id);
        const uriAction = details.hub?.actions?.find((a) => a.type === "uri");
        url = uriAction?.uri || null;
      } catch {
        console.error("Could not get track URL");
      }
    }

    if (url) {
      audio.src = url;
      audio.play();
      setState((s) => ({
        ...s,
        currentTrack: track,
        isPlaying: true,
        audioUrl: url,
        currentTime: 0,
        isYouTube: false,
        videoId: null,
      }));
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (state.isYouTube) {
      // For YouTube, just toggle the state
      // The MusicPlayer component will handle syncing with the iframe
      setState((s) => ({ ...s, isPlaying: !s.isPlaying }));
    } else {
      // Toggle audio player
      const audio = audioRef.current;
      if (!audio || !state.audioUrl) return;
      if (state.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setState((s) => ({ ...s, isPlaying: !s.isPlaying }));
    }
  }, [state.isPlaying, state.audioUrl, state.isYouTube]);

  const seekTo = useCallback((time: number) => {
    if (state.isYouTube) {
      // For YouTube, just update the state - MusicPlayer handles iframe
      setState((s) => ({ ...s, currentTime: time }));
    } else {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = time;
        setState((s) => ({ ...s, currentTime: time }));
      }
    }
  }, [state.isYouTube]);

  const nextTrack = useCallback(() => {
    if (state.queue.length === 0 || !state.currentTrack) return;
    const idx = state.queue.findIndex((t) => t.id === state.currentTrack!.id);
    const next = state.queue[(idx + 1) % state.queue.length];
    if (next) playTrack(next);
  }, [state.queue, state.currentTrack, playTrack]);

  const prevTrack = useCallback(() => {
    if (state.queue.length === 0 || !state.currentTrack) return;
    const idx = state.queue.findIndex((t) => t.id === state.currentTrack!.id);
    const prev = state.queue[(idx - 1 + state.queue.length) % state.queue.length];
    if (prev) playTrack(prev);
  }, [state.queue, state.currentTrack, playTrack]);

  const addToQueue = useCallback((tracks: SearchTrack[]) => {
    setState((s) => ({ ...s, queue: tracks }));
  }, []);

  const coverArtUrl = state.currentTrack
    ? getArtworkUrl(state.currentTrack.attributes.artwork.url, 600)
    : null;

  return (
    <PlayerContext.Provider
      value={{
        ...state,
        playTrack,
        togglePlay,
        seekTo,
        nextTrack,
        prevTrack,
        addToQueue,
        coverArtUrl,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
