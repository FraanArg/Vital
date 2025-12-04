'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { TRACKERS } from '../lib/tracker-registry';
import { useHaptic } from '../hooks/useHaptic';
import { Doc } from "../convex/_generated/dataModel";
import { Plus } from "lucide-react";

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
        <div className="w-full mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 auto-rows-[120px]">
                {TRACKERS.map((tracker) => {
                    const Icon = tracker.icon;
                    const isWide = tracker.id === "sleep" || tracker.id === "exercise";

                    return (
                        <button
                            key={tracker.id}
                            type="button"
                            onClick={() => {
                                trigger("light");
                                onTrackerChange(tracker.id);
                            }}
                            className={`relative overflow-hidden rounded-[32px] border border-border/50 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all group p-5 flex flex-col justify-between ${isWide ? "col-span-2" : "col-span-1"
                                } ${tracker.bgColor.replace("bg-", "bg-opacity-20 hover:bg-opacity-30 bg-")}`}
                        >
                            {/* Background Gradient */}
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-transparent to-white/10 dark:to-black/10`} />

                            <div className={`p-3 rounded-2xl w-fit transition-colors ${tracker.color.replace("text-", "bg-white/50 dark:bg-black/20 text-")}`}>
                                <Icon className="w-6 h-6" />
                            </div>

                            <div className="flex items-center justify-between w-full">
                                <span className={`text-lg font-bold tracking-tight ${tracker.color}`}>
                                    {tracker.label}
                                </span>
                                {isWide && (
                                    <div className="p-1.5 rounded-full bg-background/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Plus className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
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
