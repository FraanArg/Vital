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
        <div className="grid grid-cols-2 gap-2">
            <AnimatePresence mode="popLayout">
                {filteredLogs?.map((log, index) => {
                    const tracker = TRACKERS.find(t => t.matcher(log));
                    if (!tracker) return null;

                    const Icon = tracker.getIcon ? tracker.getIcon(log, iconMappings) : tracker.icon;
                    const isMostRecent = index === 0;

                    // Get time for display
                    let timeDisplay = "";
                    if (log.sleep_end) {
                        timeDisplay = log.sleep_end;
                    } else if (log.meal?.time) {
                        timeDisplay = log.meal.time;
                    } else if (log.exercise?.time) {
                        timeDisplay = log.exercise.time;
                    }

                    // Extract border color from bgColor (e.g., "bg-orange-100" -> "border-l-orange-500")
                    const borderColor = tracker.bgColor
                        .replace("bg-", "border-l-")
                        .replace("-100", "-500")
                        .replace("-900/30", "-400");

                    return (
                        <motion.div
                            key={log._id}
                            layout
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={{ left: 0.3, right: 0.05 }}
                            onDragEnd={(_, info) => {
                                if (info.offset.x < -80) {
                                    handleDelete(log._id as Id<"logs">);
                                }
                            }}
                            onClick={() => {
                                trigger("light");
                                onEdit?.(log);
                            }}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                            whileDrag={{ scale: 1.02 }}
                            className={`
                                relative bg-card rounded-xl shadow-sm border border-border/50 
                                cursor-pointer transition-all duration-200 group overflow-hidden
                                hover:shadow-lg hover:scale-[1.02] min-h-[72px]
                                border-l-[3px] ${borderColor}
                                ${isMostRecent ? 'ring-2 ring-primary/20' : ''}
                            `}
                        >
                            {/* Subtle background tint on hover */}
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${tracker.bgColor.replace("/30", "/10")}`} />

                            {/* Delete indicator (shows when dragging left) */}
                            <div className="absolute right-0 top-0 bottom-0 w-16 bg-red-500/20 flex items-center justify-center opacity-0 group-active:opacity-100">
                                <Trash2 className="w-4 h-4 text-red-500" />
                            </div>

                            {/* Time badge in top-right corner */}
                            {timeDisplay && (
                                <div className="absolute top-2 right-2 z-10">
                                    <span className="text-[9px] font-medium text-muted-foreground bg-secondary/80 px-1.5 py-0.5 rounded-md">
                                        {timeDisplay}
                                    </span>
                                </div>
                            )}

                            {/* Hover action buttons (desktop) */}
                            <div className="absolute bottom-2 right-2 hidden sm:flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit?.(log);
                                    }}
                                    className="p-1.5 rounded-lg bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label="Edit"
                                >
                                    <Search className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(log._id as Id<"logs">);
                                    }}
                                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                                    aria-label="Delete"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>

                            {/* Card content */}
                            <div className="relative p-3 flex items-start gap-2.5">
                                {/* Icon */}
                                <div className={`p-2 rounded-lg shrink-0 ${tracker.bgColor} ${tracker.color} transition-transform group-hover:scale-110`}>
                                    <Icon className="w-4 h-4" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 py-0.5 pr-8">
                                    {tracker.renderContent(log)}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
