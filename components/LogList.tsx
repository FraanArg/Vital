"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Moon, Droplets, Utensils, Trash2, Book, Star, Search } from "lucide-react";
import { Skeleton } from "./ui/Skeleton";

interface LogListProps {
    selectedDate: Date;
}

export default function LogList({ selectedDate }: LogListProps) {
    const [searchQuery, setSearchQuery] = useState("");

    // Calculate start and end of day
    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(selectedDate);
    end.setHours(23, 59, 59, 999);

    // Convex Query
    const logs = useQuery(api.logs.getLogs, {
        from: start.toISOString(),
        to: end.toISOString()
    });

    // Convex Mutation with Optimistic Update
    const deleteLog = useMutation(api.logs.deleteLog).withOptimisticUpdate((localStore, args) => {
        const { from, to } = { from: start.toISOString(), to: end.toISOString() };
        const existingLogs = localStore.getQuery(api.logs.getLogs, { from, to });

        if (existingLogs) {
            localStore.setQuery(
                api.logs.getLogs,
                { from, to },
                existingLogs.filter(log => log._id !== args.id)
            );
        }
    });

    const filteredLogs = useMemo(() => {
        return logs?.filter(log => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return (
                log.food?.toLowerCase().includes(query) ||
                log.journal?.toLowerCase().includes(query) ||
                log.custom?.some(c => c.name.toLowerCase().includes(query))
            );
        });
    }, [logs, searchQuery]);

    if (logs === undefined) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-card p-4 rounded-2xl shadow-sm border border-border/50 flex items-center justify-between h-[72px]">
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="w-24 h-4" />
                                <Skeleton className="w-16 h-3" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="text-center py-10 text-muted">
                <p>No logs yet. Start tracking!</p>
            </div>
        );
    }

    const getIcon = (log: any) => {
        if (log.work) return (
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                <Briefcase className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
        );
        if (log.sleep) return (
            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
        );
        if (log.water) return (
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
        );
        if (log.meal) {
            const icons: Record<string, string> = {
                desayuno: "☕", colacion_am: "🍎", almuerzo: "🍽️", colacion_pm: "🍎",
                merienda: "🫖", colacion_night: "🍎", cena: "🌙", postre: "🍰"
            };
            return (
                <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
                    <span className="text-lg">{icons[log.meal.type] || "🍽️"}</span>
                </div>
            );
        }
        if (log.food) return (
            <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
                <Utensils className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
        );
        if (log.journal) return (
            <div className="p-2 rounded-full bg-pink-100 dark:bg-pink-900/30">
                <Book className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
        );
        if (log.custom) return (
            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                <Star className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
        );
        return null;
    };

    const getText = (log: any) => {
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
