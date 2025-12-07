'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { TRACKERS } from '../lib/tracker-registry';
import { useHaptic } from '../hooks/useHaptic';
import { Doc } from "../convex/_generated/dataModel";

interface LogEntryProps {
    selectedDate: Date;
    activeTracker: string | null;
    onTrackerChange: (trackerId: string | null) => void;
    editingLog?: Doc<"logs"> | null;
}

export default function LogEntry({ selectedDate, activeTracker, onTrackerChange, editingLog }: LogEntryProps) {
    const { trigger } = useHaptic();

    const handleClose = useCallback(() => {
        onTrackerChange(null);
    }, [onTrackerChange]);

    const activeTrackerConfig = TRACKERS.find(t => t.id === activeTracker);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                handleClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleClose]);

    return (
        <div className="w-full">
            <div className="flex flex-col gap-1.5">
                {TRACKERS.map((tracker) => {
                    const Icon = tracker.icon;

                    return (
                        <button
                            key={tracker.id}
                            type="button"
                            onClick={() => {
                                trigger("light");
                                onTrackerChange(tracker.id);
                            }}
                            className={`relative overflow-hidden rounded-xl border border-border/50 shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all group py-2.5 px-3 flex items-center gap-3 ${tracker.bgColor.replace("bg-", "bg-opacity-20 hover:bg-opacity-30 bg-")}`}
                        >
                            <div className={`p-1.5 rounded-lg ${tracker.color.replace("text-", "bg-white/50 dark:bg-black/20 text-")}`}>
                                <Icon className="w-4 h-4" />
                            </div>

                            <span className={`text-sm font-medium ${tracker.color}`}>
                                {tracker.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            <AnimatePresence>
                {activeTracker && activeTrackerConfig && (
                    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center md:pl-64 sm:p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={handleClose}
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm pointer-events-auto"
                        />
                        <motion.div
                            initial={{ y: "100%", opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            transition={{ type: "spring", damping: 25, stiffness: 350, mass: 0.5 }}
                            className="w-full sm:max-w-lg bg-card rounded-t-[2rem] sm:rounded-3xl shadow-2xl border border-border/50 max-h-[85vh] overflow-y-auto relative z-10 pointer-events-auto"
                        >
                            <div className="p-6 pb-24">
                                <div className="w-12 h-1.5 bg-muted/30 rounded-full mx-auto mb-6" />


                                <activeTrackerConfig.component
                                    onClose={handleClose}
                                    selectedDate={selectedDate}
                                    initialData={editingLog}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
}
