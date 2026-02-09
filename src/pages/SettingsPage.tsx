import { motion } from "framer-motion";
import { Settings, Sparkles, Monitor, Brush, Volume2, Shield, Bell, ChevronRight, Check } from "lucide-react";
import { useTheme, colorThemes } from "@/contexts/ThemeContext";
import { useSettings } from "@/contexts/SettingsContext";

export default function SettingsPage() {
  const { colorTheme, setColorTheme } = useTheme();
  const { dynamicBackground, setDynamicBackground } = useSettings();

  return (
    <div className="min-h-screen pb-32 pl-4 pr-8 md:pl-8 pt-8 bg-[#050505] text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Settings className="w-8 h-8 text-emerald-500" />
          Settings
        </h1>

        <div className="space-y-6">

          {/* Appearance Section */}
          <Section title="Appearance" icon={Brush}>
            <div className="space-y-4">
              {/* Dynamic Background */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
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
              <SettingItem
                title="High Quality Audio"
                desc="Stream in maximum available quality"
                toggle={true}
              />
            </div>
          </Section>

          {/* Account Section */}
          <Section title="Account" icon={Shield}>
            <div className="space-y-1">
              <SettingItem title="Profile" desc="Manage your profile details" arrow />
              <SettingItem title="Notifications" desc="Push and email notifications" arrow />
              <SettingItem title="Privacy" desc="Manage your data and visibility" arrow />
            </div>
          </Section>

          <div className="pt-8 text-center text-xs text-gray-600">
            <p>SonicFlow v1.2.0 • Build 2024.10.05</p>
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
      className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-white/20'}`}
    >
      <div
        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`}
      />
    </button>
  );
}
