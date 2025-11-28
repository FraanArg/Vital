"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { motion, AnimatePresence } from "framer-motion";
import { Battery, Moon, Droplets, Utensils, Trash2 } from "lucide-react";

export default function LogList() {
    const logs = useLiveQuery(() => db.logs.orderBy("date").reverse().toArray());

    if (!logs || logs.length === 0) {
        return (
            <div className="text-center py-10 text-muted">
                <p>No logs yet. Start tracking!</p>
            </div>
        );
    }

    const getIcon = (log: any) => {
        if (log.mood) return <Battery className="w-5 h-5 text-green-500" />;
        if (log.sleep) return <Moon className="w-5 h-5 text-purple-500" />;
        if (log.water) return <Droplets className="w-5 h-5 text-blue-500" />;
        if (log.food) return <Utensils className="w-5 h-5 text-orange-500" />;
        return null;
    };

    const getText = (log: any) => {
        if (log.mood) return `Mood: ${log.mood}/5`;
        if (log.sleep) return `Sleep: ${log.sleep}h`;
        if (log.water) return `Water: ${log.water} glasses`;
        if (log.food) return `Food: ${log.food}`;
        return "Unknown Log";
    };

    return (
        <div className="space-y-3">
            <AnimatePresence initial={false}>
                {logs.map((log) => (
                    <motion.div
                        key={log.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        layout
                        className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/50 shadow-sm"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-secondary rounded-full">
                                {getIcon(log)}
                            </div>
                            <div>
                                <p className="font-medium">{getText(log)}</p>
                                <p className="text-xs text-muted">
                                    {log.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => log.id && db.logs.delete(log.id)}
                            className="p-2 text-muted hover:text-red-500 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
