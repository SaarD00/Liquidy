import { useState, useCallback } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  live?: boolean;
}

export default function SearchBar({ onSearch, isLoading, live = false }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) onSearch(query.trim());
    },
    [query, onSearch]
  );

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="relative group">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className={`w-5 h-5 transition-colors ${focused ? 'text-primary' : 'text-gray-400'}`} />
        </div>

        {/* Input */}
        <input
          type="text"
          placeholder="Search artists, songs, or albums"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (live) onSearch(e.target.value);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`
            w-full glass-capsule rounded-full py-2.5 pl-12 pr-12 
            text-sm text-white placeholder-gray-500 
            outline-none transition-all
            ${focused ? 'ring-1 ring-primary/50' : ''}
          `}
        />

        {/* Right Side Icons */}
        <div className="absolute inset-y-0 right-4 flex items-center gap-2">
          {/* Clear Button */}
          <AnimatePresence>
            {query && (
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setQuery("")}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Loading Spinner */}
          {isLoading && (
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </div>
    </form>
  );
}
