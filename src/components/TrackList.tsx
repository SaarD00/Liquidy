import { SearchTrack } from "@/lib/api";
import TrackItem from "./TrackItem";
import { motion } from "framer-motion";
import { Music } from "lucide-react";

interface TrackListProps {
  tracks: SearchTrack[];
  title?: string;
}

export default function TrackList({ tracks, title }: TrackListProps) {
  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Music className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-lg font-medium">No tracks found</p>
        <p className="text-sm">Search for your favorite music</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {title && (
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-lg font-display font-semibold text-foreground mb-4"
        >
          {title}
        </motion.h2>
      )}
      {tracks.map((track, i) => (
        <TrackItem key={track.id} track={track} index={i} />
      ))}
    </div>
  );
}
