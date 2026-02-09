import { MoreHorizontal, Music2 } from "lucide-react";
import { motion } from "framer-motion";
import { usePlayer } from "@/contexts/PlayerContext";
import { getArtworkUrl, formatDuration } from "@/lib/api";

export default function UpNext() {
    const { queue, currentTrack, playTrack, isPlaying } = usePlayer();

    const currentIndex = currentTrack
        ? queue.findIndex(t => t.id === currentTrack.id)
        : -1;

    const upNextTracks = currentIndex !== -1
        ? queue.slice(currentIndex + 1)
        : queue;

    return (
        <div className="glass-panel rounded-2xl h-full flex flex-col overflow-hidden border border-white/5">
            {/* Queue Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white text-base">Up Next</h3>
                    <button className="text-gray-400 hover:text-white transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                    From: {currentTrack ? currentTrack.attributes.albumName || "Queue" : "Queue"}
                </p>
            </div>

            {/* Queue Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {/* Currently Playing Highlight */}
                {currentTrack && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 group cursor-default mb-4">
                        <div className="relative w-12 h-12 shrink-0">
                            <img
                                alt={currentTrack.attributes.name}
                                className="w-full h-full rounded-md object-cover"
                                src={getArtworkUrl(currentTrack.attributes.artwork.url, 100)}
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-md">
                                {/* Animated EQ Bars */}
                                <div className="flex gap-0.5 items-end h-4">
                                    {[...Array(3)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="w-1 bg-primary rounded-full"
                                            animate={isPlaying ? { height: ["30%", "100%", "30%"] } : { height: "30%" }}
                                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-primary truncate">{currentTrack.attributes.name}</h4>
                            <p className="text-xs text-gray-400 truncate">{currentTrack.attributes.artistName}</p>
                        </div>
                    </div>
                )}

                {/* Up Next List */}
                {upNextTracks.map((track, index) => (
                    <motion.div
                        key={`${track.id}-${index}`}
                        onClick={() => playTrack(track)}
                        whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                        className="flex items-center gap-3 p-2 rounded-xl transition-all group cursor-pointer"
                    >
                        <div className="relative w-10 h-10 shrink-0">
                            <img
                                alt={track.attributes.name}
                                className="w-full h-full rounded-full object-cover"
                                src={getArtworkUrl(track.attributes.artwork.url, 100)}
                            />
                            {/* Hover Play Overlay */}
                            <div className="absolute inset-0 bg-black/40 rounded-full hidden group-hover:flex items-center justify-center">
                                <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-white border-b-[4px] border-b-transparent ml-0.5"></div>
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">
                                {track.attributes.name}
                            </h4>
                            <p className="text-xs text-gray-400 truncate">
                                {track.attributes.artistName}
                            </p>
                        </div>
                    </motion.div>
                ))}

                {/* Empty Queue State */}
                {queue.length === 0 && (
                    <div className="text-center py-10">
                        <Music2 className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">Queue is empty</p>
                        <p className="text-xs text-gray-600 mt-1">Search for music to add tracks</p>
                    </div>
                )}
            </div>
        </div>
    );
}
