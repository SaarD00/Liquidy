import { useNavigate } from "react-router-dom";
import { Library, Play, Plus, Music, User } from "lucide-react";
import { motion } from "framer-motion";
import { useFavorites } from "@/contexts/FavoritesContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { getArtworkUrl } from "@/lib/api";

export default function LibraryPage() {
  const navigate = useNavigate();
  const { playlists, likedSongs, createPlaylist } = useFavorites();
  const { playTrack, addToQueue, queue } = usePlayer();

  const handleCreatePlaylist = () => {
    const name = prompt("Enter playlist name:");
    if (name) {
      createPlaylist(name);
    }
  };

  const handlePlayQueue = () => {
    if (queue.length > 0) {
      playTrack(queue[0]);
    }
  };

  return (
    <div className="min-h-screen pb-36 md:pb-28">
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20">
              <Library className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Your Library</h1>
              <p className="text-sm text-muted-foreground">
                {playlists.length} playlists · {likedSongs.length} liked songs
              </p>
            </div>
          </motion.div>

          {/* Profile */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Quick Access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          {/* Liked Songs Card */}
          <div
            onClick={() => likedSongs.length > 0 && (addToQueue(likedSongs), playTrack(likedSongs[0]))}
            className="glass-card rounded-2xl p-5 cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center shadow-lg">
                <Music className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">Liked Songs</p>
                <p className="text-sm text-muted-foreground">{likedSongs.length} tracks</p>
              </div>
              {likedSongs.length > 0 && (
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-4 h-4 ml-0.5" />
                </div>
              )}
            </div>
          </div>

          {/* Recently Played Card */}
          <div
            onClick={handlePlayQueue}
            className="glass-card rounded-2xl p-5 cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <Library className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">Recently Played</p>
                <p className="text-sm text-muted-foreground">{queue.length} tracks</p>
              </div>
              {queue.length > 0 && (
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-4 h-4 ml-0.5" />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Playlists Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-foreground">Your Playlists</h2>
            <button
              onClick={handleCreatePlaylist}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-foreground text-sm font-medium hover:bg-secondary/70 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Playlist
            </button>
          </div>

          {playlists.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {playlists.map((playlist, index) => (
                <motion.div
                  key={playlist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="track-card group cursor-pointer"
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                >
                  <div className="relative aspect-square bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                    {playlist.tracks.length > 0 ? (
                      <img
                        src={getArtworkUrl(playlist.tracks[0].attributes.artwork.url, 300)}
                        alt={playlist.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Music className="w-16 h-16 text-muted-foreground/30" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                        <Play className="w-5 h-5 text-black ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-foreground truncate">{playlist.name}</p>
                    <p className="text-xs text-muted-foreground">{playlist.tracks.length} tracks</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl p-8 text-center"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Music className="w-8 h-8 text-primary/50" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">No Playlists Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first playlist to organize your favorite tracks.
              </p>
              <button
                onClick={handleCreatePlaylist}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all"
              >
                <Plus className="w-4 h-4" />
                Create Playlist
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
