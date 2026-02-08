import { useState, useCallback } from "react";
import { searchTracks, SearchTrack } from "@/lib/api";
import { usePlayer } from "@/contexts/PlayerContext";
import SearchBar from "@/components/SearchBar";
import TrackList from "@/components/TrackList";
import { motion } from "framer-motion";
import { Music2, TrendingUp } from "lucide-react";

const SUGGESTIONS = ["Metallica", "Daft Punk", "The Weeknd", "Billie Eilish", "Eminem", "Taylor Swift"];

export default function SearchPage() {
  const [tracks, setTracks] = useState<SearchTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { addToQueue } = usePlayer();

  const handleSearch = useCallback(async (query: string) => {
    setLoading(true);
    setSearched(true);
    try {
      const results = await searchTracks(query);
      setTracks(results);
      addToQueue(results);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  }, [addToQueue]);

  return (
    <div className="min-h-screen pb-36 md:pb-24">
      <div className="p-4 md:p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center md:text-left"
        >
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Search
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Find your next favorite track</p>
        </motion.div>

        <SearchBar onSearch={handleSearch} isLoading={loading} />

        {!searched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Try searching for</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSearch(s)}
                  className="glass px-4 py-2 rounded-full text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {searched && <TrackList tracks={tracks} title={`Results (${tracks.length})`} />}
      </div>
    </div>
  );
}
