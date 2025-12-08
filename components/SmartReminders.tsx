"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion } from "framer-motion";
import { Bell, Clock } from "lucide-react";

interface Reminder {
    icon: string;
    title: string;
    message: string;
    priority: "high" | "medium" | "low";
}

export default function SmartReminders() {
    const reminders = useQuery(api.stats.getSmartReminders) as Reminder[] | undefined;

    if (!reminders || reminders.length === 0) return null;

    const priorityStyles = {
        high: "from-red-500/10 to-red-500/5 border-red-500/30 border-l-red-500",
        medium: "from-yellow-500/10 to-yellow-500/5 border-yellow-500/30 border-l-yellow-500",
        low: "from-blue-500/10 to-blue-500/5 border-blue-500/30 border-l-blue-500",
    };

    return (
        <div className="space-y-2">
            {reminders.map((reminder, i) => (
                <motion.div
                    key={reminder.title}
                    initial={{ opacity: 0, y: -5, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`bg-gradient-to-r ${priorityStyles[reminder.priority]} border border-l-4 p-3 rounded-lg flex items-center gap-3`}
                >
                    <span className="text-xl">{reminder.icon}</span>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{reminder.title}</h4>
                        <p className="text-xs text-muted-foreground truncate">{reminder.message}</p>
                    </div>
                    <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                </motion.div>
            ))}
        </div>
    );
}
