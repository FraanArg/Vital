"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion } from "framer-motion";
import { Target, Moon, Droplets, Dumbbell, Utensils, Briefcase, Save } from "lucide-react";
import { Skeleton } from "./ui/Skeleton";
import { useToast } from "./ui/ToastContext";

interface Goal {
    id: string;
    label: string;
    key: keyof Goals;
    unit: string;
    icon: React.ElementType;
    color: string;
    min: number;
    max: number;
    step: number;
}

interface Goals {
    goalSleep: number;
    goalWater: number;
    goalExercise: number;
    goalMeals: number;
    goalWork: number;
}

const GOAL_CONFIG: Goal[] = [
    { id: "sleep", label: "Sleep", key: "goalSleep", unit: "hours", icon: Moon, color: "text-indigo-500", min: 4, max: 12, step: 0.5 },
    { id: "water", label: "Water", key: "goalWater", unit: "ml", icon: Droplets, color: "text-blue-500", min: 500, max: 5000, step: 250 },
    { id: "exercise", label: "Exercise", key: "goalExercise", unit: "min", icon: Dumbbell, color: "text-emerald-500", min: 10, max: 120, step: 5 },
    { id: "meals", label: "Meals", key: "goalMeals", unit: "meals", icon: Utensils, color: "text-orange-500", min: 1, max: 6, step: 1 },
    { id: "work", label: "Work", key: "goalWork", unit: "hours", icon: Briefcase, color: "text-green-500", min: 0, max: 16, step: 0.5 },
];

export default function GoalSettings() {
    const existingGoals = useQuery(api.userProfile.getGoals);
    const updateProfile = useMutation(api.userProfile.upsert);
    const { toast } = useToast();

    const [goals, setGoals] = useState<Goals>({
        goalSleep: 8,
        goalWater: 2000,
        goalExercise: 30,
        goalMeals: 3,
        goalWork: 8,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (existingGoals) {
            setGoals(existingGoals);
        }
    }, [existingGoals]);

    const handleChange = (key: keyof Goals, value: number) => {
        setGoals(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateProfile(goals);
            toast("Goals saved!", "success");
            setHasChanges(false);
        } catch (error) {
            toast("Failed to save goals", "error");
        }
        setIsSaving(false);
    };

    if (!existingGoals) {
        return (
            <div className="bg-card rounded-2xl border border-border/50 p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <Skeleton key={i} className="h-16 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-2xl border border-border/50 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-primary/10">
                    <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h3 className="font-semibold">Daily Goals</h3>
                    <p className="text-xs text-muted-foreground">Customize your daily targets</p>
                </div>
            </div>

            <div className="space-y-4">
                {GOAL_CONFIG.map((goal, index) => {
                    const Icon = goal.icon;
                    const value = goals[goal.key];

                    return (
                        <motion.div
                            key={goal.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30"
                        >
                            <div className={`p-2 rounded-lg bg-secondary ${goal.color}`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <label className="text-sm font-medium">{goal.label}</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <input
                                        type="range"
                                        min={goal.min}
                                        max={goal.max}
                                        step={goal.step}
                                        value={value}
                                        onChange={(e) => handleChange(goal.key, Number(e.target.value))}
                                        className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                    <span className="text-sm font-medium tabular-nums w-20 text-right">
                                        {value} {goal.unit}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {hasChanges && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                >
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? "Saving..." : "Save Goals"}
                    </button>
                </motion.div>
            )}
        </div>
    );
}
