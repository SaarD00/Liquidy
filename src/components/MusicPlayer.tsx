import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Heart, ChevronDown, MoreHorizontal, Shuffle, Repeat, Volume2, Mic2, ListMusic, Maximize2, ListPlus } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useSettings } from "@/contexts/SettingsContext";
import { extractColorsFromImage } from "@/lib/colorExtractor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { formatTime, getArtworkUrl, isYouTubeTrack } from "@/lib/api";
import { useState, useRef, useEffect, useCallback } from "react";

// Default duration for YouTube videos (3.5 minutes) - will update as video plays
const DEFAULT_YOUTUBE_DURATION = 210;

export default function MusicPlayer() {
  const {
    currentTrack, isPlaying, togglePlay, currentTime, duration,
    seekTo, nextTrack, prevTrack, coverArtUrl, isYouTube, videoId
  } = usePlayer();
  const { isLiked, toggleLike, playlists, addToPlaylist } = useFavorites();
  const { setCustomTheme, resetTheme } = useTheme();
  const { dynamicBackground } = useSettings();

  const [expanded, setExpanded] = useState(false);
  const [volume, setVolume] = useState(80);

  // Track playback time for YouTube
  const [ytCurrentTime, setYtCurrentTime] = useState(0);
  const [ytDuration, setYtDuration] = useState(DEFAULT_YOUTUBE_DURATION);
  const playStartTimeRef = useRef<number | null>(null);
  const savedTimeRef = useRef(0);
  const lastVideoIdRef = useRef<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isYouTubeVideo = currentTrack ? isYouTubeTrack(currentTrack) : false;

  // Dynamic Theme Extraction
  useEffect(() => {
    if (dynamicBackground && currentTrack?.attributes?.artwork?.url) {
      extractColorsFromImage(currentTrack.attributes.artwork.url)
        .then(colors => {
          if (colors.raw) {
            setCustomTheme(colors.raw.primary);
          }
        });
    } else {
      // If dynamic background is off, or no track, likely want to reset or keep default
      if (!dynamicBackground) {
        resetTheme();
      }
    }
  }, [currentTrack, dynamicBackground, setCustomTheme, resetTheme]);


  // Reset when video changes
  useEffect(() => {
    if (videoId && videoId !== lastVideoIdRef.current) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setYtCurrentTime(0);
      setYtDuration(DEFAULT_YOUTUBE_DURATION);
      savedTimeRef.current = 0;
      playStartTimeRef.current = null;
      lastVideoIdRef.current = videoId;
    }
  }, [videoId]);

  // Real-time progress tracking for YouTube
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isYouTubeVideo && isPlaying && videoId) {
      playStartTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        if (playStartTimeRef.current) {
          const elapsedSincePlay = (Date.now() - playStartTimeRef.current) / 1000;
          const totalTime = savedTimeRef.current + elapsedSincePlay;
          setYtCurrentTime(totalTime);
        }
      }, 500);
    } else if (isYouTubeVideo && !isPlaying) {
      if (playStartTimeRef.current) {
        const elapsedSincePlay = (Date.now() - playStartTimeRef.current) / 1000;
        savedTimeRef.current = savedTimeRef.current + elapsedSincePlay;
        playStartTimeRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, isYouTubeVideo, videoId]);

  // Handle seeking for YouTube
  const handleYouTubeSeek = useCallback((seekTime: number) => {
    savedTimeRef.current = seekTime;
    setYtCurrentTime(seekTime);
    if (isPlaying) {
      playStartTimeRef.current = Date.now();
    }
    if (isPlaying) {
      togglePlay();
      setTimeout(() => togglePlay(), 50);
    }
  }, [isPlaying, togglePlay]);

  if (!currentTrack) return null;

  const { name, artistName, albumName } = currentTrack.attributes;
  const liked = isLiked(currentTrack.id);

  // Use YouTube time tracking for YouTube videos, otherwise use context values
  const displayCurrentTime = isYouTubeVideo ? ytCurrentTime : currentTime;
  const displayDuration = isYouTubeVideo ? ytDuration : duration;
  const progress = displayDuration > 0 ? (displayCurrentTime / displayDuration) * 100 : 0;

  // Handle progress bar click for seeking
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const seekTime = pct * displayDuration;

    if (isYouTubeVideo) {
      handleYouTubeSeek(seekTime);
    } else {
      seekTo(seekTime);
    }
  };

  // YouTube embed URL with start time for resume
  const startSeconds = Math.floor(savedTimeRef.current);
  const youtubeEmbedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&playsinline=1&start=${startSeconds}`
    : null;

  return (
    <>
      {/* Hidden YouTube Player */}
      {isYouTubeVideo && videoId && youtubeEmbedUrl && isPlaying && (
        <div
          style={{
            position: 'fixed',
            top: '-9999px',
            left: '-9999px',
            width: '640px',
            height: '360px',
            pointerEvents: 'none',
          }}
        >
          <iframe
            key={`${videoId}-${startSeconds}`}
            src={youtubeEmbedUrl}
            title="YouTube audio player"
            width="640"
            height="360"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            style={{ border: 'none' }}
          />
        </div>
      )}

      {/* Expanded Full-Screen Player */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed scrollbar-hide inset-0 z-[60] flex flex-col bg-[#050505]/98 backdrop-blur-3xl"
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col p-6 pt-12 max-w-lg mx-auto w-full overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-10">
                <button
                  onClick={() => setExpanded(false)}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                >
                  <ChevronDown className="w-6 h-6" />
                </button>
                <span className="text-sm font-medium text-gray-400 tracking-widest uppercase">
                  Now Playing
                </span>
                <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Large Album Art */}
              <div className="flex-1 flex items-center justify-center mb-10">
                <motion.div
                  className="relative"
                  animate={isPlaying ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* Glow Effect */}
                  <div
                    className={`absolute inset-0 rounded-3xl blur-3xl transition-opacity duration-500 ${isPlaying ? 'opacity-60' : 'opacity-30'}`}
                    style={{
                      background: `url(${getArtworkUrl(currentTrack.attributes.artwork.url, 100)})`,
                      backgroundSize: 'cover',
                      transform: 'scale(1.1)',
                    }}
                  />

                  {/* Album Art */}
                  <motion.div
                    className="relative w-72 h-72 md:w-80 md:h-80 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/10"
                    whileTap={{ scale: 0.95 }}
                  >
                    <img
                      src={getArtworkUrl(currentTrack.attributes.artwork.url, 600)}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </motion.div>
              </div>

              {/* Track Info */}
              <div className="flex items-end justify-between mb-8">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 truncate">{String(name).slice(0, 32)}</h2>
                  <p className="text-lg text-primary/70 truncate">{artistName}</p>
                </div>
                <button onClick={() => toggleLike(currentTrack)} className="mb-2 ml-4 flex-shrink-0">
                  <Heart className={`w-7 h-7 ${liked ? 'fill-primary text-primary' : 'text-white/50 hover:text-white'}`} />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-10">
                <div
                  className="group relative h-1.5 w-full bg-white/10 rounded-full cursor-pointer mb-2"
                  onClick={handleProgressClick}
                >
                  <div
                    className="absolute top-0 left-0 h-full rounded-full bg-primary progress-glow"
                    style={{ width: `${progress}%` }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
                  />
                </div>
                <div className="flex justify-between text-xs font-medium text-gray-500">
                  <span>{formatTime(displayCurrentTime)}</span>
                  <span>{formatTime(displayDuration)}</span>
                </div>
              </div>

              {/* Main Controls */}
              <div className="flex items-center justify-center gap-8 mb-8">
                <Shuffle className="w-5 h-5 text-gray-500 hover:text-white transition-colors cursor-pointer" />
                <SkipBack onClick={prevTrack} className="w-8 h-8 text-white hover:text-primary transition-colors cursor-pointer" fill="currentColor" />
                <button
                  onClick={togglePlay}
                  className="w-20 h-20 rounded-full liquid-accent flex items-center justify-center hover:scale-105 transition-transform"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-black fill-black" />
                  ) : (
                    <Play className="w-8 h-8 text-black fill-black ml-1" />
                  )}
                </button>
                <SkipForward onClick={nextTrack} className="w-8 h-8 text-white hover:text-primary transition-colors cursor-pointer" fill="currentColor" />
                <Repeat className="w-5 h-5 text-gray-500 hover:text-white transition-colors cursor-pointer" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Now Playing Bar */}
      <div className="fixed bottom-20 md:bottom-4 left-2 right-2 md:left-4 md:right-4 h-16 md:h-20 now-playing-bar rounded-xl md:rounded-2xl flex items-center justify-between px-4 md:px-6 z-50">

        {/* Left: Track Info */}
        <div className="flex items-center gap-4 w-[30%]" onClick={() => setExpanded(true)}>
          <div className="relative group cursor-pointer">
            <img
              alt={name}
              className="w-12 h-12 rounded-lg shadow-xl object-cover"
              src={getArtworkUrl(currentTrack.attributes.artwork.url, 100)}
            />
            <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-all">
              <ChevronDown className="w-5 h-5 text-white rotate-180" />
            </button>
          </div>
          <div className="flex flex-col min-w-0">
            <h4 className="text-sm font-semibold text-white hover:text-primary cursor-pointer transition-colors truncate">
              {String(name).slice(0, 25)}
            </h4>
            <p className="text-[11px] text-soft hover:text-white cursor-pointer transition-colors truncate">
              {artistName} • {albumName}
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); toggleLike(currentTrack); }}
            className="text-primary ml-2 hover:scale-110 transition-transform"
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-primary' : ''}`} />
          </button>
        </div>

        {/* Center: Controls & Progress */}
        <div className="flex flex-col items-center w-[40%] gap-2">
          {/* Control Buttons */}
          <div className="flex items-center gap-8">
            <button className="text-gray-400 hover:text-white transition-colors">
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); prevTrack(); }}
              className="text-gray-300 hover:text-white transition-colors"
            >
              <SkipBack className="w-5 h-5" fill="currentColor" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="liquid-accent w-11 h-11 rounded-full flex items-center justify-center text-black hover:scale-105 transition-all"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-black" />
              ) : (
                <Play className="w-5 h-5 fill-black ml-0.5" />
              )}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextTrack(); }}
              className="text-gray-300 hover:text-white transition-colors"
            >
              <SkipForward className="w-5 h-5" fill="currentColor" />
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full flex items-center gap-3 text-[10px] text-soft font-medium">
            <span className="w-8 text-right">{formatTime(displayCurrentTime)}</span>
            <div
              className="flex-1 h-1.5 bg-white/5 rounded-full cursor-pointer relative group"
              onClick={(e) => { e.stopPropagation(); handleProgressClick(e); }}
            >
              <div
                className="absolute top-0 left-0 h-full bg-primary rounded-full progress-glow group-hover:bg-accent transition-all"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-lg transition-all"
                style={{ left: `${progress}%` }}
              />
            </div>
            <span className="w-8">{formatTime(displayDuration)}</span>
          </div>
        </div>

        {/* Right: Volume & Extras */}
        <div className="flex items-center justify-end gap-5 w-[30%] text-gray-400">
          <button className="hover:text-primary transition-colors hidden md:block">
            <Mic2 className="w-5 h-5" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="hover:text-primary transition-colors hidden md:block"
                title="Add to Playlist"
              >
                <ListPlus className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-[#0a0a0a] border-white/10 text-white" align="end" side="top">
              <DropdownMenuLabel>Add to Playlist</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              {playlists.length === 0 ? (
                <DropdownMenuItem disabled className="text-gray-500">
                  No playlists created
                </DropdownMenuItem>
              ) : (
                playlists.map(p => (
                  <DropdownMenuItem
                    key={p.id}
                    className="focus:bg-white/10 cursor-pointer"
                    onClick={() => {
                      addToPlaylist(p.id, currentTrack);
                      toast.success(`Added to ${p.name}`);
                    }}
                  >
                    <span>{p.name}</span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Volume Control */}
          <div className="hidden md:flex items-center gap-3 w-32 group">
            <Volume2 className="w-5 h-5 group-hover:text-white" />
            <div className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer relative">
              <div
                className="absolute top-0 left-0 h-full bg-gray-400 group-hover:bg-primary rounded-full transition-all"
                style={{ width: `${volume}%` }}
              />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <button
            onClick={() => setExpanded(true)}
            className="hover:text-white transition-colors"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
}