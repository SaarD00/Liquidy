import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { Play, Pause, Heart, MoreHorizontal, Search, Youtube, ChevronLeft, ChevronRight, Bell, Music2, Settings, LogOut, User } from "lucide-react";
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

// Get greeting based on time of day
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  const [tracks, setTracks] = useState<SearchTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { playTrack, currentTrack, isPlaying, addToQueue, queue, clearQueue } = usePlayer();
  const { isLiked, toggleLike } = useFavorites();
  const { dynamicBackground } = useSettings();
  const navigate = useNavigate();

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
  const displayTracks = searched ? tracks : queue.slice(0, 5);
  const upNextTracks = queue.slice(1, 7);

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white overflow-hidden scrollbar-hide flex flex-col antialiased selection:bg-primary selection:text-black">

      {/* Header */}
      <header className="h-20 flex items-center justify-between px-4 md:px-8 z-30 relative pl-0 md:pl-80">
        {/* Left - Navigation Arrows */}
        {/* <div className="flex items-center gap-6">
          <div className="flex gap-4">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-gray-400 hover:text-white transition-colors border border-white/5">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-gray-400 hover:text-white transition-colors border border-white/5">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div> */}

        {/* Center - Search Bar */}
        <div className="flex-1 max-w-xl ml-24 mx-4 md:mx-8">
          <SearchBar onSearch={handleSearch} isLoading={loading} />
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-6">
          <button className="text-sm font-semibold text-primary hover:text-accent transition-colors hidden md:block">
            Upgrade
          </button>
          <button className="text-gray-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="w-9 h-9 rounded-full glass-panel overflow-hidden cursor-pointer hover:border-white/30 transition-all p-0.5">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <User className="w-5 h-5 text-white/80" />
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-[#0a0a0a] border-white/10 text-white" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="focus:bg-white/10 cursor-pointer" onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-white/10 cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="focus:bg-white/10 cursor-pointer text-red-400 focus:text-red-400">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Sidebar */}
      <DesktopSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex md:overflow-hidden  px-4 pb-28 gap-4 z-10 relative pl-0 md:pl-80">

        {/* Center Content */}
        <section className="flex-1 glass-panel rounded-2xl overflow-scroll md:h-[73vh] scrollbar-hide flex flex-col relative overflow-hidden">
          {/* Emerald Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />

          <div className="flex-1 overflow-y-auto p-8 relative z-10">
            {/* Greeting */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold tracking-tight">{getGreeting()}</h2>
            </div>

            {/* Quick Access Grid - When no search */}
            {!searched && (
              <div className="grid hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                {QUICK_PICKS.slice(0, 3).map((pick) => (
                  <motion.div
                    key={pick.name}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleQuickPick(pick.query)}
                    className="group flex items-center bg-white/5 hover:bg-white/10 rounded-xl overflow-hidden transition-all border border-white/5 cursor-pointer"
                  >
                    <div className="w-12 h-12 md:w-20 md:h-20 bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center">
                      <Music2 className="w-5 h-5 md:w-8 md:h-8 text-primary" />
                    </div>
                    <span className="ml-4 font-bold text-white text-sm hidden md:block">{pick.name}</span>
                    <div className="ml-auto mr-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                      <Play className="w-5 h-5 text-black fill-black" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Section Title */}
            <div className="mb-12">
              <div className="flex justify-between items-end mb-6">
                <h3 className="text-xl font-bold">
                  {searched ? "Search Results" : "Made for you"}
                </h3>
                {displayTracks.length > 0 && (
                  <button className="text-xs font-bold text-soft hover:text-white uppercase tracking-widest transition-colors">
                    Show all
                  </button>
                )}
              </div>

              {/* Track Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {displayTracks.map((track, index) => (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => playTrack(track)}
                    className="group bg-white/[0.03] p-4 rounded-2xl hover:bg-white/[0.08] transition-all border border-white/5 cursor-pointer"
                  >
                    {/* Album Art */}
                    <div className="relative aspect-square rounded-xl overflow-hidden mb-4 shadow-2xl">
                      <img
                        alt={track.attributes.name}
                        className="w-full h-full object-cover"
                        src={getArtworkUrl(track.attributes.artwork.url, 400)}
                      />
                      {/* Play Button Overlay */}
                      <div className="absolute bottom-3 right-3 w-12 h-12 rounded-full liquid-accent flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <Play className="w-6 h-6 text-black fill-black" />
                      </div>
                      {/* YouTube Badge */}
                      {isYouTubeTrack(track) && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-red-500/90 rounded-md flex items-center gap-1">
                          <Youtube className="w-3 h-3 text-white" />
                          <span className="text-[10px] font-medium text-white">YouTube</span>
                        </div>
                      )}
                    </div>

                    {/* Track Info */}
                    <h4 className="font-bold text-white truncate text-sm">{track.attributes.name}</h4>
                    <p className="text-xs text-soft line-clamp-2 mt-1">{track.attributes.artistName}</p>
                  </motion.div>
                ))}
              </div>

              {/* Empty State */}
              {displayTracks.length === 0 && !loading && (
                <div className="text-center py-20">
                  <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-400 mb-2">Search for music</h3>
                  <p className="text-gray-500">Find your favorite songs, artists, or albums</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-6">
                    {QUICK_PICKS.map((pick) => (
                      <button
                        key={pick.name}
                        onClick={() => handleQuickPick(pick.query)}
                        className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white hover:bg-primary hover:text-black transition-all"
                      >
                        {pick.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center py-20">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right Panel - Queue */}
        <aside className="hidden xl:flex w-72 h-[94vh]  flex-col gap-4">
          <div className="glass-panel rounded-2xl overflow-hidden scrollbar-hide h-[77%] flex flex-col overflow-hidden">
            {/* Queue Header */}
            <div className="p-6 border-b border-white/5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-white text-base">Up Next</h3>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[11px] text-soft font-medium uppercase tracking-wider">
                From: {currentTrack ? currentTrack.attributes.albumName || "Queue" : "Queue"}
              </p>
            </div>

            {/* Queue Items */}
            <div className="flex-1 overflow-scroll scrollbar-hide p-2 space-y-1">
              {/* Currently Playing */}
              {currentTrack && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 group cursor-default">
                  <div className="relative w-10 h-10 shrink-0">
                    <img
                      alt={currentTrack.attributes.name}
                      className="w-full h-full rounded-md object-cover"
                      src={getArtworkUrl(currentTrack.attributes.artwork.url, 100)}
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-md">
                      {/* Animated EQ Bars */}
                      <div className="flex gap-0.5 items-end h-3">
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-0.5 bg-primary rounded-full"
                            animate={isPlaying ? { height: ["30%", "100%", "30%"] } : { height: "30%" }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-primary truncate">{currentTrack.attributes.name}</h4>
                    <p className="text-[10px] text-soft truncate">{currentTrack.attributes.artistName}</p>
                  </div>
                  <span className="text-[10px] text-primary font-medium">Playing</span>
                </div>
              )}

              {/* Up Next Items */}
              {upNextTracks.map((track, index) => (
                <motion.div
                  key={`${track.id}-${index}`}
                  onClick={() => playTrack(track)}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all group cursor-pointer"
                >
                  <img
                    alt={track.attributes.name}
                    className="w-10 h-10 rounded-md object-cover shrink-0"
                    src={getArtworkUrl(track.attributes.artwork.url, 100)}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-primary transition-colors">
                      {track.attributes.name}
                    </h4>
                    <p className="text-[10px] text-soft truncate">{track.attributes.artistName}</p>
                  </div>
                  <span className="text-[10px] text-soft group-hover:text-white">
                    {formatDuration(track.attributes.durationInMillis)}
                  </span>
                </motion.div>
              ))}

              {/* Empty Queue State */}
              {queue.length === 0 && (
                <div className="text-center py-10">
                  <Music2 className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Queue is empty</p>
                  <p className="text-xs text-gray-600 mt-1">Search for music to add tracks</p>
                </div>
              )}
            </div>

            {/* Queue Footer */}
            {queue.length > 0 && (
              <div className="p-4 bg-white/[0.02] border-t border-white/5">
                <button
                  onClick={clearQueue}
                  className="w-full py-2.5 rounded-xl border border-red-500/30 text-[11px] font-bold text-red-400 hover:bg-red-500/10 transition-all uppercase tracking-widest"
                >
                  Erase Queue
                </button>
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}