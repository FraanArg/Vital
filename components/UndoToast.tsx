"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Undo2, X } from "lucide-react";

export default function UndoToast() {
    const lastChange = useQuery(api.history.getLastChange);
    const undo = useMutation(api.history.undo);
    const [isVisible, setIsVisible] = useState(false);
    const [isUndoing, setIsUndoing] = useState(false);
    const [dismissed, setDismissed] = useState<string | null>(null);

    // Show toast when there's a new undoable change
    useEffect(() => {
        if (lastChange && lastChange._id !== dismissed) {
            setIsVisible(true);

            // Auto-hide after 8 seconds
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 8000);

            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [lastChange, dismissed]);

    // Keyboard shortcut (Ctrl/Cmd + Z)
    useEffect(() => {
        const handleKeyDown = async (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
                // Only intercept if we have something to undo
                if (lastChange && lastChange._id !== dismissed && !isUndoing) {
                    e.preventDefault();
                    await handleUndo();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [lastChange, dismissed, isUndoing]);

    const handleUndo = useCallback(async () => {
        if (isUndoing || !lastChange) return;

        setIsUndoing(true);
        try {
            await undo();
            setIsVisible(false);
            if (lastChange) {
                setDismissed(lastChange._id);
            }
        } catch (error) {
            console.error("Undo failed:", error);
        } finally {
            setIsUndoing(false);
        }
    }, [undo, lastChange, isUndoing]);

    const handleDismiss = () => {
        setIsVisible(false);
        if (lastChange) {
            setDismissed(lastChange._id);
        }
    };

    const actionText = lastChange?.action === "delete" ? "Deleted log" : "Edited log";

    return (
        <AnimatePresence>
            {isVisible && lastChange && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 z-50"
                >
                    <div className="flex items-center gap-3 bg-card border border-border shadow-xl rounded-2xl px-4 py-3">
                        <span className="text-sm text-muted-foreground">{actionText}</span>

                        <button
                            onClick={handleUndo}
                            disabled={isUndoing}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            <Undo2 className="w-4 h-4" />
                            {isUndoing ? "Undoing..." : "Undo"}
                        </button>

                        <button
                            onClick={handleDismiss}
                            className="p-1 hover:bg-secondary rounded-lg transition-colors text-muted-foreground"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
