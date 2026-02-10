import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Music } from "lucide-react";
import { useFavorites } from "@/contexts/FavoritesContext";
import DesktopSidebar from "@/components/DesktopSidebar";
import PlaylistView from "@/components/PlaylistView";

export default function PlaylistPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { playlists, deletePlaylist, renamePlaylist } = useFavorites();

    const playlist = useMemo(() =>
        playlists.find((p) => p.id === id),
        [playlists, id]
    );

    if (!playlist) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white bg-[#050505] pl-0 md:pl-80">
                <DesktopSidebar />
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Playlist not found</h2>
                    <button
                        onClick={() => navigate("/")}
                        className="px-6 py-2 bg-primary rounded-full text-black font-bold"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    const handleDelete = () => {
        deletePlaylist(playlist.id);
        navigate("/");
    };

    const handleRename = (newName: string) => {
        renamePlaylist(playlist.id, newName);
    };

    return (
        <div className="flex min-h-screen w-full bg-[#050505] overflow-hidden no-scrollbar text-white">
            <DesktopSidebar />
            <PlaylistView
                title={playlist.name}
                tracks={playlist.tracks}
                // Use first track's artwork if available
                image={playlist.tracks.length > 0 ? playlist.tracks[0].attributes.artwork.url : undefined}
                // Fallback icon
                icon={<Music className="w-20 h-20 text-gray-600" />}
                subtitle="Public Playlist"
                description={
                    <>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-300">{playlist.tracks.length} songs</span>
                    </>
                }
                isEditable={true}
                isDeletable={true}
                onRename={handleRename}
                onDelete={handleDelete}
            />
        </div>
    );
}
