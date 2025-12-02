'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
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

    const handleClose = () => {
        onTrackerChange(null);
    };

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
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
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
                            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all group"
                        >
                            <div className="p-3 rounded-xl mb-2 transition-colors bg-secondary text-foreground group-hover:bg-primary/10 group-hover:text-primary">
                                <Icon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                                {tracker.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            <AnimatePresence>
                {activeTracker && activeTrackerConfig && (
                    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:pl-64 sm:p-4 pointer-events-none">
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
                            <div className="p-6 pb-safe">
                                <div className="w-12 h-1.5 bg-muted/30 rounded-full mx-auto mb-6" />
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${activeTrackerConfig.bgColor}`}>
                                            <activeTrackerConfig.icon className={`w-5 h-5 ${activeTrackerConfig.color}`} />
                                        </div>
                                        <h2 className="text-xl font-bold">{editingLog ? `Edit ${activeTrackerConfig.label}` : activeTrackerConfig.label}</h2>
                                    </div>
                                    <button
                                        onClick={() => {
                                            trigger("light");
                                            handleClose();
                                        }}
                                        className="p-2 rounded-full hover:bg-secondary transition-colors"
                                        aria-label="Close"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

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
