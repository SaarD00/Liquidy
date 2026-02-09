import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
    dynamicBackground: boolean;
    setDynamicBackground: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [dynamicBackground, setDynamicBackground] = useState(() => {
        // Load from localStorage on mount
        const saved = localStorage.getItem('dynamicBackground');
        return saved ? JSON.parse(saved) : false; // Default is OFF
    });

    // Save to localStorage when changed
    useEffect(() => {
        localStorage.setItem('dynamicBackground', JSON.stringify(dynamicBackground));
    }, [dynamicBackground]);

    return (
        <SettingsContext.Provider value={{ dynamicBackground, setDynamicBackground }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
