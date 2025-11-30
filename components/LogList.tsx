"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id, Doc } from "../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Moon, Droplets, Utensils, Trash2, Book, Star, Search, Trophy, Activity, Dumbbell, Timer, Footprints, LucideIcon, Circle, Waves, Swords, Target } from "lucide-react";
import { Skeleton } from "./ui/Skeleton";

// ... (rest of the file)

if (log.custom) return (
    <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
        <Star className="w-5 h-5 text-gray-600 dark:text-gray-400" />
    </div>
);
return null;
    };

const getText = (log: Doc<"logs">) => {
    if (log.work) return `Work: ${log.work}h`;
    if (log.sleep) {
        return (
            <div className="flex flex-col">
                <span className="font-semibold text-sm">Sleep: {log.sleep}h</span>
                {log.sleep_start && log.sleep_end && (
                    <span className="text-xs text-muted-foreground">{log.sleep_start} - {log.sleep_end}</span>
                )}
            </div>
        );
    }
    if (log.water) return `Water: ${log.water} L`;
    if (log.meal) {
        const typeName = log.meal.type.charAt(0).toUpperCase() + log.meal.type.slice(1).replace('_', ' ');
        return (
            <div className="flex flex-col">
                <span className="font-semibold text-sm flex items-center gap-2">
                    {typeName} <span className="text-xs text-muted font-normal">{log.meal.time}</span>
                </span>
                <span className="text-xs text-muted-foreground">{log.meal.items.join(", ")}</span>
            </div>
        );
    }
    if (log.food) return `Food: ${log.food}`;
    if (log.exercise) {
        const typeName = log.exercise.type.charAt(0).toUpperCase() + log.exercise.type.slice(1);
        if (log.exercise.type === "gym" && log.exercise.workout) {
            const exerciseCount = log.exercise.workout.length;
            const exerciseNames = log.exercise.workout.map(w => w.name).join(", ");
            return (
                <div className="flex flex-col">
                    <span className="font-semibold text-sm flex items-center gap-2">
                        {typeName} <span className="text-xs text-muted font-normal">{log.exercise.duration}m</span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {exerciseCount} exercises: {exerciseNames.substring(0, 30)}{exerciseNames.length > 30 ? '...' : ''}
                    </span>
                    {log.exercise.notes && (
                        <span className="text-xs text-muted-foreground italic mt-1">&quot;{log.exercise.notes}&quot;</span>
                    )}
                </div>
            );
        }
        return (
            <div className="flex flex-col">
                <span className="font-semibold text-sm flex items-center gap-2">
                    {typeName} <span className="text-xs text-muted font-normal">{log.exercise.duration}m</span>
                </span>
                {log.exercise.distance && (
                    <span className="text-xs text-muted-foreground">{log.exercise.distance} km</span>
                )}
                {log.exercise.notes && (
                    <span className="text-xs text-muted-foreground italic mt-1">&quot;{log.exercise.notes}&quot;</span>
                )}
            </div>
        );
    }
    if (log.journal) return `Journal: ${log.journal.substring(0, 30)}${log.journal.length > 30 ? '...' : ''}`;
    if (log.custom) return `${log.custom[0].name}: ${log.custom[0].value} ${log.custom[0].unit}`;
    return "Unknown Log";
};

return (
    <div className="space-y-4">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary text-sm"
            />
        </div>

        <AnimatePresence mode="popLayout">
            {filteredLogs?.map((log) => (
                <motion.div
                    key={log._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-card p-4 rounded-2xl shadow-sm border border-border/50 flex items-center justify-between group"
                >
                    <div className="flex items-center gap-3">
                        {getIcon(log)}
                        <span className="font-medium">{getText(log)}</span>
                    </div>
                    <button
                        onClick={() => deleteLog({ id: log._id as Id<"logs"> })}
                        className="p-2 text-muted hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 active:scale-90"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </motion.div>
            ))}
        </AnimatePresence>

        {filteredLogs?.length === 0 && searchQuery && (
            <div className="text-center py-8 text-muted">
                <p>No logs match your search.</p>
            </div>
        )}
    </div>
);
}
