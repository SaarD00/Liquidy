import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import Index from "./pages/Index";
import SearchPage from "./pages/SearchPage";
import LibraryPage from "./pages/LibraryPage";
import FavoritesPage from "./pages/FavoritesPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import MusicPlayer from "./components/MusicPlayer";
import BottomNav from "./components/BottomNav";
import DesktopSidebar from "./components/DesktopSidebar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <FavoritesProvider>
        <PlayerProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="flex min-h-screen w-full">
                <DesktopSidebar />
                <main className="flex-1 md:ml-56">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/library" element={<LibraryPage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
              <MusicPlayer />
              <BottomNav />
            </BrowserRouter>
          </TooltipProvider>
        </PlayerProvider>
      </FavoritesProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
