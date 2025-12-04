"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Lightbulb, TrendingUp, Quote, X } from "lucide-react";

const WIDGETS = [
    {
        id: "tip",
        type: "tip",
        icon: Lightbulb,
        color: "text-yellow-500",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20",
        title: "Daily Tip",
        content: "Consistency is key. Even a small log counts!"
    },
    {
        id: "stats",
        type: "stats",
        icon: TrendingUp,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        title: "Quick Stat",
        content: "You're 2h away from your sleep goal."
    },
    {
        id: "quote",
        type: "quote",
        icon: Quote,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
        title: "Motivation",
        content: "The only bad workout is the one that didn't happen."
    }
];

export default function SmartStack() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    // Auto-rotate
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % WIDGETS.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.x < -50) {
            setCurrentIndex((prev) => (prev + 1) % WIDGETS.length);
        } else if (info.offset.x > 50) {
            setCurrentIndex((prev) => (prev - 1 + WIDGETS.length) % WIDGETS.length);
        }
    };

    if (!isVisible) return null;

    const widget = WIDGETS[currentIndex];
    const Icon = widget.icon;

    return (
        <div className="relative h-24 mb-6 perspective-1000">
            <AnimatePresence mode="wait">
                <motion.div
                    key={widget.id}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={handleDragEnd}
                    initial={{ opacity: 0, rotateX: -90, y: 20 }}
                    animate={{ opacity: 1, rotateX: 0, y: 0 }}
                    exit={{ opacity: 0, rotateX: 90, y: -20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={`absolute inset-0 w-full h-full rounded-[32px] border backdrop-blur-sm p-4 flex items-center gap-4 shadow-sm cursor-grab active:cursor-grabbing overflow-hidden ${widget.bg} ${widget.border}`}
                >
                    <div className={`p-2.5 rounded-full bg-background/80 shadow-sm ${widget.color}`}>
                        <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${widget.color}`}>
                            {widget.title}
                        </h4>
                        <p className="text-sm font-medium text-foreground/90 truncate">
                            {widget.content}
                        </p>
                    </div>

                    {/* Stack Indicators */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {WIDGETS.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-1 h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? `w-3 ${widget.color.replace('text-', 'bg-')}` : "bg-muted-foreground/30"}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </motion.div>
            </AnimatePresence>

            {/* Stack Depth Effect */}
            <div className="absolute top-2 left-4 right-4 bottom-0 bg-card border border-border/50 rounded-[32px] -z-10 scale-95 translate-y-2 opacity-50" />
        </div>
    );
}
