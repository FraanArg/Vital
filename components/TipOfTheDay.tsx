"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Lightbulb, X } from "lucide-react";

const TIPS = [
    { icon: "💧", tip: "Drink water 30 minutes before meals for better digestion" },
    { icon: "🌙", tip: "Keep your bedroom cool (65-68°F) for optimal sleep" },
    { icon: "🏃", tip: "Even a 10-minute walk counts as exercise!" },
    { icon: "🍎", tip: "Eating protein at breakfast helps reduce cravings" },
    { icon: "😴", tip: "Avoid screens 1 hour before bed for better sleep" },
    { icon: "💪", tip: "Rest days are when your muscles actually grow" },
    { icon: "🥗", tip: "Eat the rainbow - varied colors mean varied nutrients" },
    { icon: "⏰", tip: "Try to eat meals at consistent times each day" },
    { icon: "🧘", tip: "5 minutes of stretching can reduce stress levels" },
    { icon: "☀️", tip: "Morning sunlight helps regulate your circadian rhythm" },
];

interface TipOfTheDayProps {
    className?: string;
    onDismiss?: () => void;
}

/**
 * Nike Training Club style tip card
 * Shows rotating daily health tips
 */
export function TipOfTheDay({ className, onDismiss }: TipOfTheDayProps) {
    // Get tip based on day of year (changes daily)
    const tip = useMemo(() => {
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        return TIPS[dayOfYear % TIPS.length];
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className={`
                relative bg-gradient-to-r from-primary/5 to-primary/10 
                border border-primary/20 rounded-2xl p-4
                ${className}
            `}
        >
            <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-primary/10 shrink-0">
                    <Lightbulb className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{tip.icon}</span>
                        <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                            Tip of the Day
                        </span>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                        {tip.tip}
                    </p>
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="p-1.5 rounded-full hover:bg-secondary transition-colors"
                        aria-label="Dismiss tip"
                    >
                        <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                )}
            </div>
        </motion.div>
    );
}
