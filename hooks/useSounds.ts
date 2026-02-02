"use client";

/**
 * Sound Effects Hook
 * 
 * Provides optional sound feedback for key interactions.
 * Sounds are disabled by default and can be enabled in settings.
 */

type SoundType = "success" | "pop" | "click" | "achievement" | "notification";

interface SoundsAPI {
    enabled: boolean;
    setEnabled: (enabled: boolean) => void;
    play: (sound: SoundType) => void;
    success: () => void;
    pop: () => void;
    click: () => void;
    achievement: () => void;
    notification: () => void;
}

// Simple audio context for web audio
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        } catch {
            console.warn("Web Audio API not supported");
            return null;
        }
    }
    return audioContext;
}

// Generate simple tones for different sounds
function playTone(frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.1) {
    const ctx = getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Fade in/out for smoother sound
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
}

// Sound definitions
const sounds: Record<SoundType, () => void> = {
    success: () => {
        playTone(523.25, 0.1, "sine"); // C5
        setTimeout(() => playTone(659.25, 0.1, "sine"), 80); // E5
        setTimeout(() => playTone(783.99, 0.15, "sine"), 160); // G5
    },
    pop: () => {
        playTone(400, 0.05, "sine", 0.15);
    },
    click: () => {
        playTone(1000, 0.02, "square", 0.05);
    },
    achievement: () => {
        playTone(523.25, 0.08, "sine"); // C5
        setTimeout(() => playTone(659.25, 0.08, "sine"), 60); // E5
        setTimeout(() => playTone(783.99, 0.08, "sine"), 120); // G5
        setTimeout(() => playTone(1046.50, 0.2, "sine"), 180); // C6
    },
    notification: () => {
        playTone(880, 0.1, "sine"); // A5
        setTimeout(() => playTone(1108.73, 0.15, "sine"), 100); // C#6
    },
};

import { useState, useCallback } from "react";

export function useSounds(): SoundsAPI {
    // In a real app, this would be persisted to settings
    const [enabled, setEnabled] = useState(false);

    const play = useCallback((sound: SoundType) => {
        if (!enabled) return;
        try {
            sounds[sound]();
        } catch {
            // Silently fail if audio doesn't work
        }
    }, [enabled]);

    return {
        enabled,
        setEnabled,
        play,
        success: () => play("success"),
        pop: () => play("pop"),
        click: () => play("click"),
        achievement: () => play("achievement"),
        notification: () => play("notification"),
    };
}

export default useSounds;
