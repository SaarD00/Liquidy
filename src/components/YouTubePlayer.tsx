
import { useEffect, useRef, useCallback } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { usePlayer } from "@/contexts/PlayerContext";

interface YouTubePlayerProps {
    videoId: string;
    className?: string;
}

export default function YouTubePlayer({
    videoId,
    className = "",
}: YouTubePlayerProps) {
    const {
        youtubePlayerRef,
        onYouTubeStateChange,
        onYouTubeTimeUpdate,
        isPlaying,
        volume,
        seekTo
    } = usePlayer();

    const internalPlayerRef = useRef<any>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Sync volume when it changes
    // Sync volume when it changes
    useEffect(() => {
        if (internalPlayerRef.current) {
            // YouTube expects 0-100, context provides 0-1
            internalPlayerRef.current.setVolume(volume * 100);
        }
    }, [volume]);

    // Handle play/pause sync from context
    useEffect(() => {
        if (internalPlayerRef.current) {
            if (isPlaying) {
                internalPlayerRef.current.playVideo();
            } else {
                internalPlayerRef.current.pauseVideo();
            }
        }
    }, [isPlaying]);

    const onReady: YouTubeProps['onReady'] = (event) => {
        internalPlayerRef.current = event.target;
        // Sync context ref
        if (youtubePlayerRef) {
            youtubePlayerRef.current = event.target;
        }

        // precise volume sync
        event.target.setVolume(volume * 100);

        if (isPlaying) {
            event.target.playVideo();
        }
    };

    const onStateChange: YouTubeProps['onStateChange'] = (event) => {
        // -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued).
        const playerState = event.data;
        onYouTubeStateChange(playerState);

        if (playerState === 1) { // Playing
            startPolling();
        } else {
            stopPolling();
        }
    };

    const startPolling = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            if (internalPlayerRef.current) {
                const currentTime = internalPlayerRef.current.getCurrentTime();
                const duration = internalPlayerRef.current.getDuration();
                onYouTubeTimeUpdate(currentTime, duration);
            }
        }, 1000); // Update every second to match UI
    }, [onYouTubeTimeUpdate]);

    const stopPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    // Cleanup
    useEffect(() => {
        return () => stopPolling();
    }, [stopPolling]);

    const opts: YouTubeProps['opts'] = {
        height: '100%',
        width: '100%',
        playerVars: {
            // https://developers.google.com/youtube/player_parameters
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
        },
    };

    return (
        <div
            className={`video-container ${className}`}
            style={{
                position: 'fixed',
                top: '-9999px',
                left: '-9999px',
                width: '1px',
                height: '1px',
                pointerEvents: 'none',
                opacity: 0
            }}
        >
            <YouTube
                videoId={videoId}
                opts={opts}
                onReady={onReady}
                onStateChange={onStateChange}
                onEnd={() => onYouTubeStateChange(0)}
            />
        </div>
    );
}
