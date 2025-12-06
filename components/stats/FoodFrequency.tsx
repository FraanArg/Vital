"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Utensils } from "lucide-react";

export default function FoodFrequency() {
    const data = useQuery(api.stats.getFoodFrequency, { days: 30 });

    if (!data || data.length === 0) return null;

    const maxCount = Math.max(...data.map(d => d.count));

    return (
        <div className="bg-card rounded-2xl border border-border/50 p-5">
            <div className="flex items-center gap-2 mb-4">
                <Utensils className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold">Top Foods</h3>
            </div>

            <div className="space-y-2">
                {data.slice(0, 8).map((food, i) => (
                    <div key={food.name} className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-4">{i + 1}</span>
                        <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                                <span>{food.name}</span>
                                <span className="text-muted-foreground">{food.count}x</span>
                            </div>
                            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-orange-500 rounded-full"
                                    style={{ width: `${(food.count / maxCount) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
