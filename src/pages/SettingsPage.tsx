import { motion } from "framer-motion";
import { Settings, Sparkles, Monitor, Brush, Volume2, Shield, Bell, ChevronRight, Check } from "lucide-react";
import { useTheme, colorThemes } from "@/contexts/ThemeContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import DesktopSidebar from "@/components/DesktopSidebar";

export default function SettingsPage() {
  const { colorTheme, setColorTheme } = useTheme();
  const { dynamicBackground, setDynamicBackground } = useSettings();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen   pb-32 bg-[#050505] text-white md:pl-80 transition-all duration-300 overflow-y-auto">
      <DesktopSidebar />

      <div className="max-w-4xl h-screen  overflow-scroll  pb-96   mx-auto px-4 pt-8 md:pt-12">
        <h1 className="text-3xl font-bold mb-8 flex  items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          Settings
        </h1>

        <div className="space-y-6 ">

          {/* Appearance Section */}
          <Section title="Appearance" icon={Brush}>
            <div className="space-y-4">
              {/* Dynamic Background */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Dynamic Background</h3>
                    <p className="text-sm text-gray-400">Adapt background colors to album art</p>
                  </div>
                </div>
                <Toggle
                  checked={dynamicBackground}
                  onChange={() => setDynamicBackground(!dynamicBackground)}
                />
              </div>

              {/* Color Theme */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <h3 className="font-medium text-white mb-4">Accent Color</h3>
                <div className="flex flex-wrap gap-3">
                  {colorThemes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setColorTheme(theme.id)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${colorTheme === theme.id ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'}`}
                      style={{ backgroundColor: `hsl(${theme.color})` }}
                    >
                      {colorTheme === theme.id && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Playback Section */}
          <Section title="Playback" icon={Volume2}>
            <div className="space-y-1">
              <SettingItem
                title="Crossfade"
                desc="Smoothly fade between songs"
                toggle={true}
              />
              <SettingItem
                title="Automix"
                desc="Allow seamless transitions"
                toggle={true}
              />

            </div>
          </Section>

          {/* Account Section */}
          <Section title="Account" icon={Shield}>
            <div className="space-y-4">
              {user ? (
                <div className="bg-white/5 p-4 rounded-xl space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <UserIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{user.user_metadata?.username || 'User'}</h3>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full flex items-center gap-2"
                    onClick={() => { signOut(); navigate('/'); }}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="bg-white/5 p-6 rounded-xl text-center space-y-4">
                  <p className="text-gray-300">Sign in to sync your library across devices.</p>
                  <Button
                    className="w-full liquid-accent text-black font-semibold"
                    onClick={() => navigate('/auth')}
                  >
                    Sign In / Sign Up
                  </Button>
                </div>
              )}

              <div className="space-y-1">
                <SettingItem title="Notifications" desc="Push and email notifications" arrow />
                <SettingItem title="Privacy" desc="Manage your data and visibility" arrow />
              </div>
            </div>
          </Section>

          {/* Branding & Credits */}
          <div className="pt-8 text-center space-y-4">
            <div className="flex justify-center items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="font-bold text-black text-sm">L</span>
              </div>
              <span className="text-xl font-bold tracking-tight">Liquidy</span>
            </div>

            <p className="text-sm text-gray-400">
              Built with <span className="text-red-500">❤️</span> by Saar
            </p>

            <a
              href="https://github.com/SaarD00/Liquidy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-sm text-gray-300 hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              View on GitHub
            </a>

            <p className="text-xs text-gray-600">v1.2.0 • Build 2024.10.05</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) {
  return (
    <section className="bg-transparent">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
        <Icon className="w-5 h-5 text-gray-400" />
        {title}
      </h2>
      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}

function SettingItem({ title, desc, toggle = false, arrow = false }: { title: string, desc: string, toggle?: boolean, arrow?: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-white/5">
      <div>
        <h3 className="font-medium text-white text-sm">{title}</h3>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
      {toggle && <div className="w-10 h-5 rounded-full bg-white/20 relative" />}
      {arrow && <ChevronRight className="w-5 h-5 text-gray-500" />}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean, onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-white/20'}`}
    >
      <div
        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`}
      />
    </button>
  );
}
