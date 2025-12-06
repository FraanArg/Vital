"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

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

    if (!insights || insights.length === 0) return null;

    const colorClasses: Record<string, string> = {
        green: "from-green-500/10 to-green-500/5 border-green-500/20",
        yellow: "from-yellow-500/10 to-yellow-500/5 border-yellow-500/20",
        blue: "from-blue-500/10 to-blue-500/5 border-blue-500/20",
        purple: "from-purple-500/10 to-purple-500/5 border-purple-500/20",
        orange: "from-orange-500/10 to-orange-500/5 border-orange-500/20",
        gray: "from-gray-500/10 to-gray-500/5 border-gray-500/20",
    };

    return (
        <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Weekly Insights</span>
            </div>

            <div className="space-y-2">
                {insights.map((insight, index) => (
                    <motion.div
                        key={insight.title}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative bg-gradient-to-r ${colorClasses[insight.color || "gray"]} border p-3 rounded-xl overflow-hidden`}
                    >
                        <div className="flex items-start gap-3">
                            <span className="text-xl shrink-0">{insight.icon}</span>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm text-foreground">{insight.title}</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                                    {insight.message}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
