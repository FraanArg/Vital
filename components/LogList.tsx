"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Search, ClipboardList } from "lucide-react";
import { Skeleton } from "./ui/Skeleton";
import { TRACKERS } from "../lib/tracker-registry";
import { useToast } from "./ui/ToastContext";
import { useHaptic } from "../hooks/useHaptic";

import { Doc } from "../convex/_generated/dataModel";

interface LogListProps {
    selectedDate: Date;
    onEdit?: (log: Doc<"logs">) => void;
}

export default function LogList({ selectedDate, onEdit }: LogListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const iconMappings = useQuery(api.icons.getIconMappings);
    const { toast } = useToast();
    const { trigger } = useHaptic();

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

    const handleDelete = (id: Id<"logs">) => {
        trigger("medium");
        deleteLog({ id });
        toast("Log deleted", "success");
    };

    const filteredLogs = useMemo(() => {
        const filtered = logs?.filter(log => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return (
                log.food?.toLowerCase().includes(query) ||
                log.journal?.toLowerCase().includes(query) ||
                log.custom?.some(c => c.name.toLowerCase().includes(query))
            );
        });

        // Sort chronologically
        return filtered?.sort((a, b) => {
            const getMinutes = (log: Doc<"logs">) => {
                let timeStr: string | null = null;
                if (log.sleep_start) timeStr = log.sleep_start;
                else if (log.meal?.time) timeStr = log.meal.time;
                else if (log.exercise?.time) timeStr = log.exercise.time;

                if (timeStr) {
                    const [h, m] = timeStr.split(':').map(Number);
                    return h * 60 + m;
                }

                // Fallback: use creation time to place them relatively correctly
                // We map creation time to a "minute" value. 
                // Since creation time is a large timestamp, we can just return a value that puts it at the end or start?
                // Better: if no time, use 0 (start of day) or 1440 (end of day).
                // Let's assume items without time (like Journal) happen "throughout" or at the end.
                // Let's use creation time to sort amongst themselves.
                return -1; // Items without explicit time go first? Or last? Let's say first.
            };

            const timeA = getMinutes(a);
            const timeB = getMinutes(b);

            if (timeA !== -1 && timeB !== -1) {
                return timeA - timeB;
            }

            if (timeA === -1 && timeB === -1) {
                return a._creationTime - b._creationTime;
            }

            // If one has time and other doesn't, prioritize the one with time?
            // Or maybe items without time (Journal) should be at the bottom?
            // Let's put items without time at the bottom (larger value).
            if (timeA === -1) return 1;
            if (timeB === -1) return -1;

            return 0;
        });
    }, [logs, searchQuery]);

    if (logs === undefined) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-card p-4 rounded-2xl shadow-sm border border-border/50 flex items-center gap-4 h-[72px]">
                        <Skeleton className="w-12 h-12 rounded-xl" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="w-32 h-4 rounded-lg" />
                            <Skeleton className="w-20 h-3 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="p-4 bg-secondary/50 rounded-full">
                    <ClipboardList className="w-12 h-12 text-muted-foreground/50" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-foreground">Ready to track?</h3>
                    <p className="text-sm text-muted-foreground max-w-[250px]">
                        Log your first activity to start your streak for today.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                    type="text"
                    placeholder="Search logs..."
                    aria-label="Search logs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary text-base"
                />
            </div>

            <AnimatePresence mode="popLayout">
                {filteredLogs?.map((log) => {
                    const tracker = TRACKERS.find(t => t.matcher(log));
                    if (!tracker) return null;

                    const Icon = tracker.getIcon ? tracker.getIcon(log, iconMappings) : tracker.icon;

                    return (
                        <div className="relative mb-3 group" key={log._id}>
                            {/* Swipe Background (Trash) */}
                            <div className="absolute inset-0 bg-red-500/10 rounded-2xl flex items-center justify-end pr-4 border border-red-500/20">
                                <Trash2 className="w-5 h-5 text-red-500" />
                            </div>

                            <motion.div
                                layout
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={{ left: 0.5, right: 0.05 }}
                                onDragEnd={(_, info) => {
                                    if (info.offset.x < -100) {
                                        handleDelete(log._id as Id<"logs">);
                                    }
                                }}
                                onClick={() => {
                                    trigger("light");
                                    onEdit?.(log);
                                }}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                whileDrag={{ scale: 1.02 }}
                                className={`bg-card p-4 rounded-2xl shadow-[var(--shadow)] hover:shadow-[var(--shadow-hover)] border flex items-center justify-between relative overflow-hidden border-border/50 z-10 touch-pan-y cursor-pointer transition-all duration-300 ${tracker.bgColor.replace('bg-', 'bg-')}`}
                                style={{ x: 0 }}
                            >
                                {/* Hover Effect Background (Desktop) */}
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none ${tracker.bgColor.replace('bg-', 'bg-')}`} />

                                <div className="flex items-center gap-4 relative z-10 pointer-events-none">
                                    <div className={`p-3 rounded-xl ${tracker.bgColor} ${tracker.color}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className="font-medium">{tracker.renderContent(log)}</span>
                                </div>

                                {/* Desktop Trash Button (Hidden on Mobile usually, but good to keep for mouse users) */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(log._id as Id<"logs">);
                                    }}
                                    aria-label="Delete log"
                                    className="hidden sm:block p-2 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 active:scale-90 relative z-10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                {/* Mobile Chevron/Indicator (Optional, maybe just the swipe hint is enough) */}
                            </motion.div>
                        </div>
                    );
                })}
            </AnimatePresence>


            {filteredLogs?.length === 0 && searchQuery && (
                <div className="text-center py-8 text-muted">
                    <p>No logs match your search.</p>
                </div>
            )}
        </div>
    );
}
