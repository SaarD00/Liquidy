import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { SearchTrack } from "@/lib/api";

interface Playlist {
  id: string;
  name: string;
  tracks: SearchTrack[];
  createdAt: number;
}

interface FavoritesContextType {
  likedSongs: SearchTrack[];
  playlists: Playlist[];
  isLiked: (trackId: string) => boolean;
  toggleLike: (track: SearchTrack) => void;
  createPlaylist: (name: string) => Playlist;
  addToPlaylist: (playlistId: string, track: SearchTrack) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  renamePlaylist: (playlistId: string, newName: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}

const LIKED_KEY = "sonicflow_liked_songs";
const PLAYLISTS_KEY = "sonicflow_playlists";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [likedSongs, setLikedSongs] = useState<SearchTrack[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LIKED_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(PLAYLISTS_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(LIKED_KEY, JSON.stringify(likedSongs));
  }, [likedSongs]);

  useEffect(() => {
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  }, [playlists]);

  const isLiked = useCallback((trackId: string) => {
    return likedSongs.some((t) => t.id === trackId);
  }, [likedSongs]);

  const toggleLike = useCallback((track: SearchTrack) => {
    setLikedSongs((prev) => {
      const exists = prev.some((t) => t.id === track.id);
      if (exists) {
        return prev.filter((t) => t.id !== track.id);
      }
      return [track, ...prev];
    });
  }, []);

  const createPlaylist = useCallback((name: string) => {
    const newPlaylist: Playlist = {
      id: `playlist_${Date.now()}`,
      name,
      tracks: [],
      createdAt: Date.now(),
    };
    setPlaylists((prev) => [...prev, newPlaylist]);
    return newPlaylist;
  }, []);

  const addToPlaylist = useCallback((playlistId: string, track: SearchTrack) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id === playlistId) {
          const exists = p.tracks.some((t) => t.id === track.id);
          if (exists) return p;
          return { ...p, tracks: [...p.tracks, track] };
        }
        return p;
      })
    );
  }, []);

  const removeFromPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id === playlistId) {
          return { ...p, tracks: p.tracks.filter((t) => t.id !== trackId) };
        }
        return p;
      })
    );
  }, []);

  const deletePlaylist = useCallback((playlistId: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
  }, []);

  const renamePlaylist = useCallback((playlistId: string, newName: string) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id === playlistId) {
          return { ...p, name: newName };
        }
        return p;
      })
    );
  }, []);

  return (
    <FavoritesContext.Provider
      value={{
        likedSongs,
        playlists,
        isLiked,
        toggleLike,
        createPlaylist,
        addToPlaylist,
        removeFromPlaylist,
        deletePlaylist,
        renamePlaylist,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}
