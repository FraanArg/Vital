"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Droplets, Moon, Dumbbell, Utensils } from "lucide-react";
import { InsightCard } from "./ui/InsightCard";
import { QuickWaterAdd } from "./QuickWaterAdd";

interface Reminder {
    icon: string;
    title: string;
    message: string;
    priority: "high" | "medium" | "low";
}

interface SmartRemindersProps {
    selectedDate: Date;
}

const PRIORITY_VARIANT = {
    high: "danger",
    medium: "warning",
    low: "info",
} as const;

// Map emoji icons to Lucide components
const ICON_MAP: Record<string, React.ReactNode> = {
    "💧": <Droplets className="w-5 h-5" />,
    "😴": <Moon className="w-5 h-5" />,
    "🏃": <Dumbbell className="w-5 h-5" />,
    "🍎": <Utensils className="w-5 h-5" />,
};

export default function SmartReminders({ selectedDate }: SmartRemindersProps) {
    const reminders = useQuery(api.stats.getSmartReminders) as Reminder[] | undefined;

    if (!reminders || reminders.length === 0) return null;

    return (
        <div className="space-y-2">
            {reminders.map((reminder, i) => {
                const isHydrationReminder = reminder.icon === "💧";

                return (
                    <InsightCard
                        key={reminder.title}
                        icon={ICON_MAP[reminder.icon] || <span className="text-xl">{reminder.icon}</span>}
                        title={reminder.title}
                        description={reminder.message}
                        variant={PRIORITY_VARIANT[reminder.priority]}
                        delay={i * 0.1}
                    >
                        {/* Quick water buttons for hydration reminders */}
                        {isHydrationReminder && (
                            <QuickWaterAdd selectedDate={selectedDate} className="mt-3" />
                        )}
                    </InsightCard>
                );
            })}
        </div>
    );
}
