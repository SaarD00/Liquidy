import React, { createContext, useContext, useState, useRef, useCallback, useEffect, MutableRefObject } from "react";
import { SearchTrack, getTrackDetails, getArtworkUrl, isYouTubeTrack, searchTracks } from "@/lib/api";
import { getAIRecommendations } from "@/lib/gemini";
import { useHistory } from "./HistoryContext";

interface PlayerState {
  currentTrack: SearchTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  audioUrl: string | null;
  queue: SearchTrack[];
  isYouTube: boolean;
  videoId: string | null;
  volume: number; // Added volume to state
}

const SILENT_AUDIO_URI = "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU2LjM2LjEwMAAAAAAAAAAAAAAA//M0QAAAAAASW5mbwAAAA8AAAAEAAABIwB1XV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dHxsAAAAAAABhAAAAQUxBTUUzLjk5LjVyQQAAAAAAAAAAAAAABRAAAAEQAMRkAgAAEAAAAAAAAAAAAAEAAAMjD/8zRAAAAYQAAAoAAAAAAgAAAP//MzQAAAAAABgAAAOAAAAP////8zNAAAAAAAGAAAFAAAAD////PzNEAAAAAAAYAAAcAAAAf///8=";

const PLAYER_STORAGE_KEY = "sonicflow_player_state";

const DEFAULT_STATE: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  audioUrl: null,
  queue: [],
  isYouTube: false,
  videoId: null,
  volume: 1,
};

interface PlayerContextType extends PlayerState {
  playTrack: (track: SearchTrack) => void;
  togglePlay: () => void;
  seekTo: (time: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  addToQueue: (tracks: SearchTrack[]) => void;
  setVolume: (volume: number) => void;
  coverArtUrl: string | null;
  youtubePlayerRef: MutableRefObject<any | null>;
  onYouTubeStateChange: (state: number) => void;
  onYouTubeTimeUpdate: (currentTime: number, duration: number) => void;
  clearQueue: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const youtubePlayerRef = useRef<any | null>(null);
  const isFetchingRef = useRef(false);

  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);
  const { history } = useHistory();

