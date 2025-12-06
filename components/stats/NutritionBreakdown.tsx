"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const COLORS: Record<string, string> = {
    Protein: "bg-red-500",
    Carbs: "bg-yellow-500",
    Veggies: "bg-green-500",
    Fruits: "bg-purple-500",
    Fats: "bg-orange-500",
    Drinks: "bg-blue-500",
    Sweets: "bg-pink-500",
    Other: "bg-gray-500",
};

export default function NutritionBreakdown() {
    const data = useQuery(api.stats.getNutritionBreakdown, { days: 30 });

    if (!data || data.length === 0) return null;

    const total = data.reduce((sum, d) => sum + d.count, 0);

    return (
        <div className="bg-card rounded-2xl border border-border/50 p-5">
            <h3 className="font-semibold mb-4">Nutrition Balance</h3>

            {/* Horizontal bar */}
            <div className="h-4 rounded-full overflow-hidden flex mb-4">
                {data.map((item) => (
                    <div
                        key={item.name}
                        className={`${COLORS[item.name] || COLORS.Other}`}
                        style={{ width: `${(item.count / total) * 100}%` }}
                    />
                ))}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                {data.slice(0, 8).map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${COLORS[item.name] || COLORS.Other}`} />
                        <span className="text-muted-foreground">{item.name}</span>
                        <span className="font-medium ml-auto">{Math.round((item.count / total) * 100)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
