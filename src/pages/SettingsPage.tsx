import { motion } from "framer-motion";
import { Settings, Sun, Moon, Palette, Check, User, Sparkles } from "lucide-react";
import { useTheme, colorThemes } from "@/contexts/ThemeContext";
import { useSettings } from "@/contexts/SettingsContext";

export default function SettingsPage() {
  const { theme, toggleTheme, colorTheme, setColorTheme } = useTheme();
  const { dynamicBackground, setDynamicBackground } = useSettings();

  return (
    <div className="min-h-screen pb-36 md:pb-28">
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20">
              <Settings className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground">Customize your experience</p>
            </div>
          </motion.div>

          {/* Profile */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Dynamic Background */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card rounded-2xl p-6 mb-6"
        >
          <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-3 mb-5">
            <Sparkles className="w-5 h-5 text-primary" />
            Dynamic Background
          </h2>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground mb-1">Album Art Colors</p>
              <p className="text-xs text-muted-foreground">
                The background gradient changes based on the currently playing song's cover art
              </p>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={() => setDynamicBackground(!dynamicBackground)}
              className={`relative w-14 h-8 rounded-full transition-all duration-300 ${dynamicBackground
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                  : 'bg-gray-600'
                }`}
            >
              <motion.div
                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                animate={{ left: dynamicBackground ? '30px' : '4px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          {dynamicBackground && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 text-xs text-green-400 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Dynamic background is active! Play a song to see the effect.
            </motion.p>
          )}
        </motion.section>

        {/* Theme Mode */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6 mb-6"
        >
          <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-3 mb-5">
            {theme === "dark" ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
            Appearance
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => theme === "dark" && toggleTheme()}
              className={`glass p-5 rounded-xl flex flex-col items-center gap-3 transition-all ${theme === "light" ? "ring-2 ring-primary bg-primary/10" : "hover:bg-secondary/50"
                }`}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center">
                <Sun className="w-7 h-7 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-foreground">Light</span>
            </button>

            <button
              onClick={() => theme === "light" && toggleTheme()}
              className={`glass p-5 rounded-xl flex flex-col items-center gap-3 transition-all ${theme === "dark" ? "ring-2 ring-primary bg-primary/10" : "hover:bg-secondary/50"
                }`}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
                <Moon className="w-7 h-7 text-indigo-300" />
              </div>
              <span className="text-sm font-medium text-foreground">Dark</span>
            </button>
          </div>
        </motion.section>

        {/* Color Theme */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6 mb-6"
        >
          <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-3 mb-5">
            <Palette className="w-5 h-5 text-primary" />
            Color Theme
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {colorThemes.map((t, i) => (
              <motion.button
                key={t.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                onClick={() => setColorTheme(t.id)}
                className={`glass p-4 rounded-xl flex flex-col items-center gap-3 transition-all ${colorTheme === t.id ? "ring-2 ring-primary bg-primary/10" : "hover:bg-secondary/50"
                  }`}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center relative shadow-lg"
                  style={{
                    backgroundColor: `hsl(${t.color})`,
                    boxShadow: colorTheme === t.id ? `0 0 20px hsl(${t.color} / 0.5)` : undefined
                  }}
                >
                  {colorTheme === t.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Check className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                </div>
                <span className="text-xs font-medium text-foreground text-center">{t.name}</span>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Preview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6 mb-6"
        >
          <h2 className="text-lg font-display font-semibold text-foreground mb-5">Preview</h2>

          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                <div className="w-10 h-10 rounded-lg bg-primary animate-breathe" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Sample Track</p>
                <p className="text-sm text-muted-foreground">Artist Name</p>
              </div>
              <button className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center glow-primary">
                ▶
              </button>
            </div>

            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full w-2/3 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))'
                }}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <span className="px-4 py-1.5 text-xs rounded-full bg-primary/20 text-primary font-medium">
                Primary
              </span>
              <span className="px-4 py-1.5 text-xs rounded-full bg-accent/20 text-accent font-medium">
                Accent
              </span>
              <span className="px-4 py-1.5 text-xs rounded-full bg-muted text-muted-foreground font-medium">
                Muted
              </span>
            </div>
          </div>
        </motion.section>

        {/* About */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-6 text-center"
        >
          <h2 className="text-2xl font-display font-bold text-gradient mb-2">SonicFlow</h2>
          <p className="text-sm text-muted-foreground mb-1">Version 1.0.0</p>
          <p className="text-xs text-muted-foreground">Built with love for music lovers</p>
        </motion.section>
      </div>
    </div>
  );
}
