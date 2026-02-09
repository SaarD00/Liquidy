import { Play, Clock, MoreHorizontal, Heart, Trash2, Download, Search, User, Bell, ChevronLeft, ChevronRight, Music } from "lucide-react";
import { motion } from "framer-motion";
import { useFavorites } from "@/contexts/FavoritesContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { getArtworkUrl, formatDuration } from "@/lib/api";
import DesktopSidebar from "@/components/DesktopSidebar";
import UpNext from "@/components/UpNext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { likedSongs, toggleLike } = useFavorites();
  const { playTrack, addToQueue, currentTrack, isPlaying, togglePlay } = usePlayer();
  const [searchQuery, setSearchQuery] = useState("");

  const handlePlayAll = () => {
    if (likedSongs.length > 0) {
      if (currentTrack?.id === likedSongs[0].id) {
        togglePlay();
      } else {
        addToQueue(likedSongs);
        playTrack(likedSongs[0]);
      }
    }
  };

  const filteredTracks = likedSongs.filter(t =>
    t.attributes.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.attributes.artistName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen w-full bg-[#050505] text-white">
      <DesktopSidebar />

      <div className="flex-1 flex flex-col pl-0 md:pl-80 relative min-w-0">
        {/* Top Navigation Bar */}
        <header className="h-16 flex items-center justify-between px-8 bg-[#050505]/95 backdrop-blur-md sticky top-0 z-40 border-b border-white/5">
          <div className="flex items-center gap-4">

            {/* Search in Playlist */}
            <div className="relative ml-4 hidden md:block group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-white transition-colors" />
              <input
                type="text"
                placeholder="Search in favorites"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#1a1a1a] hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] text-sm text-white pl-10 pr-4 py-2 rounded-full w-64 border-none outline-none transition-all placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Content Scrollable */}
          <div className="flex-1 overflow-y-auto relative no-scrollbar">
            {/* Gradient Background - Different color for Favorites */}
            <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-primary/30 via-[#050505]/80 to-[#050505] pointer-events-none" />

            <div className="relative z-10 px-8 py-6 pb-32">
              {/* Playlist Header */}
              <div className="flex flex-col md:flex-row items-end gap-8 mb-8 pt-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-52 h-52 md:w-60 md:h-60 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-lg bg-gradient-to-br from-primary to-accent shrink-0 flex items-center justify-center group relative"
                >
                  <Heart className="w-24 h-24 text-white fill-white drop-shadow-lg" />
                </motion.div>

                <div className="flex flex-col gap-1 md:gap-4 flex-1 min-w-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">Playlist</span>
                  <h1 className="text-4xl md:text-8xl font-black tracking-tighter text-white truncate">
                    Liked Songs
                  </h1>
                  <p className="text-sm text-gray-400 font-medium line-clamp-2 max-w-2xl">
                    Your personal collection of favorites. All the songs you love in one place.
                  </p>

                  <div className="flex items-center gap-2 text-sm font-medium mt-2 text-white">
                    <div className="flex items-center gap-1 font-bold">
                      <div className="w-5 h-5 rounded-full bg-primary text-black flex items-center justify-center text-[10px] font-bold">U</div>
                      <span className="hover:underline cursor-pointer">You</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-300">{likedSongs.length} songs</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-8 mb-8 backdrop-blur-sm sticky top-0 py-4 -mx-8 px-8 z-30 transition-all">
                <button
                  onClick={handlePlayAll}
                  className="w-14 h-14 rounded-full bg-primary hover:bg-accent text-black flex items-center justify-center hover:scale-105 transition-all shadow-lg active:scale-95"
                >
                  {isPlaying && currentTrack && likedSongs.some(t => t.id === currentTrack.id) ? (
                    <PauseIcon className="w-6 h-6 fill-black" />
                  ) : (
                    <Play className="w-6 h-6 fill-black ml-1" />
                  )}
                </button>
                <button className="text-gray-400 hover:text-white transition-colors hover:scale-105">
                  <Download className="w-8 h-8" />
                </button>
                <div className="flex-1" />
              </div>

              {/* Tracklist Header */}
              <div className="grid grid-cols-[16px_4fr_2fr_2fr_minmax(60px,1fr)] gap-4 px-4 py-2 border-b border-white/10 text-sm text-gray-400 font-medium tracking-wide uppercase">
                <div className="text-center text-base">#</div>
                <div>Title</div>
                <div className="hidden md:block">Album</div>
                <div className="hidden lg:block">Date Added</div>
                <div className="text-right flex justify-end">
                  <Clock className="w-4 h-4" />
                </div>
              </div>

              {/* Tracklist Items */}
              <div className="mt-4 flex flex-col">
                {filteredTracks.length > 0 ? filteredTracks.map((track, index) => (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track)}
                    className="group grid grid-cols-[16px_4fr_2fr_2fr_minmax(60px,1fr)] gap-4 px-4 py-3 rounded-md hover:bg-white/10 transition-colors cursor-pointer items-center"
                  >
                    <div className="text-sm text-gray-400 text-center w-4 tabular-nums relative">
                      <span className="group-hover:hidden">{index + 1}</span>
                      <Play className="w-3 h-3 text-white fill-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden group-hover:block" />
                    </div>

                    <div className="flex items-center gap-4 min-w-0">
                      <img
                        src={getArtworkUrl(track.attributes.artwork.url, 100)}
                        alt={track.attributes.name}
                        className="w-10 h-10 rounded shadow-sm object-cover"
                      />
                      <div className="min-w-0 flex flex-col">
                        <div className={`text-base font-medium truncate ${currentTrack?.id === track.id ? 'text-primary' : 'text-white'}`}>
                          {track.attributes.name}
                        </div>
                        <div className="text-sm text-gray-400 truncate group-hover:text-white transition-colors">
                          {track.attributes.artistName}
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:flex text-sm text-gray-400 truncate items-center group-hover:text-white transition-colors">
                      {track.attributes.albumName || "Unknown Album"}
                    </div>

                    <div className="hidden lg:flex text-sm text-gray-400 truncate items-center">
                      Recently
                    </div>

                    <div className="flex items-center justify-end gap-6">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleLike(track); }}
                        className="opacity-100 transition-opacity hover:scale-110"
                      >
                        <Heart className="w-4 h-4 text-primary fill-primary" />
                      </button>
                      <span className="text-sm text-gray-400 tabular-nums">
                        {formatDuration(track.attributes.durationInMillis)}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-20 text-gray-500">
                    <Heart className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                    <p className="text-lg font-medium text-white">Songs you like will appear here</p>
                    <p className="text-sm mb-6">Save songs by tapping the heart icon.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Up Next */}
          <div className="hidden xl:block w-[350px] shrink-0 border-l border-white/5 bg-[#050505]">
            <UpNext />
          </div>
        </div>
      </div>
    </div>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}
