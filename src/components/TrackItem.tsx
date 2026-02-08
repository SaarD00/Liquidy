import { motion } from "framer-motion";
import { Play, Heart, MoreHorizontal } from "lucide-react";
import { SearchTrack, formatDuration, getArtworkUrl } from "@/lib/api";
import { usePlayer } from "@/contexts/PlayerContext";
import { useFavorites } from "@/contexts/FavoritesContext";

interface TrackItemProps {
  track: SearchTrack;
  index: number;
}

export default function TrackItem({ track, index }: TrackItemProps) {
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const { isLiked, toggleLike } = useFavorites();
  const isActive = currentTrack?.id === track.id;
  const liked = isLiked(track.id);
  const { name, artistName, albumName, durationInMillis, artwork } = track.attributes;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      onClick={() => playTrack(track)}
      className={`glass-card flex items-center gap-3 p-3 rounded-xl cursor-pointer group ${
        isActive ? "ring-1 ring-primary/50 bg-primary/5" : ""
      }`}
    >
      {/* Album art */}
      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={getArtworkUrl(artwork.url, 100)}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-5 h-5 text-white fill-white" />
        </div>
        {isActive && isPlaying && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="flex gap-0.5 items-end h-4">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-primary rounded-full"
                  animate={{ height: ["4px", "16px", "4px"] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate transition-colors ${
          isActive ? "text-primary" : "text-foreground"
        }`}>
          {name}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {artistName} • {albumName}
        </p>
      </div>

      {/* Duration */}
      <span className="text-xs text-muted-foreground flex-shrink-0 hidden sm:block">
        {formatDuration(durationInMillis)}
      </span>

      {/* Like button */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleLike(track); }}
        className="transition-transform active:scale-90 flex-shrink-0"
      >
        <Heart 
          className={`w-4 h-4 transition-colors ${
            liked ? 'liked-heart' : 'text-muted-foreground hover:text-foreground'
          }`}
        />
      </button>

      {/* More button */}
      <button
        onClick={(e) => { e.stopPropagation(); }}
        className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
