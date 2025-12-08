"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, TrendingUp, TrendingDown, Minus, ChevronDown, Settings2 } from "lucide-react";

interface Correlation {
    icon: string;
    title: string;
    insight: string;
    impact: string;
    confidence: number;
    category: "mood" | "sleep" | "exercise" | "nutrition";
    dataPoints?: number;
}

export default function AdvancedCorrelations() {
    const correlations = useQuery(api.stats.getAdvancedCorrelations) as Correlation[] | undefined;
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [threshold, setThreshold] = useState(0.5);
    const [showSettings, setShowSettings] = useState(false);

    // Load threshold from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("correlation-threshold");
        if (saved) setThreshold(parseFloat(saved));
    }, []);

    const updateThreshold = (value: number) => {
        setThreshold(value);
        localStorage.setItem("correlation-threshold", value.toString());
    };

    if (!correlations || correlations.length === 0) return null;

    const filtered = correlations.filter((c) => c.confidence >= threshold);

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

    const thresholdLabels = [
        { value: 0.5, label: "All" },
        { value: 0.7, label: "70%+" },
        { value: 0.85, label: "85%+" },
    ];

    return (
        <div className="bg-card rounded-2xl border border-border/50 p-5">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    <Brain className="w-5 h-5 text-purple-500" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold">Pattern Intelligence</h3>
                    <p className="text-xs text-muted-foreground">Discovered from your data</p>
                </div>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                    <Settings2 className="w-4 h-4 text-muted-foreground" />
                </button>
            </div>

            {/* Confidence Filter */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-4"
                    >
                        <div className="bg-muted/50 rounded-lg p-3">
                            <div className="text-xs text-muted-foreground mb-2">Confidence Threshold</div>
                            <div className="flex gap-2">
                                {thresholdLabels.map((t) => (
                                    <button
                                        key={t.value}
                                        onClick={() => updateThreshold(t.value)}
                                        className={`flex-1 py-1.5 px-2 text-xs rounded-lg transition-all ${threshold === t.value
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-background hover:bg-muted"
                                            }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {filtered.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">
                    No patterns meet the {Math.round(threshold * 100)}% confidence threshold
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((corr, i) => {
                        const isExpanded = expandedId === corr.title;
                        return (
                            <motion.div
                                key={corr.title}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`relative bg-gradient-to-r ${categoryColors[corr.category]} border p-4 rounded-xl overflow-hidden cursor-pointer`}
                                onClick={() => setExpandedId(isExpanded ? null : corr.title)}
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
                                                <ChevronDown
                                                    className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {corr.insight}
                                        </p>

                                        {/* Expanded Details */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="mt-3 pt-3 border-t border-border/30 text-xs text-muted-foreground space-y-1">
                                                        <p>📊 Based on {corr.dataPoints || 60} days of tracking data</p>
                                                        <p>📈 Confidence: {Math.round(corr.confidence * 100)}% correlation strength</p>
                                                        <p>🏷️ Category: {corr.category.charAt(0).toUpperCase() + corr.category.slice(1)}</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
