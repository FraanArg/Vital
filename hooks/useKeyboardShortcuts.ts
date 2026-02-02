"use client";

import { useEffect, useCallback } from "react";

type KeyCombo = string;  // e.g., "n", "Escape", "ctrl+s", "cmd+k"

interface Shortcut {
    key: KeyCombo;
    action: () => void;
    description?: string;
    /** Only trigger when not in an input field */
    ignoreInputs?: boolean;
}

/**
 * Hook for keyboard shortcuts
 * 
 * @example
 * useKeyboardShortcuts([
 *   { key: "n", action: () => openNewModal(), description: "New entry" },
 *   { key: "Escape", action: () => closeModal() },
 *   { key: "ctrl+s", action: () => save() },
 * ]);
 */
export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        // Check if we're in an input field
        const isInInput = ["INPUT", "TEXTAREA", "SELECT"].includes(
            (event.target as HTMLElement)?.tagName || ""
        );

        for (const shortcut of shortcuts) {
            // Parse key combo
            const parts = shortcut.key.toLowerCase().split("+");
            const key = parts[parts.length - 1];
            const needsCtrl = parts.includes("ctrl");
            const needsCmd = parts.includes("cmd") || parts.includes("meta");
            const needsAlt = parts.includes("alt");
            const needsShift = parts.includes("shift");

            // Check modifiers
            const ctrlMatch = needsCtrl ? event.ctrlKey : !event.ctrlKey;
            const cmdMatch = needsCmd ? event.metaKey : !event.metaKey;
            const altMatch = needsAlt ? event.altKey : !event.altKey;
            const shiftMatch = needsShift ? event.shiftKey : !event.shiftKey;

            // Check key
            const keyMatch = event.key.toLowerCase() === key;

            // Skip if should ignore inputs and we're in an input
            if (shortcut.ignoreInputs !== false && isInInput && key !== "escape") {
                continue;
            }

            if (keyMatch && ctrlMatch && cmdMatch && altMatch && shiftMatch) {
                event.preventDefault();
                shortcut.action();
                break;
            }
        }
    }, [shortcuts]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);
}

/**
 * Common app-wide shortcuts configuration
 */
export const commonShortcuts = {
    newEntry: "n",
    save: "cmd+s",
    close: "Escape",
    search: "cmd+k",
    nextDay: "ArrowRight",
    prevDay: "ArrowLeft",
    today: "t",
    settings: ",",
    help: "?",
};

export default useKeyboardShortcuts;
