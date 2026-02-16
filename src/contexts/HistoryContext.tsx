
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { SearchTrack } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface HistoryItem {
    track: SearchTrack;
    playedAt: number;
}

interface HistoryContextType {
    history: HistoryItem[];
    addToHistory: (track: SearchTrack) => void;
    clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType | null>(null);

export function useHistory() {
    const ctx = useContext(HistoryContext);
    if (!ctx) throw new Error("useHistory must be used within HistoryProvider");
    return ctx;
}

const HISTORY_KEY = "sonicflow_history";

export function HistoryProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [history, setHistory] = useState<HistoryItem[]>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(HISTORY_KEY);
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });

    // Sync with Local Storage
    useEffect(() => {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }, [history]);

    // Sync with Supabase on Mount / Auth Change
    useEffect(() => {
        if (!user) return;

        const fetchHistory = async () => {
            const { data, error } = await supabase
                .from('user_data')
                .select('history')
                .eq('user_id', user.id)
                .single();

            if (data?.history && Array.isArray(data.history)) {
                // Merge strategy: Combine unique items or just prefer server?
                // User asked to "resort to supabase data if local storage is deleted".
                // Use server data if local is empty, or maybe merge based on timestamps?
                // Simple approach: Logic -> if local is empty, take server. If both exist, merge and de-dupe.

                setHistory(prev => {
                    if (prev.length === 0) return data.history;

                    // Basic merge: keep local, add missing from server
                    const localIds = new Set(prev.map(h => h.track.id));
                    const newItems = data.history.filter((h: HistoryItem) => !localIds.has(h.track.id));
                    return [...prev, ...newItems].sort((a, b) => b.playedAt - a.playedAt);
                });
            }
        };

        fetchHistory();
    }, [user]);

    // Sync to Supabase on Change (Debounced or immediate)
    useEffect(() => {
        if (!user) return;

        const timeout = setTimeout(async () => {
            await supabase.from('user_data').upsert({
                user_id: user.id,
                history: history
            }, { onConflict: 'user_id' });
        }, 2000); // 2s debounce

        return () => clearTimeout(timeout);
    }, [history, user]);

    const addToHistory = useCallback((track: SearchTrack) => {
        setHistory((prev) => {
            // Remove existing entry for this track if exists (to move it to top)
            const filtered = prev.filter((item) => item.track.id !== track.id);
            return [{ track, playedAt: Date.now() }, ...filtered].slice(0, 100); // Keep last 100
        });
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
    }, []);

    return (
        <HistoryContext.Provider value={{ history, addToHistory, clearHistory }}>
            {children}
        </HistoryContext.Provider>
    );
}
