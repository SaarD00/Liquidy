import { Home, Search, Library, Heart, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Search", path: "/search" },
  { icon: Library, label: "Library", path: "/library" },
  { icon: Heart, label: "Favorites", path: "/favorites" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass-strong rounded-t-2xl flex items-center justify-around px-2 py-2 mx-2 mb-0">
        {navItems.map(({ icon: Icon, label, path }, index) => {
          const active = location.pathname === path;

          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-1 py-2 px-4 relative w-full"
            >
              {active && (
                <motion.div
                  layoutId="nav-indicator-mobile"
                  className="absolute -top-1 w-8 h-1 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))'
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              {label === "Settings" && user ? (
                <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-primary/20 text-primary transition-colors border border-primary/30 ${active ? 'ring-2 ring-primary/50' : ''}`}>
                  <span className="font-bold text-[10px]">
                    {user.user_metadata?.username
                      ? user.user_metadata.username.charAt(0).toUpperCase()
                      : user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              ) : (
                <Icon className={`w-5 h-5 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`} />
              )}

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
