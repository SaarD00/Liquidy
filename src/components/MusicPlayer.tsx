import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Heart, ChevronDown, MoreHorizontal, Shuffle, Repeat, ListPlus } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { formatTime, getArtworkUrl } from "@/lib/api";
import { useState } from "react";

export default function MusicPlayer() {
  const {
    currentTrack, isPlaying, togglePlay, currentTime, duration,
    seekTo, nextTrack, prevTrack, coverArtUrl
  } = usePlayer();
  const { isLiked, toggleLike } = useFavorites();
  const [expanded, setExpanded] = useState(false);

  if (!currentTrack) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const { name, artistName } = currentTrack.attributes;
  const liked = isLiked(currentTrack.id);

  return (
    <>
      {/* Expanded overlay */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col"
          >
            {/* Background with blur and gradient */}
            <div 
              className="absolute inset-0 bg-background"
              style={{
                backgroundImage: coverArtUrl ? `url(${coverArtUrl})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl" />
            
            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col p-6 pt-12">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <button 
                  onClick={() => setExpanded(false)}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center text-foreground"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
                <div className="w-12 h-1 rounded-full bg-muted-foreground/30" />
                <button className="w-10 h-10 rounded-full glass flex items-center justify-center text-foreground">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Track info header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-display font-bold text-foreground truncate">{name}</h2>
                  <p className="text-muted-foreground">{artistName}</p>
                </div>
                <button
                  onClick={() => toggleLike(currentTrack)}
                  className="ml-4 transition-transform active:scale-90"
                >
                  <Heart 
                    className={`w-7 h-7 transition-colors ${liked ? 'liked-heart' : 'text-muted-foreground hover:text-foreground'}`}
                  />
                </button>
              </div>

              {/* Album art with breathing animation */}
              <motion.div
                className="flex-1 flex items-center justify-center mb-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  {/* Progress ring */}
                  <div 
                    className="progress-ring"
                    style={{ '--progress': `${progress}%` } as React.CSSProperties}
                  />
                  {/* Album ring container */}
                  <div className="album-ring">
                    <motion.div
                      className="w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden"
                      animate={isPlaying ? {
                        scale: [1, 1.03, 1],
                      } : { scale: 1 }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      {coverArtUrl && (
                        <img 
                          src={coverArtUrl} 
                          alt={name} 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </motion.div>
                  </div>
                  
                  {/* Time display */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm text-muted-foreground">
                    {formatTime(currentTime)}
                  </div>
                </div>
              </motion.div>

              {/* Progress bar */}
              <div className="space-y-2 mb-6">
                <div
                  className="w-full h-1.5 bg-muted/50 rounded-full cursor-pointer relative overflow-hidden group"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = (e.clientX - rect.left) / rect.width;
                    seekTo(pct * duration);
                  }}
                >
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-primary rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ left: `calc(${progress}% - 6px)` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6 mb-8">
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <Shuffle className="w-5 h-5" />
                </button>
                <button 
                  onClick={prevTrack} 
                  className="w-12 h-12 rounded-full glass flex items-center justify-center text-foreground hover:bg-muted/20 transition-colors"
                >
                  <SkipBack className="w-6 h-6" />
                </button>
                <button
                  onClick={togglePlay}
                  className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center glow-primary transition-transform hover:scale-105 active:scale-95"
                >
                  {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                </button>
                <button 
                  onClick={nextTrack}
                  className="w-12 h-12 rounded-full glass flex items-center justify-center text-foreground hover:bg-muted/20 transition-colors"
                >
                  <SkipForward className="w-6 h-6" />
                </button>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <Repeat className="w-5 h-5" />
                </button>
              </div>

              {/* Bottom actions */}
              <div className="flex items-center justify-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ListPlus className="w-4 h-4" />
                  Add to Playlist
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini player bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-16 md:bottom-0 left-0 right-0 md:left-56 z-40 px-3 pb-2 md:px-4 md:pb-3"
      >
        <div
          className="glass-strong rounded-2xl p-3 flex items-center gap-3 cursor-pointer relative overflow-hidden"
          onClick={() => setExpanded(true)}
        >
          {/* Progress bar at top */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-muted/30">
            <motion.div 
              className="h-full bg-primary" 
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Album art */}
          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 relative">
            {coverArtUrl && (
              <motion.img
                src={getArtworkUrl(currentTrack.attributes.artwork.url, 100)}
                alt={name}
                className="w-full h-full object-cover"
                animate={isPlaying ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            {isPlaying && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="flex gap-0.5 items-end h-3">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="w-0.5 bg-primary rounded-full"
                      animate={{ height: ["3px", "12px", "3px"] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Track info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground truncate">{artistName}</p>
          </div>

          {/* Like button */}
          <button
            onClick={(e) => { e.stopPropagation(); toggleLike(currentTrack); }}
            className="transition-transform active:scale-90 hidden sm:block"
          >
            <Heart 
              className={`w-5 h-5 ${liked ? 'liked-heart' : 'text-muted-foreground hover:text-foreground'}`}
            />
          </button>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); prevTrack(); }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-foreground hover:bg-muted/20 transition-colors hidden sm:flex"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextTrack(); }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-foreground hover:bg-muted/20 transition-colors hidden sm:flex"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
