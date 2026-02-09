import { Home, Search, Library, Heart, Settings, AudioWaveform, Disc } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Search", path: "/search" },
  { icon: Library, label: "Library", path: "/library" },
  { icon: Heart, label: "Favorites", path: "/favorites" },
];

export default function DesktopSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-24 scale-90 bg-white/5 backdrop-blur-lg border border-white/20   rounded-lg ml-2 z-50 flex-col items-center py-8 
      /* LIQUID GLASS CONTAINER */
      bg-[#09090b]/10
      backdrop-blur-3xl 
      border-r border-white/5 
      shadow-[5px_0_30px_rgba(0,0,0,0.5)]"
    >

      {/* Logo Section */}
      <div className="mb-10 relative group cursor-pointer">
        <div className="absolute inset-0 bg-indigo-500/30 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] border border-white/10 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
          <AudioWaveform className="w-7 h-7 text-indigo-400 drop-shadow-[0_0_5px_rgba(129,140,248,0.5)]" />
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 flex flex-col items-center gap-6 w-full px-4">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              title={label}
              className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group ${active
                ? "text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                : "text-gray-500 hover:text-indigo-200 hover:bg-white/5"
                }`}
            >
              {/* Active State: Liquid Glass Background */}
              {active && (
                <motion.div
                  layoutId="sidebar-active-bg"
                  className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-2xl backdrop-blur-md"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              {/* Active State: Neon Indicator Line */}
              {active && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_10px_#6366f1]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              {/* Icon */}
              <Icon className={`relative z-10 w-6 h-6 transition-transform duration-300 ${active ? "scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "group-hover:scale-110"}`} />

              {/* Tooltip (Frosted) */}
              <div className="absolute left-full ml-5 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl translate-x-[-10px] group-hover:translate-x-0 duration-200">
                {label}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="flex flex-col items-center gap-4 mb-4 w-full px-4">
        <button
          onClick={() => navigate("/settings")}
          title="Settings"
          className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group ${location.pathname === "/settings"
            ? "text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            : "text-gray-500 hover:text-white hover:bg-white/5"
            }`}
        >
          {location.pathname === "/settings" && (
            <motion.div
              layoutId="sidebar-active-bg"
              className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-2xl backdrop-blur-md"
            />
          )}

          <Settings className={`relative z-10 w-6 h-6 transition-transform duration-500 ${location.pathname === "/settings" ? "rotate-90 text-white" : "group-hover:rotate-90"}`} />

          {/* Tooltip */}
          <div className="absolute left-full ml-5 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
            Settings
          </div>
        </button>

        {/* User Avatar Placeholder (Matching image style) */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 border-2 border-[#09090b] shadow-lg cursor-pointer hover:scale-105 transition-transform" />
      </div>
    </aside>
  );
}