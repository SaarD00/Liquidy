import { Heart, Play, Clock, MoreHorizontal, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useFavorites } from "@/contexts/FavoritesContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { getArtworkUrl, formatDuration } from "@/lib/api";
import { format } from "date-fns";

export default function FavoritesPage() {
  const { likedSongs, toggleLike } = useFavorites();
  const { playTrack, addToQueue, currentTrack, isPlaying, togglePlay } = usePlayer();

  const handlePlayAll = () => {
    if (likedSongs.length > 0) {
      // If already playing the first song, just toggle
      if (currentTrack?.id === likedSongs[0].id) {
        togglePlay();
      } else {
        addToQueue(likedSongs);
        playTrack(likedSongs[0]);
      }
    }
  };

  return (
    <div className="min-h-screen pb-32 w-full bg-[#050505] text-white">
      {/* Header Section with Gradient Background */}
      <div className="relative h-80 flex items-end p-8 pb-6 bg-gradient-to-b from-emerald-900/50 via-[#050505] to-[#050505]">
        {/* Absolute Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050505]" />

        <div className="relative z-10 flex items-end gap-6 w-full max-w-7xl mx-auto">
          {/* Large Cover Art */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-52 h-52 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-md bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shrink-0"
          >
            <Heart className="w-24 h-24 text-white fill-white" />
          </motion.div>

          {/* Playlist Info */}
          <div className="flex flex-col gap-2 mb-2 flex-1">
            <span className="text-sm font-bold uppercase tracking-wider">Playlist</span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white mb-4">Liked Songs</h1>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-black font-bold">
                U
              </div>
              <span className="hover:underline cursor-pointer text-white">User</span>
              <span>•</span>
              <span>{likedSongs.length} songs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 relative z-10 bg-[#050505]">
        {/* Action Bar */}
        <div className="flex items-center gap-8 py-6">
          <button
            onClick={handlePlayAll}
            className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center hover:scale-105 transition-all shadow-lg"
          >
            {isPlaying && currentTrack && likedSongs.some(t => t.id === currentTrack.id) ? (
              <PauseIcon className="w-6 h-6 fill-black" />
            ) : (
              <Play className="w-6 h-6 fill-black ml-1" />
            )}
          </button>
        </div>

        {/* Tracks List Header */}
        <div className="grid grid-cols-[16px_4fr_3fr_minmax(120px,1fr)] gap-4 px-4 py-2 border-b border-white/10 text-sm text-gray-400 font-medium sticky top-20 bg-[#050505] z-20">
          <div className="text-center">#</div>
          <div>Title</div>
          <div className="hidden md:block">Album</div>
          <div className="text-right flex items-center justify-end gap-2">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* Tracks List */}
        <div className="mt-4 space-y-2">
          {likedSongs.map((track, index) => (
            <div
              key={track.id}
              onClick={() => playTrack(track)}
              className="group grid grid-cols-[16px_4fr_3fr_minmax(120px,1fr)] gap-4 px-4 py-3 rounded-md hover:bg-white/10 transition-colors cursor-pointer items-center"
            >
              <div className="text-sm text-gray-400 text-center group-hover:hidden">
                {index + 1}
              </div>
              <div className="hidden group-hover:flex justify-center text-white">
                <Play className="w-4 h-4 fill-white" />
              </div>

              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={getArtworkUrl(track.attributes.artwork.url, 100)}
                  alt={track.attributes.name}
                  className="w-10 h-10 rounded shadow-sm object-cover"
                />
                <div className="min-w-0">
                  <div className={`text-base font-medium truncate ${currentTrack?.id === track.id ? 'text-emerald-500' : 'text-white'}`}>
                    {track.attributes.name}
                  </div>
                  <div className="text-sm text-gray-400 truncate group-hover:text-white transition-colors">
                    {track.attributes.artistName}
                  </div>
                </div>
              </div>

              <div className="hidden md:flex text-sm text-gray-400 truncate items-center group-hover:text-white transition-colors">
                {track.attributes.albumName}
              </div>

              <div className="flex items-center justify-end gap-8">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleLike(track); }}
                  className="opacity-0 group-hover:opacity-100 hover:scale-110 transition-all focus:opacity-100"
                >
                  <Heart className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                </button>
                <span className="text-sm text-gray-400 tabular-nums">
                  {formatDuration(track.attributes.durationInMillis)}
                </span>
                <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {likedSongs.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              <Heart className="w-16 h-16 mx-auto mb-4 text-gray-700" />
              <p className="text-lg font-medium text-white">Songs you like will appear here</p>
              <p className="text-sm">Save songs by tapping the heart icon.</p>
              <button className="mt-8 px-6 py-3 rounded-full bg-white text-black font-bold hover:scale-105 transition-transform">
                Find Songs
              </button>
            </div>
          )}
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