  const [state, setState] = useState<PlayerState>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(PLAYER_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            ...DEFAULT_STATE,
            ...parsed,
            isPlaying: false, // Always start paused
            audioUrl: null,   // URL needs to be refreshed/generated
            currentTime: parsed.currentTime || 0,
          };
        }
      } catch (e) {
        console.error("Failed to load player state:", e);
      }
    }
    return DEFAULT_STATE;
  });

  // Crossfade Refs
  const shouldFadeIn = useRef(false);
  const fadingInterval = useRef<NodeJS.Timeout | null>(null);

  // Helper to apply volume with factor (0.0 to 1.0)
  const applyVolume = useCallback((factor: number) => {
    // Apply to Audio
    // Apply to Audio
    if (audioRef.current) {
      audioRef.current.volume = state.volume * factor;
    }
    // Apply to YouTube
    if (youtubePlayerRef.current) {
      if (typeof youtubePlayerRef.current.setVolume === 'function') {
        youtubePlayerRef.current.setVolume(state.volume * 100 * factor);
      } else if (youtubePlayerRef.current.internalPlayer && typeof youtubePlayerRef.current.internalPlayer.setVolume === 'function') {
        // Fallback for some react-youtube instances
        youtubePlayerRef.current.internalPlayer.setVolume(state.volume * 100 * factor);
      }
    }
  }, [state.volume]);

  const fadeOut = useCallback(() => {
    return new Promise<void>((resolve) => {
      if (fadingInterval.current) clearInterval(fadingInterval.current);

      let factor = 1.0;
      const steps = 10;
      const duration = 400; // 400ms fade out
      const stepTime = duration / steps;

      fadingInterval.current = setInterval(() => {
        factor -= 0.1;
        if (factor <= 0) {
          factor = 0;
          if (fadingInterval.current) clearInterval(fadingInterval.current);
          applyVolume(0);
          resolve();
        } else {
          applyVolume(factor);
        }
      }, stepTime);
    });
  }, [applyVolume]);

  const fadeIn = useCallback(() => {
    if (fadingInterval.current) clearInterval(fadingInterval.current);
    shouldFadeIn.current = false;

    let factor = 0.0;
    const steps = 10;
    const duration = 400; // 400ms fade in
    const stepTime = duration / steps;

    // Set initial 0
    applyVolume(0);

    fadingInterval.current = setInterval(() => {
      factor += 0.1;
      if (factor >= 1) {
        factor = 1;
        if (fadingInterval.current) clearInterval(fadingInterval.current);
        applyVolume(1);
      } else {
        applyVolume(factor);
      }
    }, stepTime);
  }, [applyVolume]);

  // Save state to localStorage whenever relevant fields change
  useEffect(() => {
    const stateToSave = {
      currentTrack: state.currentTrack,
      queue: state.queue,
      currentTime: state.currentTime,
      isYouTube: state.isYouTube,
      videoId: state.videoId,
      volume: state.volume,
    };
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [state.currentTrack, state.queue, state.isYouTube, state.videoId, state.volume]);

  // Debounced save for time (optional optimization, but simple effect is okay for now if not too frequent)
  // We can just rely on the above effect, but let's exclude currentTime from the dependency array above
  // and make a separate effect for it if we want to save it on unload/pause

  // Re-save time on pause or unload
  useEffect(() => {
    const handleUnload = () => {
      const stateToSave = {
        currentTrack: state.currentTrack,
        queue: state.queue,
        currentTime: state.currentTime,
        isYouTube: state.isYouTube,
        videoId: state.videoId,
        volume: state.volume,
      };
      localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(stateToSave));
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [state]);

  // Initialize audio element for Shazam tracks
  // We use a ref to access the latest nextTrack function inside the event listener
  const nextTrackRef = useRef<() => void>(() => { });

  useEffect(() => {

    const audio = new Audio();
    audioRef.current = audio;

    // Helps mobile browsers buffer the track aggressively
    audio.preload = 'auto';

    audio.addEventListener("timeupdate", () => {
      if (isYouTubeRef.current) return;
      currentTimeRef.current = audio.currentTime;
      setState((s) => ({ ...s, currentTime: audio.currentTime }));
    });
    audio.addEventListener("loadedmetadata", () => {
      if (isYouTubeRef.current) return;
      durationRef.current = audio.duration;
      setState((s) => ({ ...s, duration: audio.duration }));
    });
    audio.addEventListener("ended", () => {
      if (isYouTubeRef.current) return;
      if (nextTrackRef.current) {
        nextTrackRef.current();
      } else {
        setState((s) => ({ ...s, isPlaying: false }));
      }
    });

    // ── Bidirectional state sync via native audio events ─────────────────────
    // When the OS pauses audio (incoming call, audio focus stolen by another
    // app, iOS screen-lock interruption, etc.) the browser fires these events.
    // Without these listeners the React UI would show "playing" while the
    // speaker is silent.
    audio.addEventListener("play", () => {
      setState((s) => ({ ...s, isPlaying: true }));
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
    });
    audio.addEventListener("pause", () => {
      // 'ended' fires BEFORE 'pause' on some browsers — skip that case
      if (!audio.ended) {
        setState((s) => ({ ...s, isPlaying: false }));
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'paused';
        }
      }
    });

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  const playTrack = useCallback(async (track: SearchTrack) => {
    // 1. Fade Out if already playing
    if (state.isPlaying) {
      await fadeOut();
    }

    // Flag to Fade In next
    shouldFadeIn.current = true;

    const audio = audioRef.current;

    // Check if it's a YouTube track
    if (isYouTubeTrack(track)) {
      // Play a silent audio loop to keep background playback & OS media session alive
      if (audio) {
        audio.src = SILENT_AUDIO_URI;
        audio.loop = true;
        audio.play().catch(e => console.error("Silent audio play failed", e));
      }

      isYouTubeRef.current = true; // Synchronously update ref for event listeners

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
      isYouTubeRef.current = false;
      audio.loop = false; // Disable loop for real tracks
      audio.src = url;
      audio.volume = 0; // Start silent for fade-in
      await audio.play();
      // Fade in will be handled by the useEffect for currentTrack

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
  }, [state.isPlaying, fadeOut]);

  // Effect to handle fade-in for audio tracks after state update
  useEffect(() => {
    if (state.currentTrack && !state.isYouTube && shouldFadeIn.current) {
      const audio = audioRef.current;
      if (audio && audio.src === state.audioUrl) { // Ensure it's the correct audio playing
        fadeIn();
      }
    }
  }, [state.currentTrack, state.isYouTube, state.audioUrl, fadeIn]);


  const togglePlay = useCallback(() => {
    if (state.isYouTube) {
      // For YouTube, just toggle the state
      // The MusicPlayer component will handle syncing with the iframe
      const audio = audioRef.current;
      if (audio) {
        if (state.isPlaying) audio.pause();
        else audio.play().catch(() => { });
      }
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

  const playRecommendation = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      let newTracks: SearchTrack[] = [];

      // Phase 1: AI DJ Recommendations (Hybrid Approach)
      try {
        const referenceTracks = [
          ...(history.slice(0, 4).map(h => h.track)), // Last 4 history items
          ...(state.currentTrack ? [state.currentTrack] : []) // Current track
        ].filter(Boolean);

        if (referenceTracks.length > 0) {
          const aiSuggestions = await getAIRecommendations(referenceTracks, 5);

          if (aiSuggestions.length > 0) {
            console.log("AI Suggestions:", aiSuggestions);

            // Fetch real track data for each suggestion
            // We run these in parallel for speed
            const searchPromises = aiSuggestions.map(async (query) => {
              const results = await searchTracks(query);
              return results.length > 0 ? results[0] : null;
            });

            const foundTracks = await Promise.all(searchPromises);
            newTracks = foundTracks.filter((t): t is SearchTrack => t !== null);
          }
        }
      } catch (aiError) {
        console.warn("AI Recommendation failed, falling back to simple search:", aiError);
      }

      // Fallback: If AI returned nothing (or failed), use the old Artist Logic
      if (newTracks.length === 0) {
        const lastTrack = state.currentTrack || (history.length > 0 ? history[0].track : null);
        const query = lastTrack ? `${lastTrack.attributes.artistName} songs` : "Top trending songs";
        console.log("Using fallback recommendation query:", query);
        const recommendations = await searchTracks(query);
        newTracks = recommendations;
      }

      // Filter out songs already in queue or current song
      const currentQueueIds = new Set(state.queue.map(t => t.id));
      if (state.currentTrack) currentQueueIds.add(state.currentTrack.id);

      // Filter the potential new tracks
      const uniqueNewTracks = newTracks.filter(t => !currentQueueIds.has(t.id));

      if (uniqueNewTracks.length > 0) {
        // Append recommendations to queue
        const newQueue = [...state.queue, ...uniqueNewTracks];

        // We need to update state with new queue first
        setState(s => ({ ...s, queue: newQueue }));

        // Then play the first new track
        playTrack(uniqueNewTracks[0]);
      } else {
        console.log("No new unique recommendations found.");
        setState(s => ({ ...s, isPlaying: false }));
      }

    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setState(s => ({ ...s, isPlaying: false }));
    } finally {
      isFetchingRef.current = false;
    }
  }, [state.currentTrack, state.queue, history, playTrack]);

  const seekTo = useCallback((time: number) => {
    if (state.isYouTube) {
      if (youtubePlayerRef.current && typeof youtubePlayerRef.current.seekTo === 'function') {
        youtubePlayerRef.current.seekTo(time, true);
      }
      setState((s) => ({ ...s, currentTime: time }));
    } else {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = time;
        currentTimeRef.current = time;
        setState((s) => ({ ...s, currentTime: time }));
      }
    }
  }, [state.isYouTube]);

  const nextTrack = useCallback(() => {
    if (!state.currentTrack && state.queue.length === 0) {
      playRecommendation();
      return;
    }



    const idx = state.queue.findIndex((t) => t.id === state.currentTrack?.id);

    // If we are at the end of the queue or track not found in queue
    if (idx === -1 || idx >= state.queue.length - 1) {
      playRecommendation();
    } else {
      const next = state.queue[idx + 1];
      if (next) playTrack(next);
    }
  }, [state.queue, state.currentTrack, playTrack, playRecommendation]);

  // Update ref for audio event listener
  useEffect(() => {
    nextTrackRef.current = nextTrack;
  }, [nextTrack]);

  const prevTrack = useCallback(() => {
    if (state.queue.length === 0 || !state.currentTrack) return;
    const idx = state.queue.findIndex((t) => t.id === state.currentTrack!.id);
    const prev = state.queue[(idx - 1 + state.queue.length) % state.queue.length];
    if (prev) playTrack(prev);
  }, [state.queue, state.currentTrack, playTrack]);

  const addToQueue = useCallback((tracks: SearchTrack[]) => {
    setState((s) => ({ ...s, queue: tracks }));
  }, []);

  // YouTube state change handler (state codes: -1=unstarted, 0=ended, 1=playing, 2=paused, 3=buffering)
  const onYouTubeStateChange = useCallback((playerState: number) => {
    const audio = audioRef.current;

    // 1 = Playing
    if (playerState === 1 && shouldFadeIn.current) {
      fadeIn();
    }

    if (playerState === 1) {
      setState((s) => ({ ...s, isPlaying: true }));
      if (audio && audio.paused) audio.play().catch(() => { });
    } else if (playerState === 2) {
      setState((s) => ({ ...s, isPlaying: false }));
      if (audio && !audio.paused) audio.pause();
    } else if (playerState === 0) {
      // Song ended
      nextTrack();
    }
  }, [nextTrack, fadeIn]);

  // YouTube time update handler
  const onYouTubeTimeUpdate = useCallback((currentTime: number, duration: number) => {
    currentTimeRef.current = currentTime;
    durationRef.current = duration;
    setState((s) => ({ ...s, currentTime, duration }));
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (audioRef.current) audioRef.current.volume = vol;
    setState(s => ({ ...s, volume: vol }));
  }, []);

  const clearQueue = useCallback(() => {
    setState((s) => ({ ...s, queue: [] }));
  }, []);

  // ─── Media Session API (Progressier Pattern) ────────────────────────────────────────────────
  // Stable ref so once-registered handlers always call the latest functions.
  const mediaSessionActionsRef = useRef({
    nextTrack: () => { },
    prevTrack: () => { },
    seekBackward: () => { },
    seekForward: () => { },
    togglePlay: () => { }
  });

  const isYouTubeRef = useRef(state.isYouTube);

  useEffect(() => {
    mediaSessionActionsRef.current = {
      nextTrack,
      prevTrack,
      togglePlay,
      seekBackward: () => seekTo(Math.max(currentTimeRef.current - 10, 0)),
      seekForward: () => seekTo(Math.min(currentTimeRef.current + 10, durationRef.current))
    };
    isYouTubeRef.current = state.isYouTube;
  });

  // Apply metadata AND handlers whenever currentTrack changes
  useEffect(() => {
    if (!('mediaSession' in navigator) || !state.currentTrack) return;

    const { name, artistName, albumName, artwork } = state.currentTrack.attributes;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: name,
      artist: artistName,
      album: albumName ?? '',
      artwork: [
        { src: getArtworkUrl(artwork.url, 96), sizes: '96x96', type: 'image/png' },
        { src: getArtworkUrl(artwork.url, 128), sizes: '128x128', type: 'image/png' },
        { src: getArtworkUrl(artwork.url, 256), sizes: '256x256', type: 'image/png' },
        { src: getArtworkUrl(artwork.url, 512), sizes: '512x512', type: 'image/png' },
      ],
    });

    // We tie the controls of the compact player directly to our refs
    navigator.mediaSession.setActionHandler('play', () => mediaSessionActionsRef.current.togglePlay());
    navigator.mediaSession.setActionHandler('pause', () => mediaSessionActionsRef.current.togglePlay());
    navigator.mediaSession.setActionHandler('previoustrack', () => mediaSessionActionsRef.current.prevTrack());
    navigator.mediaSession.setActionHandler('nexttrack', () => mediaSessionActionsRef.current.nextTrack());
    navigator.mediaSession.setActionHandler('seekbackward', () => mediaSessionActionsRef.current.seekBackward());
    navigator.mediaSession.setActionHandler('seekforward', () => mediaSessionActionsRef.current.seekForward());
  }, [state.currentTrack]);

  // Sync playback state
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = state.isPlaying ? 'playing' : 'paused';
    }
  }, [state.isPlaying]);

  // We report the playback position to the compact player every 300ms using setInterval
  useEffect(() => {
    const interval = setInterval(() => {
      if (!('mediaSession' in navigator)) return;
      if (!state.isPlaying) return; // Only report when actively playing

      const dur = durationRef.current;
      if (!dur || dur <= 0) return;

      try {
        navigator.mediaSession.setPositionState({
          duration: parseInt(dur.toString(), 10),
          playbackRate: 1,
          position: parseInt(currentTimeRef.current.toString(), 10)
        });
      } catch (err) { }
    }, 300);

    return () => clearInterval(interval);
  }, [state.isPlaying]);

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
        setVolume,
        coverArtUrl: state.currentTrack?.attributes?.artwork?.url || null,
        youtubePlayerRef,
        onYouTubeStateChange,
        onYouTubeTimeUpdate,
        clearQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
