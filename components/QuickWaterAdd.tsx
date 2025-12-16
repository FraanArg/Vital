"use client";

import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion } from "framer-motion";
import { useHaptic } from "../hooks/useHaptic";
import { useToast } from "./ui/ToastContext";

const QUICK_ADD_OPTIONS = [
    { amount: 250, label: "+250ml" },
    { amount: 500, label: "+500ml" },
    { amount: 1000, label: "+1L" },
];

interface QuickWaterAddProps {
    selectedDate: Date;
    className?: string;
}

/**
 * Quick add water buttons (MyFitnessPal style)
 * One-tap water logging without opening modal
 */
export function QuickWaterAdd({ selectedDate, className }: QuickWaterAddProps) {
    const createLog = useMutation(api.logs.createLog);
    const { trigger } = useHaptic();
    const { toast } = useToast();

    const handleQuickAdd = async (amount: number) => {
        trigger("light");

        try {
            await createLog({
                water: amount,
                date: selectedDate.toISOString(),
            });
            toast(`Added ${amount}ml water 💧`, "success");
        } catch (error) {
            toast("Failed to add water", "error");
        }
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {QUICK_ADD_OPTIONS.map((option, index) => (
                <motion.button
                    key={option.amount}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickAdd(option.amount)}
                    className="
                        px-3 py-1.5 rounded-full text-xs font-semibold
                        bg-blue-500/10 text-blue-600 dark:text-blue-400
                        border border-blue-500/20
                        hover:bg-blue-500/20 active:bg-blue-500/30
                        transition-colors
                    "
                >
                    {option.label}
                </motion.button>
            ))}
        </div>
    );
}
