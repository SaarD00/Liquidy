import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Play, Clock, MoreHorizontal, Music, Trash2, Heart, Pencil, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { useFavorites } from "@/contexts/FavoritesContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { getArtworkUrl, formatDuration } from "@/lib/api";
import DesktopSidebar from "@/components/DesktopSidebar";

export default function PlaylistPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { playlists, deletePlaylist, removeFromPlaylist, toggleLike, isLiked, renamePlaylist } = useFavorites();
    const { playTrack, addToQueue, currentTrack, isPlaying, togglePlay } = usePlayer();

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");

    const playlist = useMemo(() =>
        playlists.find((p) => p.id === id),
        [playlists, id]
    );

    useEffect(() => {
        if (playlist) setEditName(playlist.name);
    }, [playlist]);

    if (!playlist) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white bg-[#050505] md:pl-80">
                <DesktopSidebar />
                <h2 className="text-2xl font-bold mb-4">Playlist not found</h2>
                <button
                    onClick={() => navigate("/")}
                    className="px-6 py-2 bg-emerald-500 rounded-full text-black font-bold"
                >
                    Go Home
                </button>
            </div>
        );
    }

    const handlePlayAll = () => {
        if (playlist.tracks.length > 0) {
            if (currentTrack?.id === playlist.tracks[0].id) {
                togglePlay();
            } else {
                addToQueue(playlist.tracks);
                playTrack(playlist.tracks[0]);
            }
        }
    };

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this playlist?")) {
            deletePlaylist(playlist.id);
            navigate("/");
        }
    };

    const handleRename = () => {
        if (editName.trim()) {
            renamePlaylist(playlist.id, editName);
            setIsEditing(false);
        }
    };

    return (
        <div className="min-h-screen pb-32 w-full bg-[#050505] text-white md:pl-80 transition-all duration-300">
            <DesktopSidebar />

            {/* Header Section */}
            <div className="relative h-80 flex items-end p-8 pb-6 bg-gradient-to-b from-indigo-900/50 via-[#050505] to-[#050505]">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050505]" />

                <div className="relative z-10 flex items-end gap-6 w-full max-w-7xl mx-auto">
                    {/* Cover Art Placeholder */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-52 h-52 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-md bg-white/10 flex items-center justify-center shrink-0 border border-white/5"
                    >
                        {playlist.tracks.length > 0 ? (
                            <img
                                src={getArtworkUrl(playlist.tracks[0].attributes.artwork.url, 400)}
                                alt={playlist.name}
                                className="w-full h-full object-cover rounded-md"
                            />
                        ) : (
                            <Music className="w-20 h-20 text-gray-500" />
                        )}
                    </motion.div>

                    {/* Playlist Info */}
                    <div className="flex flex-col gap-2 mb-2 flex-1 min-w-0">
                        <span className="text-sm font-bold uppercase tracking-wider">Public Playlist</span>

                        {isEditing ? (
                            <div className="flex items-center gap-2 mb-2">
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="bg-white/10 border border-white/20 text-3xl md:text-5xl font-black text-white px-4 py-2 rounded-lg w-full focus:outline-none focus:border-emerald-500"
                                    autoFocus
                                    onKeyDown={(e) => e.key === "Enter" && handleRename()}
                                />
                                <button onClick={handleRename} className="p-2 hover:bg-emerald-500/20 rounded-full text-emerald-500">
                                    <Check className="w-8 h-8" />
                                </button>
                                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-red-500/20 rounded-full text-red-500">
                                    <X className="w-8 h-8" />
                                </button>
                            </div>
                        ) : (
                            <div className="group flex items-center gap-4 mb-2">
                                <h1
                                    className="text-4xl md:text-7xl font-black tracking-tight text-white truncate cursor-pointer hover:underline decoration-emerald-500/50"
                                    onClick={() => setIsEditing(true)}
                                >
                                    {playlist.name}
                                </h1>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-full"
                                >
                                    <Pencil className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                        )}

                        <p className="text-sm text-gray-400 font-medium mb-2 truncate">
                            {playlist.tracks.length > 0
                                ? playlist.tracks.map(t => t.attributes.artistName).slice(0, 3).join(", ") + (playlist.tracks.length > 3 ? " and more" : "")
                                : "No songs yet"
                            }
                        </p>
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-black font-bold">
                                U
                            </div>
                            <span className="hover:underline cursor-pointer text-white">User</span>
                            <span>•</span>
                            <span>{playlist.tracks.length} songs</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-8 relative z-10 bg-[#050505]">
                {/* Action Bar */}
                <div className="flex items-center justify-between py-6">
                    <div className="flex items-center gap-8">
                        <button
                            onClick={handlePlayAll}
                            disabled={playlist.tracks.length === 0}
                            className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                        >
                            {isPlaying && currentTrack && playlist.tracks.some(t => t.id === currentTrack.id) ? (
                                <PauseIcon className="w-6 h-6 fill-black" />
                            ) : (
                                <Play className="w-6 h-6 fill-black ml-1" />
                            )}
                        </button>
                        <button className="text-gray-400 hover:text-white transition-colors">
                            <MoreHorizontal className="w-8 h-8" />
                        </button>
                    </div>
                    <button
                        onClick={handleDelete}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-white/5 rounded-full"
                        title="Delete Playlist"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>

                {/* Tracks List Header */}
                <div className="grid grid-cols-[16px_4fr_3fr_minmax(120px,1fr)] gap-4 px-4 py-2 border-b border-white/10 text-sm text-gray-400 font-medium sticky top-20 bg-[#050505] z-20">
                    <div className="text-center">#</div>
                    <div>Title</div>
                    <div className="hidden md:block">Album</div>
                    <div className="text-right flex items-center justify-end gap-2">
                        <Clock className="w-4 h-4" />
                    </div>
                </div>

                {/* Tracks List */}
                <div className="mt-4 space-y-2">
                    {playlist.tracks.map((track, index) => (
                        <div
                            key={`${track.id}-${index}`}
                            onClick={() => playTrack(track)}
                            className="group grid grid-cols-[16px_4fr_3fr_minmax(120px,1fr)] gap-4 px-4 py-3 rounded-md hover:bg-white/10 transition-colors cursor-pointer items-center"
                        >
                            <div className="text-sm text-gray-400 text-center group-hover:hidden">
                                {index + 1}
                            </div>
                            <div className="hidden group-hover:flex justify-center text-white">
                                <Play className="w-4 h-4 fill-white" />
                            </div>

                            <div className="flex items-center gap-4 min-w-0">
                                <img
                                    src={getArtworkUrl(track.attributes.artwork.url, 100)}
                                    alt={track.attributes.name}
                                    className="w-10 h-10 rounded shadow-sm object-cover"
                                />
                                <div className="min-w-0">
                                    <div className={`text-base font-medium truncate ${currentTrack?.id === track.id ? 'text-emerald-500' : 'text-white'}`}>
                                        {track.attributes.name}
                                    </div>
                                    <div className="text-sm text-gray-400 truncate group-hover:text-white transition-colors">
                                        {track.attributes.artistName}
                                    </div>
                                </div>
                            </div>

                            <div className="hidden md:flex text-sm text-gray-400 truncate items-center group-hover:text-white transition-colors">
                                {track.attributes.albumName}
                            </div>

                            <div className="flex items-center justify-end gap-8">
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleLike(track); }}
                                    className={`${isLiked(track.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} hover:scale-110 transition-all`}
                                >
                                    <Heart className={`w-4 h-4 ${isLiked(track.id) ? 'text-emerald-500 fill-emerald-500' : 'text-white'}`} />
                                </button>
                                <span className="text-sm text-gray-400 tabular-nums">
                                    {formatDuration(track.attributes.durationInMillis)}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFromPlaylist(playlist.id, track.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Remove from playlist"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {playlist.tracks.length === 0 && (
                        <div className="text-center py-20 text-gray-500">
                            <Music className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                            <p className="text-lg font-medium text-white">This playlist is empty</p>
                            <p className="text-sm mb-6">Search for songs to add them to this playlist.</p>
                            <button
                                onClick={() => navigate("/search")}
                                className="px-8 py-3 rounded-full bg-white text-black font-bold hover:scale-105 transition-transform"
                            >
                                Find Songs
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function PauseIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
    );
}
