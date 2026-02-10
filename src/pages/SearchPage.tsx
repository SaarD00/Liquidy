import { useState, useCallback } from "react";
import { searchTracks, SearchTrack, getArtworkUrl, formatDuration } from "@/lib/api";
import { usePlayer } from "@/contexts/PlayerContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import SearchBar from "@/components/SearchBar";
import { motion } from "framer-motion";
import { Play, Heart, TrendingUp, User } from "lucide-react";
import DesktopSidebar from "@/components/DesktopSidebar";

const SUGGESTIONS = ["Metallica", "Daft Punk", "The Weeknd", "Billie Eilish", "Eminem", "Taylor Swift"];

export default function SearchPage() {
  const [tracks, setTracks] = useState<SearchTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { playTrack, addToQueue } = usePlayer();
  const { isLiked, toggleLike } = useFavorites();

  const handleSearch = useCallback(async (query: string) => {
    setLoading(true);
    setSearched(true);
    try {
      const results = await searchTracks(query);
      setTracks(results);
      addToQueue(results);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  }, [addToQueue]);

  return (
    <div className="flex min-h-screen w-full bg-[#050505] text-white">
      <DesktopSidebar />
      <div className="flex-1 flex flex-col pl-0 md:pl-80 relative min-w-0">
        <div className="flex-1 overflow-y-auto pb-36 md:pb-0">
          <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                  Search
                </h1>
                <p className="text-muted-foreground text-sm mt-1">Find your next favorite track</p>
              </motion.div>

              {/* Profile */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="max-w-2xl">
              <SearchBar onSearch={handleSearch} isLoading={loading} />
            </div>

            {!searched && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-8"
              >
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Try searching for</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSearch(s)}
                      className="px-5 py-2.5 rounded-full bg-secondary text-foreground text-sm font-medium hover:bg-secondary/70 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {searched && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <h2 className="text-lg font-display font-semibold text-foreground mb-4">
                  Results ({tracks.length})
                </h2>

                {tracks.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {tracks.map((track, index) => (
                      <motion.div
                        key={track.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => playTrack(track)}
                        className="track-card group cursor-pointer"
                      >
                        <div className="relative aspect-square">
                          <img
                            src={getArtworkUrl(track.attributes.artwork.url, 300)}
                            alt={track.attributes.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center transform group-hover:scale-100 scale-90 transition-transform">
                              <Play className="w-5 h-5 text-black ml-0.5" />
                            </div>
                          </div>
                          {/* Like button */}
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleLike(track); }}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Heart className={`w-4 h-4 ${isLiked(track.id) ? 'liked-heart' : 'text-white'}`} />
                          </button>
                        </div>
                        <div className="p-3">
                          <p className="font-medium text-foreground truncate text-sm">{track.attributes.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{track.attributes.artistName}</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            {formatDuration(track.attributes.durationInMillis)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 text-muted-foreground">
                    <p className="text-lg">No tracks found</p>
                    <p className="text-sm mt-1">Try a different search term</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
