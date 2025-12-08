"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Brain, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Correlation {
    icon: string;
    title: string;
    insight: string;
    impact: string;
    confidence: number;
    category: "mood" | "sleep" | "exercise" | "nutrition";
}

export default function AdvancedCorrelations() {
    const correlations = useQuery(api.stats.getAdvancedCorrelations) as Correlation[] | undefined;

    if (!correlations || correlations.length === 0) return null;

    const categoryColors = {
        mood: "from-yellow-500/10 to-yellow-500/5 border-yellow-500/20",
        sleep: "from-indigo-500/10 to-indigo-500/5 border-indigo-500/20",
        exercise: "from-green-500/10 to-green-500/5 border-green-500/20",
        nutrition: "from-orange-500/10 to-orange-500/5 border-orange-500/20",
    };

    const impactIcons = {
        positive: <TrendingUp className="w-4 h-4 text-green-500" />,
        negative: <TrendingDown className="w-4 h-4 text-red-500" />,
        neutral: <Minus className="w-4 h-4 text-gray-500" />,
    };

    return (
        <div className="bg-card rounded-2xl border border-border/50 p-5">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    <Brain className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                    <h3 className="font-semibold">Pattern Intelligence</h3>
                    <p className="text-xs text-muted-foreground">Discovered from your data</p>
                </div>
            </div>

            <div className="space-y-3">
                {correlations.map((corr, i) => (
                    <motion.div
                        key={corr.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`relative bg-gradient-to-r ${categoryColors[corr.category]} border p-4 rounded-xl overflow-hidden`}
                    >
                        <div className="flex items-start gap-3">
                            <span className="text-2xl shrink-0">{corr.icon}</span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-sm">{corr.title}</h4>
                                    {impactIcons[corr.impact as keyof typeof impactIcons]}
                                    <div className="ml-auto flex items-center gap-1">
                                        <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                                style={{ width: `${corr.confidence * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-muted-foreground">
                                            {Math.round(corr.confidence * 100)}%
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {corr.insight}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
