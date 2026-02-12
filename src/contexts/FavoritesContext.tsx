import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { SearchTrack } from "@/lib/api";
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
          setLikedSongs(prev => {
            const localIds = new Set(prev.map(t => t.id));
            const newItems = data.favorites.filter((t: SearchTrack) => !localIds.has(t.id));
            return [...prev, ...newItems];
          });
        }
        if (data.playlists && Array.isArray(data.playlists)) {
          setPlaylists(prev => {
            const localIds = new Set(prev.map(p => p.id));
            const newItems = data.playlists.filter((p: Playlist) => !localIds.has(p.id));
            return [...prev, ...newItems];
          });
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
                // Merge remote with local to avoid lost updates, but generally trust remote for simple sync
                // Here we just take remote as truth if we want full sync, or merge.
                // Let's merge unique IDs, preferring remote?
                // Actually, if phone added something, we want it here.
                const localIds = new Set(prev.map(t => t.id));
                const newItems = newData.favorites.filter((t: SearchTrack) => !localIds.has(t.id));
                return [...prev, ...newItems];
              });
            }
            if (newData.playlists && Array.isArray(newData.playlists)) {
              setPlaylists(prev => {
                const localIds = new Set(prev.map(p => p.id));
                const newItems = newData.playlists.filter((p: Playlist) => !localIds.has(p.id));
                // Also update existing playlists if tracks changed?
                // This simple merge only adds new playlists. We need to update existing ones too.
                // Let's rebuild the list using remote data for existing IDs + new ones.
                const remoteMap = new Map(newData.playlists.map((p: Playlist) => [p.id, p]));

                const updatedPrev = prev.map(p => remoteMap.has(p.id) ? remoteMap.get(p.id)! : p);
                const trulyNew = newData.playlists.filter((p: Playlist) => !localIds.has(p.id));

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

  // Helper to save to Supabase
  const persistData = async (currentLikes: SearchTrack[], currentPlaylists: Playlist[]) => {
    if (!user) return;
    await supabase.from('user_data').upsert({
      user_id: user.id,
      favorites: currentLikes,
      playlists: currentPlaylists
    });
  };

  // --------------------------------------------------------
  // MODIFIERS - Each calls persistData explicitly
  // --------------------------------------------------------



  const isLiked = useCallback((trackId: string) => {
    return likedSongs.some((t) => t.id === trackId);
  }, [likedSongs]);

  const toggleLike = useCallback((track: SearchTrack) => {
    // Optimistic update
    let newLikes: SearchTrack[] = [];

    setLikedSongs((prev) => {
      const exists = prev.some((t) => t.id === track.id);
      if (exists) {
        newLikes = prev.filter((t) => t.id !== track.id);
        toast.success("Removed from Favorites");
      } else {
        newLikes = [...prev, track];
        toast.success("Added to Favorites");
      }
      return newLikes;
    });

    // Save
    persistData(newLikes, playlists);
  }, [playlists, user]);

  const createPlaylist = useCallback((name: string) => {
    const newPlaylist: Playlist = {
      id: crypto.randomUUID(),
      name,
      tracks: [],
      createdAt: Date.now(),
    };

    const newPlaylists = [...playlists, newPlaylist];
    setPlaylists(newPlaylists);
    persistData(likedSongs, newPlaylists);

    return newPlaylist;
  }, [playlists, likedSongs, user]);

  const addToPlaylist = useCallback((playlistId: string, track: SearchTrack) => {
    let updatedPlaylists = [...playlists];

    setPlaylists((prev) => {
      updatedPlaylists = prev.map((p) => {
        if (p.id === playlistId) {
          // Check dupe
          if (p.tracks.some(t => t.id === track.id)) return p;
          return { ...p, tracks: [...p.tracks, track] };
        }
        return p;
      });
      return updatedPlaylists;
    });

    persistData(likedSongs, updatedPlaylists);
  }, [playlists, likedSongs, user]);

  const removeFromPlaylist = useCallback((playlistId: string, trackId: string) => {
    let updatedPlaylists = [...playlists];

    setPlaylists((prev) => {
      updatedPlaylists = prev.map((p) => {
        if (p.id === playlistId) {
          return { ...p, tracks: p.tracks.filter((t) => t.id !== trackId) };
        }
        return p;
      });
      return updatedPlaylists;
    });

    persistData(likedSongs, updatedPlaylists);
  }, [playlists, likedSongs, user]);

  const deletePlaylist = useCallback((playlistId: string) => {
    const updatedPlaylists = playlists.filter((p) => p.id !== playlistId);
    setPlaylists(updatedPlaylists);
    persistData(likedSongs, updatedPlaylists);
  }, [playlists, likedSongs, user]);

  const renamePlaylist = useCallback((playlistId: string, newName: string) => {
    const updatedPlaylists = playlists.map((p) =>
      p.id === playlistId ? { ...p, name: newName } : p
    );
    setPlaylists(updatedPlaylists);
    persistData(likedSongs, updatedPlaylists);
  }, [playlists, likedSongs, user]);

  const reorderPlaylist = useCallback((playlistId: string, startIndex: number, endIndex: number) => {
    let updatedPlaylists = [...playlists];

    setPlaylists((prev) => {
      updatedPlaylists = prev.map((playlist) => {
        if (playlist.id !== playlistId) return playlist;

        const newTracks = [...playlist.tracks];
        const [movedTrack] = newTracks.splice(startIndex, 1);
        newTracks.splice(endIndex, 0, movedTrack);

        return {
          ...playlist,
          tracks: newTracks
        };
      });
      return updatedPlaylists;
    });

    persistData(likedSongs, updatedPlaylists);
  }, [playlists, likedSongs, user]);

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
