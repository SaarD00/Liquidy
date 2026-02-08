import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { SearchTrack, getTrackDetails, getArtworkUrl } from "@/lib/api";

interface PlayerState {
  currentTrack: SearchTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  audioUrl: string | null;
  queue: SearchTrack[];
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
  });

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
      }));
    }
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !state.audioUrl) return;
    if (state.isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setState((s) => ({ ...s, isPlaying: !s.isPlaying }));
  }, [state.isPlaying, state.audioUrl]);

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setState((s) => ({ ...s, currentTime: time }));
    }
  }, []);

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
      value={{ ...state, playTrack, togglePlay, seekTo, nextTrack, prevTrack, addToQueue, coverArtUrl }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
