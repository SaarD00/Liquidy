import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Music2, Search, Headphones, Radio, TrendingUp, Sparkles } from "lucide-react";
import { searchTracks, SearchTrack } from "@/lib/api";
import { usePlayer } from "@/contexts/PlayerContext";
import SearchBar from "@/components/SearchBar";
import TrackList from "@/components/TrackList";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

const QUICK_PICKS = [
  { name: "Lo-fi", icon: Headphones, gradient: "from-purple-500/20 to-blue-500/20" },
  { name: "Rock", icon: Radio, gradient: "from-red-500/20 to-orange-500/20" },
  { name: "Pop", icon: Sparkles, gradient: "from-pink-500/20 to-rose-500/20" },
  { name: "Hip Hop", icon: TrendingUp, gradient: "from-yellow-500/20 to-amber-500/20" },
  { name: "Jazz", icon: Music2, gradient: "from-blue-500/20 to-cyan-500/20" },
  { name: "Electronic", icon: Radio, gradient: "from-green-500/20 to-teal-500/20" },
];

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
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">What do you want to listen to?</p>
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Genre cards */}
            <div>
              <h2 className="text-lg font-display font-semibold text-foreground mb-3">Browse All</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {QUICK_PICKS.map(({ name, icon: Icon, gradient }, i) => (
                  <motion.button
                    key={name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.05 }}
                    onClick={() => handleSearch(name)}
                    className={`glass-card p-4 rounded-2xl text-left group bg-gradient-to-br ${gradient}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-3 group-hover:bg-primary/30 transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-semibold text-foreground">{name}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Hero section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-3xl p-6 md:p-8 text-center space-y-4 relative overflow-hidden"
            >
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center animate-glow-pulse">
                  <Headphones className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-display font-bold text-foreground mt-4">Discover New Music</h2>
                <p className="text-muted-foreground text-sm max-w-md mx-auto mt-2">
                  Search millions of tracks. Listen to previews instantly. Find your next obsession.
                </p>
                <button
                  onClick={() => navigate("/search")}
                  className="inline-flex items-center gap-2 px-6 py-3 mt-4 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all hover:scale-105 active:scale-95"
                >
                  <Search className="w-4 h-4" />
                  Start Exploring
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {searched && <TrackList tracks={tracks} title="Results" />}
      </div>
    </div>
  );
}
