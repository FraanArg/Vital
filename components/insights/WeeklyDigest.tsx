"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, Award, Lightbulb, Target } from "lucide-react";
import { InsightCard } from "../ui/InsightCard";

interface Insight {
    type: "food" | "sleep" | "exercise" | "trend" | "correlation" | "achievement";
    icon: string;
    title: string;
    message: string;
    priority: number;
    color?: string;
}

// Map colors to InsightCard variants
const colorToVariant: Record<string, "info" | "success" | "warning" | "danger"> = {
    green: "success",
    yellow: "warning",
    orange: "warning",
    red: "danger",
    blue: "info",
    purple: "info",
    gray: "info",
};

// Map insight types to icons
const typeToIcon: Record<string, React.ReactNode> = {
    trend: <TrendingUp className="w-5 h-5" />,
    achievement: <Award className="w-5 h-5" />,
    correlation: <Lightbulb className="w-5 h-5" />,
    food: <Target className="w-5 h-5" />,
    sleep: <Target className="w-5 h-5" />,
    exercise: <Target className="w-5 h-5" />,
};

export default function WeeklyDigest() {
    const insights = useQuery(api.insights.getWeeklyDigest) as Insight[] | undefined;
    const [dismissed, setDismissed] = useState<string[]>([]);

    if (!insights || insights.length === 0) return null;

    const visibleInsights = insights.filter(i => !dismissed.includes(i.title));

    if (visibleInsights.length === 0) return null;

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
                        >
                            <InsightCard
                                icon={typeToIcon[insight.type] || <span className="text-xl">{insight.icon}</span>}
                                title={insight.title}
                                description={insight.message}
                                variant={colorToVariant[insight.color || "gray"]}
                                delay={index * 0.05}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
