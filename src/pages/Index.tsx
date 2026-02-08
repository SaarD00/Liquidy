import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Music2, Search, Headphones, Radio } from "lucide-react";
import { searchTracks, SearchTrack } from "@/lib/api";
import { usePlayer } from "@/contexts/PlayerContext";
import SearchBar from "@/components/SearchBar";
import TrackList from "@/components/TrackList";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

const QUICK_PICKS = ["Lo-fi", "Rock", "Pop", "Hip Hop", "Jazz", "Electronic"];

export default function HomePage() {
  const [tracks, setTracks] = useState<SearchTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { addToQueue } = usePlayer();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

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

  return (
    <div className="min-h-screen pb-36 md:pb-24">
      <div className="p-4 md:p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient">
              SonicFlow
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Your music, your vibe</p>
          </motion.div>
          <button
            onClick={toggleTheme}
            className="md:hidden glass w-10 h-10 rounded-xl flex items-center justify-center text-foreground"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Search */}
        <SearchBar onSearch={handleSearch} isLoading={loading} />

        {/* Quick picks */}
        {!searched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Genre cards */}
            <div>
              <h2 className="text-lg font-display font-semibold text-foreground mb-3">Quick Picks</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {QUICK_PICKS.map((genre, i) => (
                  <motion.button
                    key={genre}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    onClick={() => handleSearch(genre)}
                    className="glass p-4 rounded-2xl text-left hover:scale-[1.02] transition-transform group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                      {i % 3 === 0 ? <Music2 className="w-5 h-5 text-primary" /> :
                       i % 3 === 1 ? <Headphones className="w-5 h-5 text-primary" /> :
                       <Radio className="w-5 h-5 text-primary" />}
                    </div>
                    <span className="font-medium text-foreground">{genre}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-3xl p-6 md:p-8 text-center space-y-4"
            >
              <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse-glow">
                <Headphones className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl font-display font-bold text-foreground">Discover New Music</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Search millions of tracks. Listen to previews instantly. Find your next obsession.
              </p>
              <button
                onClick={() => navigate("/search")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                <Search className="w-4 h-4" />
                Start Exploring
              </button>
            </motion.div>
          </motion.div>
        )}

        {searched && <TrackList tracks={tracks} title="Results" />}
      </div>
    </div>
  );
}
