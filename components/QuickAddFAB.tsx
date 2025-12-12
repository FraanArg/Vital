"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { TRACKERS } from "../lib/tracker-registry";
import { useHaptic } from "../hooks/useHaptic";
import { Doc } from "../convex/_generated/dataModel";

interface QuickAddFABProps {
    selectedDate: Date;
    onTrackerSelect: (trackerId: string) => void;
}

/**
 * Floating Action Button for quick logging
 * - Mobile: Fixed bottom-right FAB
 * - Desktop: Hidden (uses header button instead)
 */
export default function QuickAddFAB({ selectedDate, onTrackerSelect }: QuickAddFABProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { trigger } = useHaptic();

    const handleOpen = () => {
        trigger("light");
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleSelect = (trackerId: string) => {
        trigger("medium");
        setIsOpen(false);
        onTrackerSelect(trackerId);
    };

    // Primary trackers for quick access (exclude Journal and Custom)
    const quickTrackers = TRACKERS.filter(t =>
        ["sleep", "water", "food", "exercise", "work"].includes(t.id)
    );

    return (
        <>
            {/* FAB Button - Mobile only */}
            <motion.button
                onClick={handleOpen}
                className="md:hidden fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Add log entry"
            >
                <Plus className="w-6 h-6" />
            </motion.button>

            {/* Quick Add Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[70] flex items-end justify-center pointer-events-none">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleClose}
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm pointer-events-auto"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ y: "100%", opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "100%", opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 350 }}
                            className="relative w-full max-w-md bg-card rounded-t-3xl shadow-2xl border border-border/50 p-6 pb-safe pointer-events-auto"
                        >
                            {/* Handle */}
                            <div className="w-12 h-1.5 bg-muted/30 rounded-full mx-auto mb-4" />

                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold">Quick Add</h2>
                                <button
                                    onClick={handleClose}
                                    className="p-2 rounded-full hover:bg-secondary transition-colors"
                                    aria-label="Close"
                                >
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            {/* Tracker Grid */}
                            <div className="grid grid-cols-3 gap-3">
                                {quickTrackers.map((tracker) => {
                                    const Icon = tracker.icon;
                                    return (
                                        <motion.button
                                            key={tracker.id}
                                            onClick={() => handleSelect(tracker.id)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`flex flex-col items-center justify-center p-4 rounded-2xl border border-border/50 bg-card hover:shadow-md transition-all gap-2 card-interactive`}
                                        >
                                            <div className={`p-3 rounded-xl ${tracker.bgColor}`}>
                                                <Icon className={`w-6 h-6 ${tracker.color}`} />
                                            </div>
                                            <span className="text-sm font-medium">{tracker.label}</span>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* Quick presets */}
                            <div className="mt-6 pt-4 border-t border-border/50">
                                <p className="text-xs text-muted-foreground mb-3">Quick presets</p>
                                <div className="flex flex-wrap gap-2">
                                    <QuickPreset label="+250ml 💧" trackerId="water" onSelect={handleSelect} />
                                    <QuickPreset label="+500ml 💧" trackerId="water" onSelect={handleSelect} />
                                    <QuickPreset label="8h Sleep 😴" trackerId="sleep" onSelect={handleSelect} />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

function QuickPreset({
    label,
    trackerId,
    onSelect
}: {
    label: string;
    trackerId: string;
    onSelect: (id: string) => void;
}) {
    return (
        <button
            onClick={() => onSelect(trackerId)}
            className="px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors"
        >
            {label}
        </button>
    );
}
