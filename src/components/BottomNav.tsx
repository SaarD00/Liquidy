import { Home, Search, ListMusic, Heart, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Search", path: "/search" },
  { icon: ListMusic, label: "Library", path: "/library" },
  { icon: Heart, label: "Favorites", path: "/favorites" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass-strong rounded-t-3xl flex items-center justify-around px-2 py-3">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-1 py-1 px-3 relative"
            >
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-1 w-10 h-1 bg-primary rounded-full glow-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-[10px] transition-colors ${active ? "text-primary font-medium" : "text-muted-foreground"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
