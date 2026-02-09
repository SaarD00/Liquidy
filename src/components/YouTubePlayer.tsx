import { useEffect, useRef, useCallback } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { getYouTubeEmbedUrl } from "@/lib/api";

interface YouTubePlayerProps {
    videoId: string;
    autoPlay?: boolean;
    className?: string;
    onReady?: () => void;
}

export default function YouTubePlayer({
    videoId,
    autoPlay = true,
    className = "",
    onReady,
}: YouTubePlayerProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const { youtubePlayerRef, onYouTubeStateChange, onYouTubeTimeUpdate, isPlaying } = usePlayer();
    const intervalRef = useRef<number | null>(null);

    // Listen for YouTube player messages
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== "https://www.youtube.com") return;

            try {
                const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;

                if (data.event === "onStateChange") {
                    onYouTubeStateChange(data.info);
                }

                if (data.event === "infoDelivery" && data.info) {
                    if (data.info.currentTime !== undefined && data.info.duration !== undefined) {
                        onYouTubeTimeUpdate(data.info.currentTime, data.info.duration);
                    }
                }

                if (data.event === "onReady") {
                    onReady?.();
                }
            } catch {
                // Ignore parse errors from other messages
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [onYouTubeStateChange, onYouTubeTimeUpdate, onReady]);

    // Sync ref with context
    useEffect(() => {
        if (iframeRef.current && youtubePlayerRef) {
            (youtubePlayerRef as React.MutableRefObject<HTMLIFrameElement | null>).current = iframeRef.current;
        }
    }, [youtubePlayerRef, videoId]);

    // Build embed URL with all necessary parameters
    const embedUrl = `https://www.youtube.com/embed/${videoId}?${new URLSearchParams({
        autoplay: autoPlay ? "1" : "0",
        enablejsapi: "1",
        modestbranding: "1",
        rel: "0",
        playsinline: "1",
        origin: window.location.origin,
        widget_referrer: window.location.origin,
    }).toString()}`;

    return (
        <div className={` w-full aspect-video bg-black rounded-2xl overflow-hidden ${className}`}>
            <iframe
                ref={iframeRef}
                src={embedUrl}
                title="YouTube video player"
                className="absolute inset-0 "
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                frameBorder="0"
            />

            {/* Loading overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none opacity-0 transition-opacity duration-300">
                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
        </div>
    );
}
