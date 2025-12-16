"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion } from "framer-motion";
import { Coffee, Droplets, Dumbbell, Utensils } from "lucide-react";
import { useHaptic } from "../hooks/useHaptic";
import { useToast } from "./ui/ToastContext";

interface QuickAction {
    id: string;
    icon: React.ReactNode;
    label: string;
    color: string;
    action: () => Promise<void>;
}

interface QuickAddRowProps {
    selectedDate: Date;
    onTrackerOpen?: (trackerId: string) => void;
}

/**
 * Apple Fitness+ style horizontal scrolling quick actions
 * One-tap common logging actions
 */
export function QuickAddRow({ selectedDate, onTrackerOpen }: QuickAddRowProps) {
    const createLog = useMutation(api.logs.createLog);
    const { trigger } = useHaptic();
    const { toast } = useToast();

    const quickActions: QuickAction[] = [
        {
            id: "water-250",
            icon: <Droplets className="w-4 h-4" />,
            label: "+250ml",
            color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
            action: async () => {
                await createLog({ water: 250, date: selectedDate.toISOString() });
                toast("Added 250ml water 💧", "success");
            },
        },
        {
            id: "water-500",
            icon: <Droplets className="w-4 h-4" />,
            label: "+500ml",
            color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
            action: async () => {
                await createLog({ water: 500, date: selectedDate.toISOString() });
                toast("Added 500ml water 💧", "success");
            },
        },
        {
            id: "coffee",
            icon: <Coffee className="w-4 h-4" />,
            label: "Coffee ☕",
            color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
            action: async () => {
                await createLog({
                    meal: { type: "snack", items: ["Coffee"], time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) },
                    date: selectedDate.toISOString()
                });
                toast("Coffee logged ☕", "success");
            },
        },
        {
            id: "walk",
            icon: <Dumbbell className="w-4 h-4" />,
            label: "15min Walk",
            color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
            action: async () => {
                await createLog({
                    exercise: { type: "Walking", duration: 15, intensity: "low" },
                    date: selectedDate.toISOString()
                });
                toast("15min walk logged 🚶", "success");
            },
        },
        {
            id: "meal",
            icon: <Utensils className="w-4 h-4" />,
            label: "Log Meal",
            color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
            action: async () => {
                onTrackerOpen?.("food");
            },
        },
    ];

    const handleClick = async (action: QuickAction) => {
        trigger("light");
        try {
            await action.action();
        } catch (error) {
            toast("Failed to add", "error");
        }
    };

    return (
        <div className="overflow-x-auto -mx-4 px-4 py-2 scrollbar-hide">
            <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground shrink-0">
                    Quick Add:
                </span>
                {quickActions.map((action, index) => (
                    <motion.button
                        key={action.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleClick(action)}
                        className={`
                            shrink-0 inline-flex items-center gap-1.5 
                            px-3 py-1.5 rounded-full text-xs font-semibold
                            border transition-all hover:scale-105
                            ${action.color}
                        `}
                    >
                        {action.icon}
                        {action.label}
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
