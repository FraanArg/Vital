"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Moon, Clock, TrendingUp, Sparkles } from "lucide-react";

export default function SleepAnalysis() {
    const data = useQuery(api.stats.getSleepAnalysis, { days: 30 });

    if (!data) return null;

    const stats = [
        { icon: Moon, label: "Avg Duration", value: `${data.avgDuration}h`, color: "text-indigo-500", bg: "from-indigo-500/10 to-indigo-500/5", border: "border-indigo-500/20" },
        { icon: Sparkles, label: "Consistency", value: `${data.consistency}%`, color: "text-green-500", bg: "from-green-500/10 to-green-500/5", border: "border-green-500/20", badge: data.consistency >= 70 ? "Good" : "Fair", badgeColor: data.consistency >= 70 ? "text-green-500" : "text-yellow-500" },
        { icon: TrendingUp, label: "Best Night", value: `${data.bestSleep}h`, color: "text-blue-500", bg: "from-blue-500/10 to-blue-500/5", border: "border-blue-500/20" },
        ...(data.avgBedtime ? [{ icon: Clock, label: "Avg Bedtime", value: data.avgBedtime, color: "text-purple-500", bg: "from-purple-500/10 to-purple-500/5", border: "border-purple-500/20" }] : []),
    ];

    return (
        <div className="bg-card rounded-2xl border border-border/50 p-5">
            <div className="flex items-center gap-2 mb-4">
                <Moon className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold">Sleep Analysis</h3>
                <span className="text-xs text-muted-foreground ml-auto">{data.totalNights} nights</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`text-center p-4 bg-gradient-to-br ${stat.bg} border ${stat.border} rounded-xl hover:scale-105 transition-transform`}
                        >
                            <Icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className="text-xs text-muted-foreground">{stat.label}</div>
                            {stat.badge && (
                                <div className={`text-xs font-medium mt-1 ${stat.badgeColor}`}>{stat.badge}</div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
