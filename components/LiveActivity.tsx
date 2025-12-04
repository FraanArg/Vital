"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Timer, StopCircle, Play } from "lucide-react";

export default function LiveActivity() {
    const [isActive, setIsActive] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive) {
            interval = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive]);

    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
            <motion.div
                layout
                initial={false}
                animate={{
                    width: isExpanded ? 300 : isActive ? 180 : 48,
                    height: isExpanded ? 120 : 48,
                    borderRadius: 24
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="bg-black/90 backdrop-blur-md text-white shadow-2xl overflow-hidden cursor-pointer border border-white/10"
                onClick={() => !isExpanded && setIsExpanded(true)}
            >
                <div className="relative w-full h-full p-3">
                    {/* Collapsed State */}
                    <motion.div
                        className="absolute inset-0 flex items-center justify-between px-4"
                        animate={{ opacity: isExpanded ? 0 : 1 }}
                        style={{ pointerEvents: isExpanded ? "none" : "auto" }}
                    >
                        {!isActive ? (
                            <div className="flex items-center justify-center w-full" onClick={(e) => { e.stopPropagation(); setIsActive(true); }}>
                                <Play className="w-5 h-5 fill-white" />
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="font-medium font-mono">{formatTime(seconds)}</span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                    <Timer className="w-4 h-4" />
                                </div>
                            </>
                        )}
                    </motion.div>

                    {/* Expanded State */}
                    <motion.div
                        className="absolute inset-0 p-6 flex flex-col justify-between"
                        animate={{ opacity: isExpanded ? 1 : 0 }}
                        style={{ pointerEvents: isExpanded ? "auto" : "none" }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-green-500/20 text-green-400">
                                    <Timer className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Workout</h3>
                                    <p className="text-xs text-white/50">Active Session</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <div className="w-12 h-1 bg-white/20 rounded-full" />
                            </button>
                        </div>

                        <div className="flex items-end justify-between">
                            <span className="text-4xl font-black font-mono tracking-tight">
                                {formatTime(seconds)}
                            </span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsActive(!isActive);
                                }}
                                className={`p-3 rounded-full transition-colors ${isActive ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'}`}
                            >
                                {isActive ? <StopCircle className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
                            </button>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
