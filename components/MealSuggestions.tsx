"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion } from "framer-motion";
import { Utensils, Clock, Leaf, RefreshCw } from "lucide-react";

interface MealSuggestion {
    icon: string;
    title: string;
    message: string;
    type: "nutrient" | "timing" | "variety";
    foods?: string[];
}

export default function MealSuggestions() {
    const suggestions = useQuery(api.stats.getMealSuggestions) as MealSuggestion[] | undefined;

    if (!suggestions || suggestions.length === 0) return null;

    const typeStyles = {
        nutrient: "from-orange-500/10 to-orange-500/5 border-orange-500/20",
        timing: "from-blue-500/10 to-blue-500/5 border-blue-500/20",
        variety: "from-purple-500/10 to-purple-500/5 border-purple-500/20",
    };

    const typeIcons = {
        nutrient: <Leaf className="w-4 h-4 text-orange-500" />,
        timing: <Clock className="w-4 h-4 text-blue-500" />,
        variety: <RefreshCw className="w-4 h-4 text-purple-500" />,
    };

    return (
        <div className="bg-card rounded-2xl border border-border/50 p-5">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                    <Utensils className="w-5 h-5 text-green-500" />
                </div>
                <div>
                    <h3 className="font-semibold">Meal Ideas</h3>
                    <p className="text-xs text-muted-foreground">Personalized suggestions</p>
                </div>
            </div>

            <div className="space-y-3">
                {suggestions.map((suggestion, i) => (
                    <motion.div
                        key={suggestion.title}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`bg-gradient-to-r ${typeStyles[suggestion.type]} border p-4 rounded-xl`}
                    >
                        <div className="flex items-start gap-3">
                            <span className="text-2xl shrink-0">{suggestion.icon}</span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-sm">{suggestion.title}</h4>
                                    {typeIcons[suggestion.type]}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                                    {suggestion.message}
                                </p>
                                {suggestion.foods && suggestion.foods.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {suggestion.foods.map((food) => (
                                            <span
                                                key={food}
                                                className="px-2 py-0.5 text-[10px] bg-background/50 rounded-full border border-border/50"
                                            >
                                                {food}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
