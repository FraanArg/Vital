"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Utensils } from "lucide-react";

const COLORS: Record<string, { bg: string; text: string }> = {
    Protein: { bg: "bg-red-500", text: "text-red-500" },
    Carbs: { bg: "bg-yellow-500", text: "text-yellow-500" },
    Veggies: { bg: "bg-green-500", text: "text-green-500" },
    Fruits: { bg: "bg-purple-500", text: "text-purple-500" },
    Fats: { bg: "bg-orange-500", text: "text-orange-500" },
    Drinks: { bg: "bg-blue-500", text: "text-blue-500" },
    Sweets: { bg: "bg-pink-500", text: "text-pink-500" },
    Other: { bg: "bg-gray-500", text: "text-gray-500" },
};

export default function NutritionBreakdown() {
    const data = useQuery(api.stats.getNutritionBreakdown, { days: 30 });

    if (!data || data.length === 0) return null;

    const total = data.reduce((sum, d) => sum + d.count, 0);

    return (
        <div className="bg-card rounded-2xl border border-border/50 p-5">
            <div className="flex items-center gap-2 mb-4">
                <Utensils className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold">Nutrition Balance</h3>
                <span className="text-xs text-muted-foreground ml-auto">{total} items</span>
            </div>

            {/* Animated horizontal bar */}
            <div className="h-4 rounded-full overflow-hidden flex mb-4 bg-secondary">
                {data.map((item, i) => {
                    const color = COLORS[item.name] || COLORS.Other;
                    return (
                        <motion.div
                            key={item.name}
                            className={`${color.bg} first:rounded-l-full last:rounded-r-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.count / total) * 100}%` }}
                            transition={{ duration: 0.6, delay: i * 0.05 }}
                        />
                    );
                })}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                {data.slice(0, 8).map((item, i) => {
                    const color = COLORS[item.name] || COLORS.Other;
                    const percent = Math.round((item.count / total) * 100);
                    return (
                        <motion.div
                            key={item.name}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                        >
                            <div className={`w-3 h-3 rounded-full ${color.bg}`} />
                            <span className="text-muted-foreground flex-1">{item.name}</span>
                            <span className="font-medium">{percent}%</span>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
