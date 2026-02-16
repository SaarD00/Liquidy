import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { SearchTrack } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

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
  reorderPlaylist: (playlistId: string, startIndex: number, endIndex: number) => void;
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
  const { user } = useAuth();

  // Refs to track latest state for async operations without closure staleness
  const likedSongsRef = useRef<SearchTrack[]>([]);
  const playlistsRef = useRef<Playlist[]>([]);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

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

  // Keep refs synced with state
  useEffect(() => {
    likedSongsRef.current = likedSongs;
    localStorage.setItem(LIKED_KEY, JSON.stringify(likedSongs));
  }, [likedSongs]);

  useEffect(() => {
    playlistsRef.current = playlists;
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  }, [playlists]);

  // Sync with Supabase on Mount / Auth Change
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const { data } = await supabase
        .from('user_data')
        .select('favorites, playlists')
        .eq('user_id', user.id)
        .single();

      if (data) {
        if (data.favorites && Array.isArray(data.favorites)) {
          setLikedSongs(data.favorites);
        }
        if (data.playlists && Array.isArray(data.playlists)) {
          setPlaylists(data.playlists);
        }
      }
    };

    fetchData();
  }, [user]);

  // Realtime Sync Subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user_data_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_data',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newData = payload.new as any;
          if (newData) {
            if (newData.favorites && Array.isArray(newData.favorites)) {
              setLikedSongs(prev => {
                const localIds = new Set(prev.map(t => t.id));
                const newItems = newData.favorites.filter((t: SearchTrack) => !localIds.has(t.id));
                if (newItems.length === 0) return prev;
                return [...prev, ...newItems];
              });
            }
            if (newData.playlists && Array.isArray(newData.playlists)) {
              setPlaylists(prev => {
                const localIds = new Set(prev.map(p => p.id));
                const remoteMap = new Map(newData.playlists.map((p: Playlist) => [p.id, p]));

                // Update existing playlists and add new ones
                const updatedPrev = prev.map(p => remoteMap.has(p.id) ? remoteMap.get(p.id)! : p);
                const trulyNew = newData.playlists.filter((p: Playlist) => !localIds.has(p.id));

                // Deep comparison could be added here to avoid render if distinct logic matches, 
                // but length/id check is a decent first filter.
                if (trulyNew.length === 0 && JSON.stringify(updatedPrev) === JSON.stringify(prev)) return prev;

                return [...updatedPrev, ...trulyNew];
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Helper to save to Supabase (Debounced)
  const persistData = async () => {
    if (!user) return;
    try {
      const { error } = await supabase.from('user_data').upsert(
        {
          user_id: user.id,
          favorites: likedSongsRef.current,
          playlists: playlistsRef.current
        },
        { onConflict: 'user_id' }
      );

      if (error) {
        console.error("Error saving user data:", error);
        toast.error("Failed to save changes");
      }
    } catch (err) {
      console.error("Unexpected error saving user data:", err);
    }
  };

  const scheduleSave = useCallback(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      persistData();
    }, 2000); // 2 second debounce
  }, [user]);

  // --------------------------------------------------------
  // MODIFIERS - Each calls scheduleSave
  // --------------------------------------------------------

  const isLiked = useCallback((trackId: string) => {
    return likedSongs.some((t) => t.id === trackId);
  }, [likedSongs]);

  const toggleLike = useCallback((track: SearchTrack) => {
    setLikedSongs((prev) => {
      const exists = prev.some((t) => t.id === track.id);
      if (exists) {
        toast.success("Removed from Favorites");
        return prev.filter((t) => t.id !== track.id);
      } else {
        toast.success("Added to Favorites");
        return [...prev, track];
      }
    });
    scheduleSave();
  }, [scheduleSave]); // Removed 'playlists' from dependency as it's not needed for the toggle logic itself

  const createPlaylist = useCallback((name: string) => {
    const newPlaylist: Playlist = {
      id: crypto.randomUUID(),
      name,
      tracks: [],
      createdAt: Date.now(),
    };

    setPlaylists(prev => [...prev, newPlaylist]);
    scheduleSave();

    return newPlaylist;
  }, [scheduleSave]);

  const addToPlaylist = useCallback((playlistId: string, track: SearchTrack) => {
    setPlaylists((prev) => {
      return prev.map((p) => {
        if (p.id === playlistId) {
          if (p.tracks.some(t => t.id === track.id)) return p;
          return { ...p, tracks: [...p.tracks, track] };
        }
        return p;
      });
    });
    scheduleSave();
  }, [scheduleSave]);

  const removeFromPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists((prev) => {
      return prev.map((p) => {
        if (p.id === playlistId) {
          return { ...p, tracks: p.tracks.filter((t) => t.id !== trackId) };
        }
        return p;
      });
    });
    scheduleSave();
  }, [scheduleSave]);

  const deletePlaylist = useCallback((playlistId: string) => {
    setPlaylists(prev => prev.filter((p) => p.id !== playlistId));
    scheduleSave();
  }, [scheduleSave]);

  const renamePlaylist = useCallback((playlistId: string, newName: string) => {
    setPlaylists((prev) => prev.map((p) =>
      p.id === playlistId ? { ...p, name: newName } : p
    ));
    scheduleSave();
  }, [scheduleSave]);

  const reorderPlaylist = useCallback((playlistId: string, startIndex: number, endIndex: number) => {
    setPlaylists((prev) => {
      return prev.map((playlist) => {
        if (playlist.id !== playlistId) return playlist;

        const newTracks = [...playlist.tracks];
        const [movedTrack] = newTracks.splice(startIndex, 1);
        newTracks.splice(endIndex, 0, movedTrack);

        return {
          ...playlist,
          tracks: newTracks
        };
      });
    });
    scheduleSave();
  }, [scheduleSave]);

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
        reorderPlaylist,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}
