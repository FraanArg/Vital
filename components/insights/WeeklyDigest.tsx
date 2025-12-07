"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

interface Insight {
    type: "food" | "sleep" | "exercise" | "trend" | "correlation" | "achievement";
    icon: string;
    title: string;
    message: string;
    priority: number;
    color?: string;
}

export default function WeeklyDigest() {
    const insights = useQuery(api.insights.getWeeklyDigest) as Insight[] | undefined;
    const [dismissed, setDismissed] = useState<string[]>([]);
    const [expanded, setExpanded] = useState<string | null>(null);

    if (!insights || insights.length === 0) return null;

    const visibleInsights = insights.filter(i => !dismissed.includes(i.title));

    const colorClasses: Record<string, string> = {
        green: "from-green-500/10 to-green-500/5 border-green-500/20",
        yellow: "from-yellow-500/10 to-yellow-500/5 border-yellow-500/20",
        blue: "from-blue-500/10 to-blue-500/5 border-blue-500/20",
        purple: "from-purple-500/10 to-purple-500/5 border-purple-500/20",
        orange: "from-orange-500/10 to-orange-500/5 border-orange-500/20",
        gray: "from-gray-500/10 to-gray-500/5 border-gray-500/20",
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Sparkles className="w-3 h-3 text-primary" />
                <span>Weekly Insights</span>
            </div>

            <div className="flex flex-col gap-2">
                <AnimatePresence>
                    {visibleInsights.map((insight, index) => (
                        <motion.div
                            key={insight.title}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20, height: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`relative bg-gradient-to-r ${colorClasses[insight.color || "gray"]} border p-3 rounded-xl overflow-hidden group`}
                        >
                            {/* Priority badge for high priority insights */}
                            {insight.priority >= 8 && (
                                <div className="absolute top-1 right-8 flex items-center gap-0.5 text-orange-500">
                                    <AlertCircle className="w-3 h-3" />
                                </div>
                            )}

                            {/* Dismiss button */}
                            <button
                                onClick={() => setDismissed([...dismissed, insight.title])}
                                className="absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-black/10 transition-all"
                                aria-label="Dismiss"
                            >
                                <X className="w-3 h-3 text-muted-foreground" />
                            </button>

                            <div
                                className="flex items-start gap-3 cursor-pointer"
                                onClick={() => setExpanded(expanded === insight.title ? null : insight.title)}
                            >
                                <span className="text-xl shrink-0">{insight.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm text-foreground leading-tight flex items-center gap-1">
                                        {insight.title}
                                        {expanded === insight.title ? (
                                            <ChevronUp className="w-3 h-3 text-muted-foreground" />
                                        ) : (
                                            <ChevronDown className="w-3 h-3 text-muted-foreground" />
                                        )}
                                    </h4>
                                    <p className={`text-xs text-muted-foreground leading-snug mt-0.5 ${expanded === insight.title ? '' : 'line-clamp-2'}`}>
                                        {insight.message}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}


