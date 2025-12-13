'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { TRACKERS } from '../lib/tracker-registry';
import { useHaptic } from '../hooks/useHaptic';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { Doc } from "../convex/_generated/dataModel";

interface LogEntryProps {
    selectedDate: Date;
    activeTracker: string | null;
    onTrackerChange: (trackerId: string | null) => void;
    editingLog?: Doc<"logs"> | null;
}

export default function LogEntry({ selectedDate, activeTracker, onTrackerChange, editingLog }: LogEntryProps) {
    const { trigger } = useHaptic();
    const focusTrapRef = useFocusTrap(!!activeTracker);

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
            <div className="flex flex-col gap-2">
                {TRACKERS.map((tracker) => {
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
                            aria-label={`Log ${tracker.label}`}
                            className={`
                                relative overflow-hidden rounded-xl bg-card border border-border/50 
                                shadow-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] 
                                transition-all duration-200 group py-3.5 px-4 flex items-center gap-3
                                border-l-[3px] ${borderColor}
                                focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2
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
                            ref={focusTrapRef}
                            initial={{ y: "100%", opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            transition={{ type: "spring", damping: 25, stiffness: 350, mass: 0.5 }}
                            className="w-full sm:max-w-lg bg-card rounded-t-[2rem] sm:rounded-3xl shadow-2xl border border-border/50 max-h-[85vh] sm:max-h-[90vh] flex flex-col relative z-10 pointer-events-auto"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="tracker-modal-title"
                        >
                            {/* Sticky Header */}
                            <div className="shrink-0 bg-card rounded-t-[2rem] sm:rounded-t-3xl pt-4 pb-2 px-6 border-b border-border/30">
                                <div className="w-12 h-1.5 bg-muted/30 rounded-full mx-auto mb-3" />
                                <div className="flex items-center justify-between">
                                    <h2 id="tracker-modal-title" className="text-lg font-semibold flex items-center gap-2">
                                        {activeTrackerConfig && (
                                            <>
                                                <activeTrackerConfig.icon className={`w-5 h-5 ${activeTrackerConfig.color}`} />
                                                {activeTrackerConfig.label}
                                            </>
                                        )}
                                    </h2>
                                    <button
                                        onClick={handleClose}
                                        className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground"
                                        aria-label="Close"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-6 pb-safe">
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
