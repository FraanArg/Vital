'use client';

import { useState } from 'react';
import { Briefcase, Moon, Droplets, Utensils, X, Book, Plus } from 'lucide-react';
import WorkTracker from './trackers/WorkTracker';
import SleepTracker from './trackers/SleepTracker';
import WaterTracker from './trackers/WaterTracker';
import FoodTracker from './trackers/FoodTracker';
import JournalTracker from './trackers/JournalTracker';
import CustomTracker from './trackers/CustomTracker';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { motion, AnimatePresence } from 'framer-motion';

interface LogEntryProps {
    selectedDate: Date;
}

export default function LogEntry({ selectedDate }: LogEntryProps) {
    const [activeTracker, setActiveTracker] = useState<string | null>(null);
    const isDesktop = useMediaQuery("(min-width: 768px)");

    const renderTracker = () => {
        switch (activeTracker) {
            case 'work': return <WorkTracker selectedDate={selectedDate} onClose={() => setActiveTracker(null)} />;
            case 'sleep': return <SleepTracker selectedDate={selectedDate} onClose={() => setActiveTracker(null)} />;
            case 'water': return <WaterTracker selectedDate={selectedDate} onClose={() => setActiveTracker(null)} />;
            case 'food': return <FoodTracker selectedDate={selectedDate} onClose={() => setActiveTracker(null)} />;
            case 'journal': return <JournalTracker selectedDate={selectedDate} onClose={() => setActiveTracker(null)} />;
            case 'custom': return <CustomTracker selectedDate={selectedDate} onClose={() => setActiveTracker(null)} />;
            default: return null;
        }
    };

    return (
        <div className="mb-8">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-8">
                <button
                    onClick={() => setActiveTracker('work')}
                    className="p-4 rounded-2xl bg-card text-card-foreground shadow-sm border border-border/50 flex flex-col items-center gap-3 hover:bg-secondary transition-all active:scale-95 group"
                >
                    <div className="p-3 bg-green-100 dark:bg-green-500/20 rounded-full group-hover:scale-110 transition-transform">
                        <Briefcase className="w-6 h-6 text-green-600 dark:text-green-300" />
                    </div>
                    <span className="font-semibold text-sm">Work</span>
                </button>

                <button
                    onClick={() => setActiveTracker('sleep')}
                    className="p-4 rounded-2xl bg-card text-card-foreground shadow-sm border border-border/50 flex flex-col items-center gap-3 hover:bg-secondary transition-all active:scale-95 group"
                >
                    <div className="p-3 bg-purple-100 dark:bg-purple-500/20 rounded-full group-hover:scale-110 transition-transform">
                        <Moon className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                    </div>
                    <span className="font-semibold text-sm">Sleep</span>
                </button>

                <button
                    onClick={() => setActiveTracker('water')}
                    className="p-4 rounded-2xl bg-card text-card-foreground shadow-sm border border-border/50 flex flex-col items-center gap-3 hover:bg-secondary transition-all active:scale-95 group"
                >
                    <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-full group-hover:scale-110 transition-transform">
                        <Droplets className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                    </div>
                    <span className="font-semibold text-sm">Water</span>
                </button>

                <button
                    onClick={() => setActiveTracker('food')}
                    className="p-4 rounded-2xl bg-card text-card-foreground shadow-sm border border-border/50 flex flex-col items-center gap-3 hover:bg-secondary transition-all active:scale-95 group"
                >
                    <div className="p-3 bg-orange-100 dark:bg-orange-500/20 rounded-full group-hover:scale-110 transition-transform">
                        <Utensils className="w-6 h-6 text-orange-600 dark:text-orange-300" />
                    </div>
                    <span className="font-semibold text-sm">Food</span>
                </button>

                <button
                    onClick={() => setActiveTracker('journal')}
                    className="p-4 rounded-2xl bg-card text-card-foreground shadow-sm border border-border/50 flex flex-col items-center gap-3 hover:bg-secondary transition-all active:scale-95 group"
                >
                    <div className="p-3 bg-pink-100 dark:bg-pink-500/20 rounded-full group-hover:scale-110 transition-transform">
                        <Book className="w-6 h-6 text-pink-600 dark:text-pink-300" />
                    </div>
                    <span className="font-semibold text-sm">Journal</span>
                </button>

                <button
                    onClick={() => setActiveTracker('custom')}
                    className="p-4 rounded-2xl bg-card text-card-foreground shadow-sm border border-border/50 flex flex-col items-center gap-3 hover:bg-secondary transition-all active:scale-95 group"
                >
                    <div className="p-3 bg-gray-100 dark:bg-gray-500/20 rounded-full group-hover:scale-110 transition-transform">
                        <Plus className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </div>
                    <span className="font-semibold text-sm">Custom</span>
                </button>
            </div>

            <AnimatePresence>
                {activeTracker && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveTracker(null)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                        />

                        {/* Modal / Bottom Sheet */}
                        <div className={`fixed z-50 ${isDesktop
                            ? 'inset-0 flex items-center justify-center pointer-events-none'
                            : 'bottom-0 left-0 right-0'
                            }`}>
                            <motion.div
                                initial={isDesktop ? { scale: 0.9, opacity: 0 } : { y: "100%" }}
                                animate={isDesktop ? { scale: 1, opacity: 1 } : { y: 0 }}
                                exit={isDesktop ? { scale: 0.9, opacity: 0 } : { y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className={`bg-card text-card-foreground shadow-2xl overflow-hidden pointer-events-auto ${isDesktop
                                    ? 'w-full max-w-md rounded-3xl border border-border/50'
                                    : 'rounded-t-[32px] border-t border-border/50'
                                    }`}
                            >
                                {/* Drag Handle for Mobile */}
                                {!isDesktop && (
                                    <div className="w-full flex justify-center pt-3 pb-1">
                                        <div className="w-12 h-1.5 bg-muted/30 rounded-full" />
                                    </div>
                                )}

                                <div className="p-6 relative">
                                    {isDesktop && (
                                        <button
                                            onClick={() => setActiveTracker(null)}
                                            className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-full transition-colors"
                                        >
                                            <X className="w-5 h-5 text-muted" />
                                        </button>
                                    )}
                                    {renderTracker()}
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
