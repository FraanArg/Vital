"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion } from "framer-motion";
import { TrendingUp, Trophy, Dumbbell } from "lucide-react";

interface Suggestion {
    lastWeight: number;
    lastReps: number;
    suggestedWeight: number;
    suggestedReps: number;
    lastDate: string;
}

interface Props {
    exerciseName?: string;
}

export default function ProgressiveOverload({ exerciseName }: Props) {
    const suggestions = useQuery(api.stats.getProgressiveSuggestions, {
        exerciseNames: exerciseName ? [exerciseName] : undefined,
    }) as Record<string, Suggestion> | undefined;

    if (!suggestions || Object.keys(suggestions).length === 0) return null;

    const entries = Object.entries(suggestions);

    // If looking for specific exercise
    if (exerciseName) {
        const suggestion = suggestions[exerciseName.toLowerCase()];
        if (!suggestion) return null;

        return (
            <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-xs"
            >
                <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                <span className="text-muted-foreground">Last:</span>
                <span className="font-medium">{suggestion.lastWeight}kg × {suggestion.lastReps}</span>
                <span className="text-muted-foreground">→ Try:</span>
                <span className="font-bold text-green-500">{suggestion.suggestedWeight}kg</span>
            </motion.div>
        );
    }

    // Show all suggestions (for dashboard widget)
    return (
        <div className="bg-card rounded-2xl border border-border/50 p-4">
            <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-green-500/10">
                    <Dumbbell className="w-4 h-4 text-green-500" />
                </div>
                <h3 className="font-semibold text-sm">Progressive Overload</h3>
            </div>
            <div className="space-y-2">
                {entries.slice(0, 5).map(([name, s]) => (
                    <div key={name} className="flex items-center justify-between text-xs">
                        <span className="capitalize truncate flex-1">{name}</span>
                        <span className="text-muted-foreground">{s.lastWeight}kg</span>
                        <TrendingUp className="w-3 h-3 mx-1 text-green-500" />
                        <span className="font-bold text-green-500">{s.suggestedWeight}kg</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Badge for PR highlighting
export function PRBadge({ isPR }: { isPR: boolean }) {
    if (!isPR) return null;

    return (
        <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-yellow-500/20 text-yellow-600 rounded text-[10px] font-bold"
        >
            <Trophy className="w-3 h-3" />
            PR
        </motion.span>
    );
}
