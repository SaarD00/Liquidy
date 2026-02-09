import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Heart, MoreHorizontal, User, Search, Youtube } from "lucide-react";
import { searchTracks, SearchTrack, getArtworkUrl, formatDuration, isYouTubeTrack } from "@/lib/api";
import { usePlayer } from "@/contexts/PlayerContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useSettings } from "@/contexts/SettingsContext";
import { extractColorsFromImage } from "@/lib/colorExtractor";
import SearchBar from "@/components/SearchBar";
import DesktopSidebar from "@/components/DesktopSidebar";

const QUICK_PICKS = [
  { name: "Lo-fi", query: "lofi beats" },
  { name: "Rock", query: "rock music" },
  { name: "Pop", query: "pop hits" },
  { name: "Hip Hop", query: "hip hop" },
  { name: "Jazz", query: "jazz music" },
  { name: "Electronic", query: "electronic" },
];

// Default gradient colors
const DEFAULT_COLORS = {
  primary: 'rgba(92, 179, 246, 0.3)',
  secondary: 'rgba(236, 72, 154, 0.47)',
  accent: 'rgba(84, 49, 166, 0.53)',
  accent2: 'rgba(6, 130, 212, 0.19)',
  accent3: 'rgba(117, 46, 183, 0.28)',
  center: 'rgba(199, 54, 173, 0.35)'
};

