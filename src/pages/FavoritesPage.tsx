import { useRef } from "react";
import { Heart } from "lucide-react";
import { useFavorites } from "@/contexts/FavoritesContext";
import DesktopSidebar from "@/components/DesktopSidebar";
import PlaylistView from "@/components/PlaylistView";

export default function FavoritesPage() {
  const { likedSongs } = useFavorites();

  return (
    <div className="flex min-h-screen w-full bg-[#050505] overflow-hidden no-scrollbar text-white">
      <DesktopSidebar />
      <PlaylistView
        title="Liked Songs"
        tracks={likedSongs}
        subtitle="Playlist"
        description={
          <>
            <div className="flex items-center gap-1 font-bold">
              <div className="w-5 h-5 rounded-full bg-primary text-black flex items-center justify-center text-[10px] font-bold">U</div>
              <span className="hover:underline cursor-pointer">You</span>
            </div>
            <span className="text-gray-400">•</span>
            <span className="text-gray-300">{likedSongs.length} songs</span>
          </>
        }
        icon={<Heart className="w-24 h-24 text-white fill-white drop-shadow-lg" />}
        gradientColor="from-purple-900/40"
        // Favorites are not renamed or deleted as a playlist
        isEditable={false}
        isDeletable={false}
        image={undefined} // Force use icon
      />
    </div>
  );
}
