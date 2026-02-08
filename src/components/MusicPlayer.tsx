import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
import { formatTime, getArtworkUrl } from "@/lib/api";
import { useState } from "react";

export default function MusicPlayer() {
  const {
    currentTrack, isPlaying, togglePlay, currentTime, duration,
    seekTo, nextTrack, prevTrack, coverArtUrl
  } = usePlayer();
  const [expanded, setExpanded] = useState(false);

  if (!currentTrack) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const { name, artistName } = currentTrack.attributes;

  return (
    <>
      {/* Expanded overlay */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xl flex flex-col items-center justify-center p-6"
            onClick={() => setExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md flex flex-col items-center gap-8"
            >
              <motion.div
                className="w-64 h-64 md:w-72 md:h-72 rounded-3xl overflow-hidden shadow-2xl"
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                {coverArtUrl && (
                  <img src={coverArtUrl} alt={name} className="w-full h-full object-cover" />
                )}
              </motion.div>

              <div className="text-center w-full">
                <h3 className="text-xl font-display font-bold text-foreground truncate">{name}</h3>
                <p className="text-muted-foreground">{artistName}</p>
              </div>

              {/* Progress */}
              <div className="w-full space-y-2">
                <div
                  className="w-full h-1.5 bg-muted rounded-full cursor-pointer relative overflow-hidden"
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
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-8">
                <button onClick={prevTrack} className="text-foreground hover:text-primary transition-colors">
                  <SkipBack className="w-7 h-7" />
                </button>
                <button
                  onClick={togglePlay}
                  className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center glow-primary transition-transform hover:scale-105"
                >
                  {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                </button>
                <button onClick={nextTrack} className="text-foreground hover:text-primary transition-colors">
                  <SkipForward className="w-7 h-7" />
                </button>
              </div>
            </motion.div>
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
          className="glass-strong rounded-2xl p-3 flex items-center gap-3 cursor-pointer"
          onClick={() => setExpanded(true)}
        >
          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
            {coverArtUrl && (
              <img
                src={getArtworkUrl(currentTrack.attributes.artwork.url, 80)}
                alt={name}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground truncate">{artistName}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); prevTrack(); }}
              className="text-foreground hover:text-primary transition-colors hidden sm:block"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextTrack(); }}
              className="text-foreground hover:text-primary transition-colors hidden sm:block"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </motion.div>
    </>
  );
}
