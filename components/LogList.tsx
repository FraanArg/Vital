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

                // For sleep, check if it's overnight (start >= 20:00 or < 5:00)
                // If so, use end time for sorting since that's when you woke up on this day
                if (log.sleep_start && log.sleep_end) {
                    const startHour = parseInt(log.sleep_start.split(':')[0]);
                    if (startHour >= 20 || startHour < 5) {
                        timeStr = log.sleep_end; // Use wake-up time
                    } else {
                        timeStr = log.sleep_start;
                    }
                } else if (log.sleep_start) {
                    timeStr = log.sleep_start;
                } else if (log.meal?.time) {
                    timeStr = log.meal.time;
                } else if (log.exercise?.time) {
                    timeStr = log.exercise.time;
                }

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

    const groupedLogs = useMemo(() => {
        if (!filteredLogs) return [];

        const groups: { label: string; logs: typeof filteredLogs }[] = [
            { label: "Morning", logs: [] },
            { label: "Afternoon", logs: [] },
            { label: "Evening", logs: [] },
        ];

        filteredLogs.forEach((log) => {
            let hours = new Date(log._creationTime).getHours();

            // For sleep logs, use end time if it's an overnight sleep (start >= 20:00 means overnight)
            // This ensures overnight sleep (e.g., 23:00 - 07:00) appears in Morning on the day you wake up
            if (log.sleep_start && log.sleep_end) {
                const startHour = parseInt(log.sleep_start.split(':')[0]);
                const endHour = parseInt(log.sleep_end.split(':')[0]);
                // If sleep started late evening (>= 20:00) or very early morning (< 5:00),
                // use the end time for grouping since that's when you woke up
                if (startHour >= 20 || startHour < 5) {
                    hours = endHour;
                } else {
                    hours = startHour;
                }
            } else if (log.sleep_start) {
                hours = parseInt(log.sleep_start.split(':')[0]);
            } else if (log.meal?.time) {
                hours = parseInt(log.meal.time.split(':')[0]);
            } else if (log.exercise?.time) {
                hours = parseInt(log.exercise.time.split(':')[0]);
            }

            if (hours < 12) groups.find(g => g.label === "Morning")?.logs.push(log);
            else if (hours < 18) groups.find(g => g.label === "Afternoon")?.logs.push(log);
            else groups.find(g => g.label === "Evening")?.logs.push(log);
        });

        // Filter out empty groups
        return groups.filter(g => g.logs.length > 0);
    }, [filteredLogs]);

    if (logs === undefined) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-card p-4 rounded-[32px] shadow-sm border border-border/50 flex items-center gap-4 h-[72px]">
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
        <div className="space-y-2">
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

            <div className="relative pl-4">
                {/* Vertical Timeline Line */}
                <div className="absolute left-[21px] top-4 bottom-4 w-0.5 bg-border/50 rounded-full" />

                <AnimatePresence mode="popLayout">
                    {groupedLogs.map((group, groupIndex) => (
                        <div key={group.label} className="mb-3 relative">
                            <div className="flex items-center gap-2 mb-1.5 ml-8">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-background px-2 relative z-10">
                                    {group.label}
                                </span>
                            </div>

                            <div className="space-y-1.5">
                                {group.logs.map((log, index) => {
                                    const tracker = TRACKERS.find(t => t.matcher(log));
                                    if (!tracker) return null;

                                    const Icon = tracker.getIcon ? tracker.getIcon(log, iconMappings) : tracker.icon;
                                    const isMostRecent = groupIndex === 0 && index === 0;

                                    return (
                                        <div className="relative group" key={log._id}>
                                            {/* Timeline Dot */}
                                            <div className={`absolute left-[5px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-background z-20 ${isMostRecent ? "bg-primary" : "bg-muted-foreground/30"}`}>
                                                {isMostRecent && (
                                                    <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
                                                )}
                                            </div>

                                            {/* Connector Line to Card */}
                                            <div className="absolute left-[16px] top-1/2 -translate-y-1/2 w-4 h-0.5 bg-border/50" />

                                            <div className="ml-8">
                                                {/* Swipe Background (Trash) */}
                                                <div className="absolute inset-0 left-8 bg-red-500/10 rounded-2xl flex items-center justify-end pr-4 border border-red-500/20">
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
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                                    whileDrag={{ scale: 1.02 }}
                                                    className={`bg-card py-2 px-3 rounded-xl shadow-sm hover:shadow-md border flex items-center justify-between relative overflow-hidden border-border/50 z-10 touch-pan-y cursor-pointer transition-all duration-300 ${tracker.bgColor.replace('bg-', 'bg-')}`}
                                                    style={{ x: 0 }}
                                                >
                                                    {/* Hover Effect Background */}
                                                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none ${tracker.bgColor.replace('bg-', 'bg-')}`} />

                                                    <div className="flex items-center gap-2 relative z-10 pointer-events-none">
                                                        <div className={`p-1.5 rounded-lg ${tracker.bgColor} ${tracker.color}`}>
                                                            <Icon className="w-3.5 h-3.5" />
                                                        </div>
                                                        <span className="font-medium text-xs">{tracker.renderContent(log)}</span>
                                                    </div>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(log._id as Id<"logs">);
                                                        }}
                                                        aria-label="Delete log"
                                                        className="hidden sm:block p-1.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 active:scale-90 relative z-10"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </motion.div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredLogs?.length === 0 && searchQuery && (
                <div className="text-center py-8 text-muted">
                    <p>No logs match your search.</p>
                </div>
            )}
        </div>
    );
}
