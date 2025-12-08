"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Lightbulb, TrendingUp } from "lucide-react";

export default function CorrelationInsights() {
    const correlations = useQuery(api.stats.getCorrelations);

    if (!correlations || correlations.length === 0) return null;

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.8) return "bg-green-500";
        if (confidence >= 0.6) return "bg-yellow-500";
        return "bg-orange-500";
    };

    return (
        <div className="bg-card rounded-2xl border border-border/50 p-5">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-purple-500/10">
                    <Lightbulb className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                    <h3 className="font-semibold">Discovered Patterns</h3>
                    <p className="text-xs text-muted-foreground">Insights from your data</p>
                </div>
            </div>

            <div className="space-y-3">
                {correlations.map((correlation, i) => (
                    <motion.div
                        key={correlation.title}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 bg-gradient-to-r from-purple-500/5 to-transparent border border-purple-500/10 rounded-xl"
                    >
                        <div className="flex items-start gap-3">
                            <span className="text-2xl shrink-0">{correlation.icon}</span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-sm">{correlation.title}</h4>
                                    <div className="flex items-center gap-1">
                                        <div className={`w-1.5 h-1.5 rounded-full ${getConfidenceColor(correlation.confidence)}`} />
                                        <span className="text-[10px] text-muted-foreground">
                                            {Math.round(correlation.confidence * 100)}%
                                        </span>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {correlation.insight}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
