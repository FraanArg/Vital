"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { startOfDay, endOfDay } from "date-fns";
import { motion } from "framer-motion";
import { Coffee, Droplets, Dumbbell, Utensils, Check } from "lucide-react";
import { useHaptic } from "../hooks/useHaptic";
import { useToast } from "./ui/ToastContext";

interface QuickAction {
    id: string;
    icon: React.ReactNode;
    label: string;
    color: string;
    completedColor?: string;
    isComplete?: boolean;
    action: () => Promise<void>;
}

interface QuickAddRowProps {
    selectedDate: Date;
    onTrackerOpen?: (trackerId: string) => void;
}

/**
 * Apple Fitness+ style horizontal scrolling quick actions
 * One-tap common logging actions
 * Hides/modifies actions when goals are met
 */
export function QuickAddRow({ selectedDate, onTrackerOpen }: QuickAddRowProps) {
    const createLog = useMutation(api.logs.createLog);
    const { trigger } = useHaptic();
    const { toast } = useToast();

    // Get today's logs to check goal completion
    const todayLogs = useQuery(api.logs.getStats, {
        from: startOfDay(selectedDate).toISOString(),
        to: endOfDay(selectedDate).toISOString(),
    });

    const goals = useQuery(api.userProfile.getGoals);

    // Calculate current totals
    const totals = todayLogs?.reduce((acc, log) => ({
        water: acc.water + (log.water || 0),
        exercise: acc.exercise + (log.exercise?.duration || 0),
        meals: acc.meals + (log.meal ? 1 : 0),
    }), { water: 0, exercise: 0, meals: 0 }) ?? { water: 0, exercise: 0, meals: 0 };

    const waterGoalMet = goals ? totals.water >= goals.goalWater : false;
    const exerciseGoalMet = goals ? totals.exercise >= goals.goalExercise : false;
    const mealsGoalMet = goals ? totals.meals >= goals.goalMeals : false;

    const quickActions: QuickAction[] = [
        // Only show water buttons if goal not met
        ...(!waterGoalMet ? [
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
        ] : [
            // Show "Water ✓" when goal met
            {
                id: "water-done",
                icon: <Check className="w-4 h-4" />,
                label: "Water ✓",
                color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 opacity-60",
                isComplete: true,
                action: async () => {
                    toast("Water goal already met! 💧✓", "info");
                },
            },
        ]),
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
        // Only show walk if exercise goal not met
        ...(!exerciseGoalMet ? [
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
        ] : []),
        // Only show Log Meal if meals goal not met
        ...(!mealsGoalMet ? [
            {
                id: "meal",
                icon: <Utensils className="w-4 h-4" />,
                label: "Log Meal",
                color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
                action: async () => {
                    onTrackerOpen?.("food");
                },
            },
        ] : []),
    ];

    const handleClick = async (action: QuickAction) => {
        trigger("light");
        try {
            await action.action();
        } catch (error) {
            toast("Failed to add", "error");
        }
    };

    // If all goals met, show minimal row
    if (waterGoalMet && exerciseGoalMet && mealsGoalMet) {
        return (
            <div className="flex items-center gap-2 py-2">
                <span className="text-xs font-medium text-emerald-500 flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    All daily goals complete!
                </span>
            </div>
        );
    }

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
                        disabled={action.isComplete}
                        className={`
                            shrink-0 inline-flex items-center gap-1.5 
                            px-3 py-1.5 rounded-full text-xs font-semibold
                            border transition-all hover:scale-105
                            ${action.isComplete ? 'cursor-default' : ''}
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
