'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { TRACKERS } from '../lib/tracker-registry';

interface LogEntryProps {
    selectedDate: Date;
}

export default function LogEntry({ selectedDate }: LogEntryProps) {
    const [activeTracker, setActiveTracker] = useState<string | null>(null);

    const handleClose = () => setActiveTracker(null);

    const activeTrackerConfig = TRACKERS.find(t => t.id === activeTracker);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                handleClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <div className="w-full mb-8">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {TRACKERS.map((tracker) => {
                    const Icon = tracker.icon;
                    return (
                        <button
                            key={tracker.id}
                            type="button"
                            onClick={() => setActiveTracker(tracker.id)}
                            className={`flex flex-col items-center justify-center p-4 rounded-2xl border shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all group relative overflow-hidden ${tracker.id === "food" ? "bg-orange-500/10 border-orange-500/20 hover:border-orange-500/50" :
                                    tracker.id === "exercise" ? "bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/50" :
                                        tracker.id === "water" ? "bg-cyan-500/10 border-cyan-500/20 hover:border-cyan-500/50" :
                                            tracker.id === "sleep" ? "bg-violet-500/10 border-violet-500/20 hover:border-violet-500/50" :
                                                tracker.id === "mood" ? "bg-yellow-500/10 border-yellow-500/20 hover:border-yellow-500/50" :
                                                    "bg-card border-border/50"
                                }`}
                        >
                            <div className={`p-3 rounded-xl mb-2 transition-colors ${tracker.id === "food" ? "bg-orange-500 text-white" :
                                    tracker.id === "exercise" ? "bg-emerald-500 text-white" :
                                        tracker.id === "water" ? "bg-cyan-500 text-white" :
                                            tracker.id === "sleep" ? "bg-violet-500 text-white" :
                                                tracker.id === "mood" ? "bg-yellow-500 text-white" :
                                                    "bg-secondary text-foreground"
                                }`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <span className={`text-xs font-bold ${tracker.id === "food" ? "text-orange-500" :
                                    tracker.id === "exercise" ? "text-emerald-500" :
                                        tracker.id === "water" ? "text-cyan-500" :
                                            tracker.id === "sleep" ? "text-violet-500" :
                                                tracker.id === "mood" ? "text-yellow-500" :
                                                    "text-muted-foreground"
                                }`}>
                                {tracker.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            <AnimatePresence>
                {activeTracker && activeTrackerConfig && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:pl-64 sm:p-4 pointer-events-none">
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
                            exit={{ y: "20%", opacity: 0, scale: 0.95 }}
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
                                        <h2 className="text-xl font-bold">{activeTrackerConfig.label}</h2>
                                    </div>
                                    <button
                                        onClick={handleClose}
                                        className="p-2 rounded-full hover:bg-secondary transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <activeTrackerConfig.component
                                    onClose={handleClose}
                                    selectedDate={selectedDate}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
}
