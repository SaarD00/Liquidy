import { useState, useMemo } from "react";
import { Play, Clock, MoreHorizontal, Heart, Trash2, Download, Search, User, Bell, Pause } from "lucide-react";
import { motion } from "framer-motion";
import { useFavorites } from "@/contexts/FavoritesContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { getArtworkUrl, formatDuration, SearchTrack } from "@/lib/api";
import SearchBar from "@/components/SearchBar";
import UpNext from "@/components/UpNext";

interface PlaylistViewProps {
    title: string;
    tracks: SearchTrack[];
    subtitle?: string;
    description?: React.ReactNode;
    image?: string; // Start with image URL
    icon?: React.ReactNode; // Fallback icon component
    isEditable?: boolean; // Can rename?
    isDeletable?: boolean; // Can delete entire playlist?
    onRename?: (newName: string) => void;
    onDelete?: () => void;
    gradientColor?: string;
}

export default function PlaylistView({
    title,
    tracks,
    subtitle = "Playlist",
    description,
    image,
    icon,
    isEditable = false,
    isDeletable = false,
    onRename,
    onDelete,
    gradientColor = "from-primary/30"
}: PlaylistViewProps) {
    const { isLiked, toggleLike } = useFavorites();
    const { playTrack, addToQueue, currentTrack, isPlaying, togglePlay } = usePlayer();

    // Local state for search and editing
    const [searchQuery, setSearchQuery] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(title);

    // Filter tracks based on local search
    const filteredTracks = useMemo(() => {
        if (!searchQuery.trim()) return tracks;
        const lower = searchQuery.toLowerCase();
        return tracks.filter(t =>
            t.attributes.name.toLowerCase().includes(lower) ||
            t.attributes.artistName.toLowerCase().includes(lower)
        );
    }, [tracks, searchQuery]);

    // Update edit name when title prop changes (e.g. navigation)
    useMemo(() => {
        setEditName(title);
    }, [title]);

    const handlePlayAll = () => {
        if (tracks.length > 0) {
            if (currentTrack?.id === tracks[0].id) {
                togglePlay();
            } else {
                addToQueue(tracks);
                playTrack(tracks[0]);
            }
        }
    };

    const handleRenameSubmit = () => {
        if (isEditable && onRename && editName.trim()) {
            onRename(editName);
            setIsEditing(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col pl-0 md:pl-80 relative min-w-0">
            {/* Top Navigation Bar */}
            <header className="h-16 flex items-center justify-between px-8 bg-[#050505]/95 backdrop-blur-md sticky top-0 z-40 border-b border-white/5">
                <div className="flex items-center gap-4 flex-1">
                    {/* Search in Playlist */}
                    <div className="relative ml-0 hidden md:block group max-w-md w-full">
                        <SearchBar onSearch={setSearchQuery} live />
                    </div>
                </div>

                <div className="flex items-center gap-6 ml-4">
                    <button className="text-gray-400 hover:text-white transition-colors">
                        <Bell className="w-5 h-5" />
                    </button>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                        <User className="w-4 h-4 text-white" />
                    </div>
                </div>
            </header>

            <div className="flex-1 flex md:p-2 gap-3 overflow-hidden">
                {/* Main Content Scrollable */}
                <div className="flex-1 overflow-scroll md:h-[73%] relative no-scrollbar">
                    {/* Gradient Background */}
                    <div className={`absolute inset-x-0 top-0 h-screen rounded-lg bg-white/10 border-white/10 border bg-gradient-to-b ${gradientColor} via-[#050505]/80 to-[#050505] pointer-events-none`} />

                    <div className="relative z-10 px-4 md:px-8 py-6 overflow-scroll h-screen pb-20">
                        {/* Playlist Header */}
                        <div className="flex flex-col md:flex-row items-end gap-6 md:gap-8 mb-8 pt-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-52 h-52 md:w-52 md:h-52 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-lg bg-[#282828] shrink-0 flex items-center justify-center overflow-hidden group relative mx-auto md:mx-0"
                            >
                                {image ? (
                                    <img
                                        src={getArtworkUrl(image, 600)}
                                        alt={title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    icon || <Heart className="w-20 h-20 text-gray-600" />
                                )}
                            </motion.div>

                            <div className="flex flex-col gap-1 md:gap-4 flex-1 min-w-0 text-center md:text-left">
                                <span className="text-xs font-bold uppercase tracking-wider text-white">{subtitle}</span>

                                {isEditing ? (
                                    <div className="flex items-center justify-center md:justify-start">
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="bg-transparent border-b border-white text-3xl md:text-5xl font-black text-white w-full outline-none text-center md:text-left"
                                            autoFocus
                                            onBlur={handleRenameSubmit}
                                            onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit()}
                                        />
                                    </div>
                                ) : (
                                    <h1
                                        className={`text-3xl md:text-6xl font-black tracking-tighter text-white break-words ${isEditable ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
                                        onClick={() => isEditable && setIsEditing(true)}
                                    >
                                        {title}
                                    </h1>
                                )}

                                <div className="text-sm font-medium mt-2 text-white">
                                    {description}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-4 backdrop-blur-sm sticky top-0 py-4 -mx-4 md:-mx-8 px-4 md:px-8 z-30 transition-all">
                            <button
                                onClick={handlePlayAll}
                                className="w-10 h-10 rounded-full bg-primary hover:bg-accent text-black flex items-center justify-center hover:scale-105 transition-all shadow-lg active:scale-95"
                            >
                                {isPlaying && currentTrack && tracks.some(t => t.id === currentTrack.id) ? (
                                    <Pause className="w-5 h-5 fill-black" />
                                ) : (
                                    <Play className="w-5 h-5 fill-black ml-1" />
                                )}
                            </button>
                            <button className="text-gray-400 hover:text-white transition-colors hover:scale-105">
                                <Heart className="w-8 h-8" />
                            </button>
                            <button className="text-gray-400 hover:text-white transition-colors hover:scale-105">
                                <Download className="w-8 h-8" />
                            </button>
                            <div className="flex-1" />

                            <div className="flex gap-4">
                                {isDeletable && onDelete && (
                                    <button
                                        onClick={() => {
                                            if (confirm("Are you sure you want to delete this playlist?")) {
                                                onDelete();
                                            }
                                        }}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                        title="Delete Playlist"
                                    >
                                        <Trash2 className="w-6 h-6" />
                                    </button>
                                )}
                                <button className="text-gray-400 hover:text-white transition-colors">
                                    <MoreHorizontal className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Tracklist Header */}
                        <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[16px_4fr_2fr_2fr_minmax(60px,1fr)] gap-4 px-4 py-2 border-b border-white/10 text-sm text-gray-400 font-medium tracking-wide uppercase">
                            <div className="text-center text-base">#</div>
                            <div>Title</div>
                            <div className="hidden md:block">Album</div>
                            <div className="hidden lg:block">Date Added</div>
                            <div className="text-right flex justify-end">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>

                        {/* Tracklist Items */}
                        <div className="mt-4 flex flex-col">
                            {filteredTracks.length > 0 ? filteredTracks.map((track, index) => (
                                <div
                                    key={`${track.id}-${index}`}
                                    onClick={() => playTrack(track)}
                                    className="group grid grid-cols-[auto_1fr_auto] md:grid-cols-[16px_4fr_2fr_2fr_minmax(60px,1fr)] gap-4 px-4 py-3 rounded-md hover:bg-white/10 transition-colors cursor-pointer items-center"
                                >
                                    <div className="text-sm text-gray-400 text-center w-4 tabular-nums relative">
                                        <span className="group-hover:hidden">{index + 1}</span>
                                        <Play className="w-3 h-3 text-white fill-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden group-hover:block" />
                                    </div>

                                    <div className="flex items-center gap-4 min-w-0">
                                        <img
                                            src={getArtworkUrl(track.attributes.artwork.url, 100)}
                                            alt={track.attributes.name}
                                            className="w-10 h-10 rounded shadow-sm object-cover"
                                        />
                                        <div className="min-w-0 flex flex-col">
                                            <div className={`text-base font-medium truncate ${currentTrack?.id === track.id ? 'text-primary' : 'text-white'}`}>
                                                {track.attributes.name}
                                            </div>
                                            <div className="text-sm text-gray-400 truncate group-hover:text-white transition-colors">
                                                {track.attributes.artistName}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="hidden md:flex text-sm text-gray-400 truncate items-center group-hover:text-white transition-colors">
                                        {track.attributes.albumName || "Unknown Album"}
                                    </div>

                                    <div className="hidden lg:flex text-sm text-gray-400 truncate items-center">
                                        Recently
                                    </div>

                                    <div className="flex items-center justify-end gap-6">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleLike(track); }}
                                            className={`opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 ${isLiked(track.id) ? 'text-primary fill-primary opacity-100' : 'text-white'}`}
                                        >
                                            <Heart className={`w-4 h-4 ${isLiked(track.id) ? 'fill-primary' : ''}`} />
                                        </button>
                                        <span className="text-sm text-gray-400 tabular-nums">
                                            {formatDuration(track.attributes.durationInMillis)}
                                        </span>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-20 text-gray-500">
                                    <p>No songs found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Up Next */}
                <div className="hidden xl:block w-[350px] shrink-0 border-l border-white/5 bg-[#050505]">
                    <UpNext />
                </div>
            </div>
        </div>
    );
}
