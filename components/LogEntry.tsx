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
    // Favorites - most commonly used trackers
    const favorites = TRACKERS.filter(t => ["food", "sleep", "water", "exercise"].includes(t.id));
    const others = TRACKERS.filter(t => !["food", "sleep", "water", "exercise"].includes(t.id));

    return (
        <div className="w-full">
            {/* Quick Access Favorites */}
            <div className="mb-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Quick Add</p>
                <div className="grid grid-cols-4 gap-1.5">
                    {favorites.map((tracker) => {
                        const Icon = tracker.icon;
                        return (
                            <button
                                key={tracker.id}
                                type="button"
                                onClick={() => {
                                    trigger("light");
                                    onTrackerChange(tracker.id);
                                }}
                                className={`flex flex-col items-center gap-1 p-2 rounded-xl bg-card border border-border/50 hover:shadow-md hover:scale-105 active:scale-95 transition-all ${tracker.color}`}
                            >
                                <div className={`p-1.5 rounded-lg ${tracker.bgColor}`}>
                                    <Icon className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-[9px] font-semibold truncate">{tracker.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-px bg-border/50" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">All</p>
                <div className="flex-1 h-px bg-border/50" />
            </div>

            <div className="flex flex-col gap-2">
                {others.map((tracker) => {
                    const Icon = tracker.icon;

                    // Extract border color from bgColor
                    const borderColor = tracker.bgColor
                        .replace("bg-", "border-l-")
                        .replace("-100", "-500")
                        .replace("-900/30", "-400");

                    return (
                        <button
                            key={tracker.id}
                            type="button"
                            onClick={() => {
                                trigger("light");
                                onTrackerChange(tracker.id);
                            }}
                            className={`
                                relative overflow-hidden rounded-xl bg-card border border-border/50 
                                shadow-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] 
                                transition-all duration-200 group py-3.5 px-4 flex items-center gap-3
                                border-l-[3px] ${borderColor}
                            `}
                        >
                            {/* Subtle background tint on hover */}
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${tracker.bgColor.replace("/30", "/10")}`} />

                            {/* Icon */}
                            <div className={`relative p-2 rounded-lg ${tracker.bgColor} ${tracker.color} transition-transform group-hover:scale-110`}>
                                <Icon className="w-4 h-4" />
                            </div>

                            {/* Label */}
                            <span className={`relative text-sm font-semibold ${tracker.color}`}>
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
