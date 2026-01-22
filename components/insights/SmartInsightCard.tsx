"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Lightbulb, Sparkles, TrendingUp, Link } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface Insight {
    type: "food" | "sleep" | "exercise" | "trend" | "correlation" | "achievement" | "pattern";
    icon: string;
    title: string;
    message: string;
    priority: number;
    color?: string;
}

export default function SmartInsightCard() {
    const insights = useQuery(api.insights.getSmartCorrelations);
    const [isVisible, setIsVisible] = useState(true);

    // If no complex insights, don't show anything (fallback to basic SmartReminders)
    if (!insights || insights.length === 0 || !isVisible) return null;

    const insight = insights[0]; // Get top priority insight

    const getIcon = (iconStr: string) => {
        // Map emoji to Lucide icon or return text
        if (iconStr === "🔋") return <TrendingUp className="w-5 h-5 text-green-600" />;
        if (iconStr === "⚠️") return <Lightbulb className="w-5 h-5 text-yellow-600" />;
        if (iconStr === "🔥") return <Sparkles className="w-5 h-5 text-orange-600" />;
        if (iconStr === "📅") return <Link className="w-5 h-5 text-blue-600" />;
        return <span className="text-xl">{iconStr}</span>;
    };

    const getColors = (color?: string) => {
        switch (color) {
            case "green": return "from-green-500/10 via-green-500/5 to-transparent border-green-500/20";
            case "yellow": return "from-yellow-500/10 via-yellow-500/5 to-transparent border-yellow-500/20";
            case "orange": return "from-orange-500/10 via-orange-500/5 to-transparent border-orange-500/20";
            case "blue": return "from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20";
            default: return "from-primary/10 via-primary/5 to-transparent border-primary/20";
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className={`relative bg-gradient-to-r ${getColors(insight.color)} border p-4 rounded-[24px] overflow-hidden group hover:shadow-sm transition-shadow`}
            >
                {/* Abstract background shape */}
                <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-50 ${insight.color === 'green' ? 'bg-green-500/20' :
                        insight.color === 'orange' ? 'bg-orange-500/20' :
                            'bg-primary/20'
                    }`} />

                <div className="flex gap-4 relative">
                    <div className={`p-2.5 rounded-xl shrink-0 h-fit ${insight.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                            insight.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                                'bg-primary/10 text-primary'
                        }`}>
                        {getIcon(insight.icon)}
                    </div>

                    <div className="space-y-1 my-auto">
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                                AI Insight
                                <span className="px-1.5 py-0.5 rounded-md bg-background/50 text-[10px] font-medium border border-border/50 uppercase tracking-wider text-muted-foreground">
                                    BETA
                                </span>
                            </h4>
                        </div>
                        <h3 className="font-semibold text-base leading-tight">
                            {insight.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {insight.message}
                        </p>
                    </div>

                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute top-0 right-0 p-1 text-muted-foreground/50 hover:text-muted-foreground rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
