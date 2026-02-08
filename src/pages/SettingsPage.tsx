import { motion } from "framer-motion";
import { Settings, Sun, Moon, Palette, Check } from "lucide-react";
import { useTheme, colorThemes } from "@/contexts/ThemeContext";

export default function SettingsPage() {
  const { theme, toggleTheme, colorTheme, setColorTheme } = useTheme();

  return (
    <div className="min-h-screen pb-36 md:pb-24">
      <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">Customize your experience</p>
          </div>
        </motion.div>

        {/* Theme Mode */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-5 space-y-4"
        >
          <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
            {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            Appearance
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => theme === "dark" && toggleTheme()}
              className={`glass p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                theme === "light" ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center">
                <Sun className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">Light</span>
            </button>
            
            <button
              onClick={() => theme === "light" && toggleTheme()}
              className={`glass p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                theme === "dark" ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center">
                <Moon className="w-6 h-6 text-primary" />
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
          className="glass-card rounded-2xl p-5 space-y-4"
        >
          <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Color Theme
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {colorThemes.map((t, i) => (
              <motion.button
                key={t.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                onClick={() => setColorTheme(t.id)}
                className={`glass p-4 rounded-xl flex flex-col items-center gap-3 transition-all ${
                  colorTheme === t.id ? "ring-2 ring-primary" : ""
                }`}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center relative"
                  style={{ backgroundColor: `hsl(${t.color})` }}
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
          className="glass-card rounded-2xl p-5 space-y-4"
        >
          <h2 className="text-lg font-display font-semibold text-foreground">Preview</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                <div className="w-8 h-8 rounded-lg bg-primary animate-breathe" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Sample Track</p>
                <p className="text-sm text-muted-foreground">Artist Name</p>
              </div>
              <button className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center glow-primary">
                ▶
              </button>
            </div>
            
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-2/3 bg-primary rounded-full" />
            </div>
            
            <div className="flex gap-2">
              <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium">
                Primary
              </span>
              <span className="px-3 py-1 text-xs rounded-full bg-accent/10 text-accent font-medium">
                Accent
              </span>
              <span className="px-3 py-1 text-xs rounded-full bg-muted text-muted-foreground font-medium">
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
          className="glass-card rounded-2xl p-5 text-center space-y-2"
        >
          <h2 className="text-xl font-display font-bold text-gradient">SonicFlow</h2>
          <p className="text-sm text-muted-foreground">Version 1.0.0</p>
          <p className="text-xs text-muted-foreground">Built with love for music lovers</p>
        </motion.section>
      </div>
    </div>
  );
}
