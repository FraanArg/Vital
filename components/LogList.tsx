"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Search } from "lucide-react";
import { Skeleton } from "./ui/Skeleton";
import { TRACKERS } from "../lib/tracker-registry";

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

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                    type="text"
                    placeholder="Search logs..."
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
                        <motion.div
                            key={log._id}
                            layout
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            className={`bg-card p-4 rounded-2xl shadow-sm border flex items-center justify-between group relative overflow-hidden border-border/50 hover:border-primary/20`}
                        >
                            {/* Hover Effect Background */}
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none ${tracker.bgColor.replace('bg-', 'bg-')}`} />

                            <div className="flex items-center gap-4 relative z-10">
                                <div className={`p-3 rounded-xl ${tracker.bgColor} ${tracker.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="font-medium">{tracker.renderContent(log)}</span>
                            </div>
                            <button
                                onClick={() => deleteLog({ id: log._id as Id<"logs"> })}
                                className="p-2 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 active:scale-90 relative z-10"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </motion.div>
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
