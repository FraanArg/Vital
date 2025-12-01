"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id, Doc } from "../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Star, Search, Trophy, Dumbbell, Timer, Footprints, LucideIcon, Circle, Waves, Swords, Target, Moon, Droplets, Utensils, Smile } from "lucide-react";
import { Skeleton } from "./ui/Skeleton";
import { ICON_LIBRARY } from "../lib/icon-library";

interface LogListProps {
    selectedDate: Date;
}

export default function LogList({ selectedDate }: LogListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const iconMappings = useQuery(api.icons.getIconMappings);

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



    const getIcon = (log: Doc<"logs">) => {
        if (log.work) return (
            <div className="p-3 rounded-xl bg-secondary text-foreground">
                <Timer className="w-5 h-5" />
            </div>
        );
        if (log.sleep) return (
            <div className="p-3 rounded-xl bg-violet-500/10 text-violet-500">
                <Moon className="w-5 h-5" />
            </div>
        );
        if (log.water) return (
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-500">
                <Droplets className="w-5 h-5" />
            </div>
        );
        if (log.meal || log.food) return (
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
                <Utensils className="w-5 h-5" />
            </div>
        );
        if (log.mood) return (
            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500">
                <Smile className="w-5 h-5" />
            </div>
        );

        if (log.exercise) {
            const defaultIcons: Record<string, { icon: LucideIcon }> = {
                padel: { icon: Swords },
                football: { icon: Circle },
                tennis: { icon: Target },
                basketball: { icon: Circle },
                swimming: { icon: Waves },
                volleyball: { icon: Circle },
                gym: { icon: Dumbbell },
                run: { icon: Timer },
                walk: { icon: Footprints },
            };

            // Check for custom mapping
            const customMapping = iconMappings?.find(m => m.type === "sport" && m.key === log.exercise!.type);
            let Icon = defaultIcons[log.exercise.type]?.icon || Trophy;

            if (customMapping && ICON_LIBRARY[customMapping.icon]) {
                Icon = ICON_LIBRARY[customMapping.icon];
            }

            return (
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <Icon className="w-5 h-5" />
                </div>
            );
        }
        if (log.custom) return (
            <div className="p-3 rounded-xl bg-secondary text-foreground">
                <Star className="w-5 h-5" />
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
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        className={`bg-card p-4 rounded-2xl shadow-sm border flex items-center justify-between group relative overflow-hidden ${log.meal || log.food ? "border-orange-500/20 hover:border-orange-500/40" :
                            log.exercise ? "border-emerald-500/20 hover:border-emerald-500/40" :
                                log.water ? "border-cyan-500/20 hover:border-cyan-500/40" :
                                    log.sleep ? "border-violet-500/20 hover:border-violet-500/40" :
                                        log.mood ? "border-yellow-500/20 hover:border-yellow-500/40" :
                                            "border-border/50"
                            }`}
                    >
                        {/* Glow Effect */}
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none ${log.meal || log.food ? "bg-orange-500" :
                            log.exercise ? "bg-emerald-500" :
                                log.water ? "bg-cyan-500" :
                                    log.sleep ? "bg-violet-500" :
                                        log.mood ? "bg-yellow-500" :
                                            "bg-white"
                            }`} />

                        <div className="flex items-center gap-4 relative z-10">
                            {getIcon(log)}
                            <span className="font-medium">{getText(log)}</span>
                        </div>
                        <button
                            onClick={() => deleteLog({ id: log._id as Id<"logs"> })}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 active:scale-90 relative z-10"
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
