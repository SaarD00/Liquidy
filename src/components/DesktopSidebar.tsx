import { Home, Search, ListMusic, Heart, Sun, Moon, Music2, Settings, Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { motion } from "framer-motion";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Search", path: "/search" },
  { icon: ListMusic, label: "Library", path: "/library" },
  { icon: Heart, label: "Favorites", path: "/favorites" },
];

export default function DesktopSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { playlists } = useFavorites();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 z-40 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="p-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Music2 className="w-5 h-5 text-primary" />
        </div>
        <span className="font-display font-bold text-lg text-gradient">SonicFlow</span>
      </div>

      {/* Main Nav */}
      <div className="px-3 mb-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">Menu</p>
        <nav className="space-y-1">
          {navItems.map(({ icon: Icon, label, path }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                  active
                    ? "text-primary bg-primary/10"
                    : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-5 h-5" />
                {label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Playlists */}
      <div className="px-3 flex-1 overflow-hidden">
        <div className="flex items-center justify-between px-3 mb-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Playlists</p>
          <button className="w-6 h-6 rounded-md hover:bg-sidebar-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-1 overflow-y-auto max-h-40 scrollbar-hide">
          {playlists.length === 0 ? (
            <p className="text-xs text-muted-foreground px-3 py-2">No playlists yet</p>
          ) : (
            playlists.map((playlist) => (
              <button
                key={playlist.id}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors text-left"
              >
                <ListMusic className="w-4 h-4 text-muted-foreground" />
                <span className="truncate">{playlist.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">{playlist.tracks.length}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Bottom section */}
      <div className="p-3 space-y-1 border-t border-sidebar-border">
        <button
          onClick={() => navigate("/settings")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
            location.pathname === "/settings"
              ? "text-primary bg-primary/10"
              : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent"
          }`}
        >
          <Settings className="w-5 h-5" />
          Settings
        </button>
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent transition-all"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </aside>
  );
}
