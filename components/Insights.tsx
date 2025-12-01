"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { TrendingUp, TrendingDown, Lightbulb, Smile, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const ICONS = {
    TrendingUp,
    TrendingDown,
    Lightbulb,
    Smile,
    Sparkles
};

export default function Insights() {
    const insights = useQuery(api.analysis.getInsights);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!insights || insights.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % insights.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [insights]);

    if (!insights || insights.length === 0) return null;

    const currentInsight = insights[currentIndex];
    const Icon = ICONS[currentInsight.icon as keyof typeof ICONS] || Sparkles;

    return (
        <div className="mb-6">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="bg-card/50 backdrop-blur-sm border border-border/50 p-4 rounded-2xl flex items-center gap-4 shadow-sm"
                >
                    <div className={`p-2 rounded-xl bg-background shadow-sm ${currentInsight.color}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                        {currentInsight.message}
                    </p>
                </motion.div>
            </AnimatePresence>

            {insights.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-2">
                    {insights.map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentIndex ? "bg-primary" : "bg-border"}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
