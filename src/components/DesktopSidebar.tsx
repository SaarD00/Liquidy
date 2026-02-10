
import { Home, Compass, Library, Heart, Settings, Plus, Music } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";
import { getArtworkUrl } from "@/lib/api";

const mainNavItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Compass, label: "Browse", path: "/search" },
];

const libraryFilters = ["Playlists", "Artists"];

export default function DesktopSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { likedSongs, playlists, createPlaylist } = useFavorites();
  const { user } = useAuth();

  // Get first few favorites for library display
  const libraryItems = likedSongs.slice(0, 3);

  const handleCreatePlaylist = () => {
    const name = `My Playlist #${playlists.length + 1}`;
    const newPlaylist = createPlaylist(name);
    navigate(`/playlist/${newPlaylist.id}`);
  };

  return (
    <aside className="hidden md:flex fixed left-4 top-20 bottom-28 w-72 z-40 flex-col gap-4">

      {/* Top Navigation Panel */}
      <div className="glass-panel rounded-2xl p-5 flex flex-col gap-5">
        {mainNavItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex items-center gap-4 px-2 cursor-pointer transition-colors ${active
                ? "text-white"
                : "text-gray-300 hover:text-white"
                }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-primary' : ''}`} />
              <span className="font-medium">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Library Panel */}
      <div className="flex-1 glass-panel rounded-2xl overflow-hidden flex flex-col">
        {/* Library Header */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center justify-between text-gray-400 mb-4">
            <div className="flex items-center gap-3">
              <Library className="w-5 h-5" />
              <span className="font-semibold text-white text-sm">Your Library</span>
            </div>
            <button
              className="hover:text-white transition-colors"
              onClick={handleCreatePlaylist}
              title="Create Playlist"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {libraryFilters.map((filter) => (
              <span
                key={filter}
                className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-white hover:bg-white/10 cursor-pointer transition-colors whitespace-nowrap"
              >
                {filter}
              </span>
            ))}
          </div>
        </div>

        {/* Library Items */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {/* Liked Songs - Always show */}
          <button
            onClick={() => navigate("/favorites")}
            className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer group transition-all ${location.pathname === "/favorites" ? "bg-white/5" : ""
              }`}
          >
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <h4 className="text-sm font-medium text-white truncate">Liked Songs</h4>
              <p className="text-xs text-soft flex items-center gap-1">
                Playlist • {likedSongs.length} songs
              </p>
            </div>
          </button>

          {/* User Playlists */}
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => navigate(`/playlist/${playlist.id}`)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer group transition-all ${location.pathname === `/playlist/${playlist.id}` ? "bg-white/5" : ""}`}
            >
              <div className="w-11 h-11 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
                {playlist.tracks.length > 0 ? (
                  <img
                    src={getArtworkUrl(playlist.tracks[0].attributes.artwork.url, 100)}
                    className="w-full h-full object-cover"
                    alt={playlist.name}
                  />
                ) : (
                  <Music className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h4 className="text-sm font-medium text-white truncate">
                  {playlist.name}
                </h4>
                <p className="text-xs text-soft truncate">
                  Playlist • {playlist.tracks.length} songs
                </p>
              </div>
            </button>
          ))}

          {/* Empty state if no favorites */}
          {likedSongs.length === 0 && (
            <div className="text-center py-8">
              <Music className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No liked songs yet</p>
              <p className="text-xs text-gray-600 mt-1">Search and like songs to see them here</p>
            </div>
          )}
        </div>
      </div>

      {/* Settings / Profile Button */}
      <button
        onClick={() => navigate("/settings")}
        className={`glass-panel rounded-2xl p-4 flex items-center gap-3 transition-colors ${location.pathname === "/settings"
          ? "text-primary border-primary/30 bg-primary/10"
          : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user ? 'bg-primary/20 text-primary' : 'bg-gray-800 text-gray-400'}`}>
          {user ? (
            <span className="font-bold text-xs">
              {user.user_metadata?.username
                ? user.user_metadata.username.charAt(0).toUpperCase()
                : user.email?.charAt(0).toUpperCase()}
            </span>
          ) : (
            <Settings className="w-5 h-5" />
          )}
        </div>
        <div className="flex flex-col items-start">
          <span className="font-medium text-sm text-white">
            {user ? 'My Account' : 'Settings'}
          </span>
          {user && <span className="text-[10px] text-primary">Signed In</span>}
        </div>
      </button>
    </aside>
  );
}