import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Heart, ChevronDown, MoreHorizontal, Shuffle, Repeat, Volume2, Mic2 } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { formatTime, getArtworkUrl, isYouTubeTrack } from "@/lib/api";
import { useState, useRef, useEffect, useCallback } from "react";

// Default duration for YouTube videos (3.5 minutes) - will update as video plays
const DEFAULT_YOUTUBE_DURATION = 210;

export default function MusicPlayer() {
  const {
    currentTrack, isPlaying, togglePlay, currentTime, duration,
    seekTo, nextTrack, prevTrack, coverArtUrl, isYouTube, videoId
  } = usePlayer();
  const { isLiked, toggleLike } = useFavorites();
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

  // Reset when video changes
  useEffect(() => {
    if (videoId && videoId !== lastVideoIdRef.current) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Reset time tracking
      setYtCurrentTime(0);
      setYtDuration(DEFAULT_YOUTUBE_DURATION);
      savedTimeRef.current = 0;
      playStartTimeRef.current = null;
      lastVideoIdRef.current = videoId;
    }
  }, [videoId]);

  // Real-time progress tracking for YouTube
  useEffect(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isYouTubeVideo && isPlaying && videoId) {
      // Started playing - record the start time
      playStartTimeRef.current = Date.now();

      // Start interval to update current time every 500ms
      intervalRef.current = setInterval(() => {
        if (playStartTimeRef.current) {
          const elapsedSincePlay = (Date.now() - playStartTimeRef.current) / 1000;
          const totalTime = savedTimeRef.current + elapsedSincePlay;
          setYtCurrentTime(totalTime);
        }
      }, 500);
    } else if (isYouTubeVideo && !isPlaying) {
      // Paused - save the current time
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
    // Update saved time to seek position
    savedTimeRef.current = seekTime;
    setYtCurrentTime(seekTime);

    // If currently playing, need to restart playback from new position
    if (isPlaying) {
      playStartTimeRef.current = Date.now();
    }

    // Force iframe to reload with new start time by toggling play
    if (isPlaying) {
      togglePlay(); // pause
      setTimeout(() => togglePlay(), 50); // play from new position
    }
  }, [isPlaying, togglePlay]);

  if (!currentTrack) return null;

  const { name, artistName } = currentTrack.attributes;
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
      {/* Hidden YouTube Player - Only rendered when isPlaying is true, with start time for resume */}
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

      {/* --- EXPANDED OVERLAY (Full View with Album Art) --- */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed scrollbar-hide inset-0 z-[60] flex flex-col bg-[#09090b]/98 backdrop-blur-3xl"
          >
            {/* Background Gradient Mesh */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px]" />
              <div className="absolute top-[30%] left-[50%] w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[80px]" />
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

              {/* Large Album Art with Pulse Animation */}
              <div className="flex-1 flex items-center justify-center mb-10">
                <motion.div
                  className="relative"
                  animate={isPlaying ? {
                    scale: [1, 1.02, 1],
                  } : { scale: 1 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {/* Glow Effect Behind Album Art */}
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

                    {/* Vinyl-style center overlay when playing */}
                    {isPlaying && (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                          <motion.div
                            className="w-3 h-3 rounded-full bg-white/60"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              </div>

              {/* Track Info */}
              <div className="flex items-end justify-between mb-8">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 truncate">{String(name).slice(0, 32)}</h2>
                  <p className="text-lg text-indigo-200/70 truncate">{artistName}</p>
                </div>
                <button onClick={() => toggleLike(currentTrack)} className="mb-2 ml-4 flex-shrink-0">
                  <Heart className={`w-7 h-7 ${liked ? 'fill-pink-500 text-pink-500' : 'text-white/50 hover:text-white'}`} />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-10">
                <div
                  className="group relative h-1.5 w-full bg-white/10 rounded-full cursor-pointer mb-2"
                  onClick={handleProgressClick}
                >
                  <div
                    className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
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
                <SkipBack onClick={prevTrack} className="w-8 h-8 text-white hover:text-indigo-400 transition-colors cursor-pointer" fill="currentColor" />
                <button
                  onClick={togglePlay}
                  className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-black fill-black" />
                  ) : (
                    <Play className="w-8 h-8 text-black fill-black ml-1" />
                  )}
                </button>
                <SkipForward onClick={nextTrack} className="w-8 h-8 text-white hover:text-indigo-400 transition-colors cursor-pointer" fill="currentColor" />
                <Repeat className="w-5 h-5 text-gray-500 hover:text-white transition-colors cursor-pointer" />
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* --- FLOATING PILL PLAYER (Fixed at Bottom) --- */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-6 z-40 
        left-0 right-0 mx-auto 
        w-[95%] max-w-4xl"
      >
        <div
          className="relative flex items-center justify-between p-2 pr-6 rounded-[3rem] 
          bg-[#080810]/80 backdrop-blur-2xl 
          border border-white/10 
          shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          onClick={() => setExpanded(true)}
        >

          {/* LEFT: Info & Art */}
          <div className="flex items-center gap-4 group cursor-pointer">
            {/* Album Art with pulse when playing */}
            <div className={`relative w-14 h-14 rounded-full border border-white/10 overflow-hidden bg-black flex-shrink-0`}>
              <motion.img
                src={getArtworkUrl(currentTrack.attributes.artwork.url, 100)}
                alt={name}
                className="w-full h-full object-cover"
                animate={isPlaying ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Center hole for vinyl look */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 bg-[#080810] rounded-full border border-white/10" />
              </div>
            </div>

            <div className="flex flex-col min-w-0 pr-4">
              <h4 className="text-white font-bold text-sm truncate leading-tight">{String(name).slice(0, 20)}</h4>
              <p className="text-[11px] text-gray-400 uppercase tracking-wider truncate font-medium">
                {artistName}
              </p>
            </div>
          </div>


          {/* CENTER: Controls & Progress (Desktop) */}
          <div className="hidden md:flex flex-col items-center gap-2 flex-1 max-w-sm px-4">

            {/* Control Icons Row */}
            <div className="flex items-center gap-6">
              <button className="text-gray-500 hover:text-white transition-colors"><Shuffle size={16} /></button>
              <button onClick={(e) => { e.stopPropagation(); prevTrack(); }} className="text-white hover:text-indigo-400 transition-colors"><SkipBack size={20} fill="currentColor" /></button>

              {/* The Play Button */}
              <button
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.3)]"
              >
                {isPlaying ? (
                  <Pause size={20} className="text-indigo-600 fill-indigo-600" />
                ) : (
                  <Play size={20} className="text-indigo-600 fill-indigo-600 ml-0.5" />
                )}
              </button>

              <button onClick={(e) => { e.stopPropagation(); nextTrack(); }} className="text-white hover:text-indigo-400 transition-colors"><SkipForward size={20} fill="currentColor" /></button>
              <button className="text-gray-500 hover:text-white transition-colors"><Repeat size={16} /></button>
            </div>

            {/* Progress Bar Row */}
            <div className="w-full flex items-center gap-3">
              <span className="text-[10px] text-gray-500 font-mono w-8 text-right">{formatTime(displayCurrentTime)}</span>

              {/* The Glowing Progress Line */}
              <div
                className="relative flex-1 h-1 bg-white/5 rounded-full cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  handleProgressClick(e);
                }}
              >
                <div
                  className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                  style={{ width: `${progress}%` }}
                />
                <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ left: `${progress}%` }} />
              </div>

              <span className="text-[10px] text-gray-500 font-mono w-8">{formatTime(displayDuration)}</span>
            </div>
          </div>


          {/* RIGHT: Volume & Extras */}
          <div className="flex items-center gap-4 pl-4 border-l border-white/5 h-8">
            {/* Mobile Play Button */}
            <button
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="md:hidden w-10 h-10 rounded-full bg-white text-indigo-900 flex items-center justify-center"
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>

            {/* Desktop Right Side */}
            <div className="hidden md:flex items-center gap-3">
              <button className="text-gray-400 hover:text-white transition-colors"><Mic2 size={18} /></button>

              <div className="flex items-center gap-2 group">
                <Volume2 size={18} className="text-gray-400" />
                <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer relative">
                  <div className="absolute top-0 left-0 h-full bg-gray-400 group-hover:bg-white transition-colors" style={{ width: `${volume}%` }} />
                  <input
                    type="range" min="0" max="100"
                    value={volume} onChange={(e) => setVolume(Number(e.target.value))}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </>
  );
}