"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Apple, Check, AlertCircle, Minus } from "lucide-react";

export default function DailyNutrientBalance() {
    const data = useQuery(api.stats.getDailyNutrientBalance, {});

    if (!data || data.totalItems === 0) return null;

    const statusColors = {
        good: "text-green-500 bg-green-500/10 border-green-500/20",
        low: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
        missing: "text-red-500 bg-red-500/10 border-red-500/20",
        high: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    };

    const statusIcons = {
        good: Check,
        low: Minus,
        missing: AlertCircle,
        high: AlertCircle,
    };

    return (
        <div className="bg-card rounded-2xl border border-border/50 p-5">
            <div className="flex items-center gap-2 mb-4">
                <Apple className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold">Today&apos;s Nutrients</h3>
                <span className="text-xs text-muted-foreground ml-auto">{data.mealsLogged} meals</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {data.nutrients.map((nutrient, i) => {
                    const StatusIcon = statusIcons[nutrient.status as keyof typeof statusIcons] || Check;
                    const colorClass = statusColors[nutrient.status as keyof typeof statusColors] || statusColors.good;

                    return (
                        <motion.div
                            key={nutrient.category}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.03 }}
                            className={`text-center p-3 rounded-xl border ${colorClass} hover:scale-105 transition-transform`}
                        >
                            <div className="text-2xl mb-1">{nutrient.emoji}</div>
                            <div className="text-lg font-bold">{nutrient.count}</div>
                            <div className="text-[10px] text-muted-foreground">{nutrient.category}</div>
                            <StatusIcon className="w-3 h-3 mx-auto mt-1" />
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-3 text-xs text-center text-muted-foreground">
                {data.nutrients.filter(n => n.status === "good").length >= 5
                    ? "✨ Great nutrient variety today!"
                    : data.nutrients.filter(n => n.status === "missing").length >= 3
                        ? "Try adding more variety to your meals"
                        : "Keep logging to see your full nutrient balance"}
            </div>
        </div>
    );
}
