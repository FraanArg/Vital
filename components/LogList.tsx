"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Moon, Droplets, Utensils, Trash2, Book, Star, Search } from "lucide-react";

interface LogListProps {
    selectedDate: Date;
}

export default function LogList({ selectedDate }: LogListProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const logs = useLiveQuery(async () => {
        const start = new Date(selectedDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(selectedDate);
        end.setHours(23, 59, 59, 999);

        return await db.logs
            .where('date')
            .between(start, end, true, true)
            .reverse()
            .toArray();
    }, [selectedDate]);

    const filteredLogs = logs?.filter(log => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            log.food?.toLowerCase().includes(query) ||
            log.journal?.toLowerCase().includes(query) ||
            log.custom?.some(c => c.name.toLowerCase().includes(query))
        );
    });

    if (!logs || logs.length === 0) {
        return (
            <div className="text-center py-10 text-muted">
                <p>No logs yet. Start tracking!</p>
            </div>
        );
    }

    const getIcon = (log: any) => {
        if (log.work) return <Briefcase className="w-5 h-5 text-green-500" />;
        if (log.sleep) return <Moon className="w-5 h-5 text-purple-500" />;
        if (log.water) return <Droplets className="w-5 h-5 text-blue-500" />;
        if (log.food) return <Utensils className="w-5 h-5 text-orange-500" />;
        if (log.journal) return <Book className="w-5 h-5 text-pink-500" />;
        if (log.custom) return <Star className="w-5 h-5 text-gray-500" />;
        return null;
    };

    const getText = (log: any) => {
        if (log.work) return `Work: ${log.work}h`;
        if (log.sleep) return `Sleep: ${log.sleep}h`;
        if (log.water) return `Water: ${log.water} glasses`;
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
                        key={log.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-card p-4 rounded-2xl shadow-sm border border-border/50 flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-secondary rounded-full">
                                {getIcon(log)}
                            </div>
                            <span className="font-medium">{getText(log)}</span>
                        </div>
                        <button
                            onClick={() => {
                                if (log.id) db.logs.delete(log.id);
                            }}
                            className="p-2 text-muted hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
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
