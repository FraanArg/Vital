"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { useState } from "react";

interface Insight {
    type: "food" | "sleep" | "exercise";
    icon: string;
    title: string;
    message: string;
    priority: number;
}

interface AIInsightsProps {
    selectedDate: Date;
}

export default function AIInsights({ selectedDate }: AIInsightsProps) {
    const [dismissed, setDismissed] = useState<string[]>([]);

    const insights = useQuery(api.insights.getDailyInsights, {
        date: selectedDate.toISOString(),
    }) as Insight[] | undefined;

    if (!insights || insights.length === 0) return null;

    const visibleInsights = insights.filter((i: Insight) => !dismissed.includes(i.title));
    if (visibleInsights.length === 0) return null;

    const iconByType: Record<string, string> = {
        food: "🍽️",
        sleep: "🌙",
        exercise: "💪",
    };

    return (
        <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>AI Insights</span>
            </div>

            <AnimatePresence mode="popLayout">
                {visibleInsights.map((insight: Insight, index: number) => (
                    <motion.div
                        key={insight.title}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border border-primary/10 p-4 rounded-2xl overflow-hidden"
                    >
                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/5 rounded-full blur-xl" />

                        <div className="flex items-start gap-3 relative">
                            <span className="text-2xl shrink-0">{insight.icon}</span>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm text-foreground mb-1 flex items-center gap-2">
                                    {insight.title}
                                    <span className="text-xs opacity-50">{iconByType[insight.type]}</span>
                                </h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {insight.message}
                                </p>
                            </div>
                            <button
                                onClick={() => setDismissed([...dismissed, insight.title])}
                                className="p-1 hover:bg-primary/10 rounded-full transition-colors text-muted-foreground hover:text-foreground shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
