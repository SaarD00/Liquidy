import { Heart, Play, User } from "lucide-react";
import { motion } from "framer-motion";
import { useFavorites } from "@/contexts/FavoritesContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { getArtworkUrl, formatDuration } from "@/lib/api";

export default function FavoritesPage() {
  const { likedSongs, toggleLike, isLiked } = useFavorites();
  const { playTrack, addToQueue } = usePlayer();

  const handlePlayAll = () => {
    if (likedSongs.length > 0) {
      addToQueue(likedSongs);
      playTrack(likedSongs[0]);
    }
  };

  return (
    <div className="min-h-screen pb-36 md:pb-28">
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/20 to-red-500/20 flex items-center justify-center border border-pink-500/20">
              <Heart className="w-7 h-7 text-pink-500" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Favorites</h1>
              <p className="text-sm text-muted-foreground">{likedSongs.length} songs</p>
            </div>
          </motion.div>

          {/* Profile */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>

        {likedSongs.length > 0 ? (
          <>
            {/* Play All Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <button
                onClick={handlePlayAll}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all hover:scale-105 active:scale-95"
              >
                <Play className="w-5 h-5" />
                Play All
              </button>
            </motion.div>

            {/* Tracks Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {likedSongs.map((track, index) => (
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
                    {/* Unlike button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleLike(track); }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center transition-colors hover:bg-black/70"
                    >
                      <Heart className="w-4 h-4 liked-heart" />
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
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="glass-card rounded-3xl p-10 text-center max-w-sm">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-pink-500/20 to-red-500/20 flex items-center justify-center mb-6">
                <Heart className="w-10 h-10 text-pink-500/50" />
              </div>
              <h2 className="text-xl font-display font-bold text-foreground mb-3">No Favorites Yet</h2>
              <p className="text-muted-foreground text-sm">
                Tracks you love will show up here. Tap the heart icon on any track to save it.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