export default function HomePage() {
  const [tracks, setTracks] = useState<SearchTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeTab, setActiveTab] = useState("MUSIC");
  const { playTrack, currentTrack, isPlaying, addToQueue, queue } = usePlayer();
  const { isLiked, toggleLike } = useFavorites();
  const { dynamicBackground } = useSettings();

  // Dynamic background colors extracted from album art
  const [bgColors, setBgColors] = useState(DEFAULT_COLORS);

  // Extract colors from current track's album art
  useEffect(() => {
    if (dynamicBackground && currentTrack?.attributes?.artwork?.url) {
      const artworkUrl = getArtworkUrl(currentTrack.attributes.artwork.url, 100);
      extractColorsFromImage(artworkUrl).then(colors => {
        setBgColors({
          primary: colors.primary,
          secondary: colors.secondary,
          accent: colors.accent,
          accent2: colors.secondary.replace('0.35', '0.2'),
          accent3: colors.accent.replace('0.25', '0.3'),
          center: colors.primary.replace('0.4', '0.25')
        });
      });
    } else {
      // Reset to default when disabled
      setBgColors(DEFAULT_COLORS);
    }
  }, [currentTrack, dynamicBackground]);

  const handleSearch = useCallback(async (query: string) => {
    setLoading(true);
    setSearched(true);
    try {
      const results = await searchTracks(query);
      setTracks(results);
      addToQueue(results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [addToQueue]);

  const handleQuickPick = (query: string) => {
    handleSearch(query);
  };

  // Get display tracks - either search results or queue
  const displayTracks = searched ? tracks : queue.slice(0, 4);
  const upNextTracks = queue.slice(1, 4);

  return (
    /* 1. MAIN WRAPPER: Deep Void Base + Mesh Gradient */
    <div className="min-h-screen w-full bg-[#0a0a0f] text-white relative overflow-hidden pb-28">

      {/* 2. THE MESH GRADIENT BACKGROUND - Dynamic or Default */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: `
            radial-gradient(at 0% 0%, ${bgColors.primary} 0px, transparent 50%),
            radial-gradient(at 80% 0%, ${bgColors.secondary} 0px, transparent 50%),
            radial-gradient(at 100% 50%, ${bgColors.accent} 0px, transparent 40%),
            radial-gradient(at 20% 100%, ${bgColors.accent2} 0px, transparent 50%),
            radial-gradient(at 80% 100%, ${bgColors.accent3} 0px, transparent 40%),
            radial-gradient(at 50% 50%, ${bgColors.center} 0px, transparent 70%)
          `
        }}
      />

      {/* Animated floating orbs for extra depth */}
      <div
        className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] animate-pulse transition-colors duration-1000"
        style={{ backgroundColor: dynamicBackground && currentTrack ? bgColors.primary.replace('0.3', '0.2').replace('0.4', '0.2') : 'rgba(147, 51, 234, 0.2)' }}
      />
      <div
        className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] transition-colors duration-1000"
        style={{ backgroundColor: dynamicBackground && currentTrack ? bgColors.secondary.replace(/[\d.]+\)$/, '0.15)') : 'rgba(236, 72, 153, 0.15)' }}
      />
      <div
        className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] rounded-full blur-[80px] transition-colors duration-1000"
        style={{ backgroundColor: dynamicBackground && currentTrack ? bgColors.accent.replace(/[\d.]+\)$/, '0.1)') : 'rgba(6, 182, 212, 0.1)' }}
      />
      <div
        className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] rounded-full blur-[60px] transition-colors duration-1000"
        style={{ backgroundColor: dynamicBackground && currentTrack ? bgColors.accent3.replace(/[\d.]+\)$/, '0.15)') : 'rgba(139, 92, 246, 0.15)' }}
      />

      {/* 3. CONTENT CONTAINER (Relative + z-10 to sit on top of background) */}

      <div className="relative z-10 flex">
        <div className="ml-28">

          <DesktopSidebar />
        </div>


        {/* Left/Center Content */}
        <div className="flex-1 p-6 md:p-6 lg:pr-0">

          {/* Header with tabs */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {["MUSIC", "PODCASTS", "LIVE"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all ${activeTab === tab
                    ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  {tab}
                </button>
              ))}
              <div className="ml-64 w-full hidden md:flex">
                <SearchBar onSearch={handleSearch} isLoading={loading} />
              </div>
            </div>
          </div>

          {/* Hero Section - Now Streaming */}
          {currentTrack ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden
                rounded-3xl p-6 mr-10 md:p-8 mb-6
                shadow-2xl border border-white/10
                /* Keeping your card specific gradient as it acts as a nice contrast to the page bg */
                bg-[#080810]
                bg-[radial-gradient(circle_at_top_right,_#8B5CF640_0%,_transparent_40%),radial-gradient(circle_at_top_left,_#3B82F640_0%,_transparent_50%)]"
            >
              <div className="">
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">

                  {/* === NEW: Vinyl Disc with Hover Effect === */}
                  <div
                    className="relative group cursor-pointer"
                    onClick={() => playTrack(currentTrack)}
                  >
                    <motion.div
                      className={`w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden relative border-4 border-[#1a1a1a] shadow-[0_0_50px_rgba(0,0,0,0.5)] ${isPlaying ? "animate-pulse" : ""}`}
                    >
                      {/* Album art (Scales on hover) */}
                      <div
                        className="w-full h-full rounded-full transform group-hover:scale-105 transition-transform duration-500"
                        style={{
                          backgroundImage: currentTrack ? `url(${getArtworkUrl(currentTrack.attributes.artwork.url, 300)})` : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />

                      {/* The Frosted Overlay (Appears on hover) */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[3px] rounded-full z-20">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
                          {isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" className="ml-1" />}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                  {/* ========================================= */}

                  {/* Track Info */}
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]" />
                      <span className="text-xs font-medium tracking-widest text-gray-400">NOW STREAMING</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl  lg:text-5xl font-bold text-white mb-1 tracking-tight">
                      {currentTrack.attributes.name}
                    </h1>

                    <p className="text-lg text-gray-200 mb-1">{currentTrack.attributes.artistName}</p>
                    <p className="text-sm text-gray-500 tracking-widest uppercase mb-6">
                      {currentTrack.attributes.albumName}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <button
                        onClick={() => playTrack(currentTrack)}
                        className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                      >
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                      </button>
                      <button
                        onClick={() => toggleLike(currentTrack)}
                        className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors border border-white/5"
                      >
                        <Heart className={`w-5 h-5 ${isLiked(currentTrack.id) ? 'fill-pink-500 text-pink-500' : 'text-white'}`} />
                      </button>
                      <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors border border-white/5">
                        <MoreHorizontal className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Welcome Hero when no track */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden
                rounded-3xl p-6 mr-10 md:p-8 mb-6
                shadow-2xl border border-white/10
                bg-[#080810]
                bg-[radial-gradient(circle_at_top_right,_#8B5CF640_0%,_transparent_40%),radial-gradient(circle_at_top_left,_#3B82F640_0%,_transparent_50%)]"
            >
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">

                {/* === NEW: Vinyl Placeholder with Hover Effect === */}
                <div className="relative group cursor-pointer">
                  <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden relative border-4 border-[#1a1a1a] bg-black/30">
                    {/* Inner content (Scales on hover) */}
                    <div className="w-full h-full flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500">
                      <div className="w-[50%] h-[50%] rounded-full bg-white/10 backdrop-blur-sm shadow-lg border border-white/20 flex items-center justify-center">
                        <Search className="w-8 h-8 text-white/60" />
                      </div>
                    </div>

                    {/* The Frosted Overlay (Appears on hover) */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[3px] rounded-full z-20">
                      <Search size={32} className="text-white/70" />
                    </div>
                  </div>
                </div>
                {/* ============================================ */}

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-gray-600" />
                    <span className="text-xs font-medium tracking-widest text-gray-400">START LISTENING</span>
                  </div>

                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1">
                    Search
                  </h1>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl italic text-indigo-200/80 mb-3 font-light">
                    For Music
                  </h2>

                  <p className="text-lg text-gray-300 mb-1">Find your favorite tracks</p>
                  <p className="text-sm text-gray-500 tracking-widest uppercase mb-6">
                    DISCOVER NEW SOUNDS
                  </p>

                  {/* Quick Pick Buttons */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    {QUICK_PICKS.slice(0, 3).map((pick) => (
                      <button
                        key={pick.name}
                        onClick={() => handleQuickPick(pick.query)}
                        className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white hover:text-black transition-all"
                      >
                        {pick.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Track Cards Grid */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 tracking-wide">
              {searched ? "Search Results" : "For You"}
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayTracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => playTrack(track)}
                  className="group relative flex flex-col p-4 rounded-3xl bg-[#121212]/40 border border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] cursor-pointer"
                >
                  {/* Card Glow on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-300 pointer-events-none" />

                  {/* Artwork */}
                  <div className="relative aspect-square mb-4 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-shadow">
                    <img
                      src={getArtworkUrl(track.attributes.artwork.url, 400)}
                      alt={track.attributes.name}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <div className={`w-12 h-12 rounded-full backdrop-blur-md border border-white/30 flex items-center justify-center ${isYouTubeTrack(track) ? 'bg-red-500/40' : 'bg-white/20'}`}>
                        <Play size={20} fill="white" className="ml-1" />
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="relative z-10 px-1">
                    <h4 className="font-bold text-white text-base truncate mb-1 group-hover:text-indigo-300 transition-colors">
                      {track.attributes.name}
                    </h4>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider truncate">
                      {track.attributes.artistName}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </div>

        {/* 4. RIGHT PANEL: GLASSMORPHISM EFFECT */}
        <div className="hidden xl:block w-[400px]  rounded-xl h-full mt-20 pr-5 relative z-20">
          <div className="h-full w-full  rounded-xl 
          /* LIQUID GLASS MAGIC */
          bg-gradient-to-tr from-[#281c46]/50 via-indigo-500/10 to-pink/50
          backdrop-blur-lg
          border-l border-white/20
          shadow-[-10px_0_30px_rgba(0,0,0,0.5)]
          p-8 flex flex-col
        ">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-bold  tracking-[0.1em] uppercase">Up Next</h3>
              <button className="px-2 hover:bg-white/5 rounded-full transition-colors">
                <MoreHorizontal size={20} className="text-gray-400" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2  scrollbar-thin scrollbar-thumb-white/10">
              {upNextTracks.length > 0 ? upNextTracks.map((track, i) => (
                <div key={i} onClick={() => playTrack(track)} className="group flex items-center gap-4 p-2 px-2 rounded-2xl hover:bg-white/10 transition-all cursor-pointer border border-transparent hover:border-white/5">
                  <div className="relative">
                    <img src={getArtworkUrl(track.attributes.artwork.url, 100)} className="w-14 h-14 rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform" />
                    {isYouTubeTrack(track) && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                        <Youtube size={10} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-sm truncate">{track.attributes.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{track.attributes.artistName}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isYouTubeTrack(track) ? 'bg-red-500' : 'bg-white'}`}>
                      <Play size={12} fill={isYouTubeTrack(track) ? "white" : "black"} className="ml-0.5" />
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center text-gray-600 mt-20 italic">Queue is empty</div>
              )}
            </div>

            {/* Bottom "Now Playing" Lyrics/Visualizer area */}
            <div className="mt-20 p-6 rounded-3xl bg-black/20 border border-white/5 relative overflow-hidden group">
              {/* Simple visualizer bars */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-indigo-500/10 to-transparent pointer-events-none" />
              <p className="relative z-10 text-lg font-thin  text-white/80 text-center leading-relaxed">
                <span className="brightness-125">"Floating through the</span> <br /> <span className=" text-indigo-300 blur-[1.3px]">endless night...</span>"
              </p>
              <div className="flex justify-center gap-1 mt-6 h-6 items-end">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-indigo-400 blur-[1px] brightness-125 rounded-full"
                    animate={{ height: ["20%", "80%", "20%"] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}