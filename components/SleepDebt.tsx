"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion } from "framer-motion";
import { Moon, TrendingDown, TrendingUp, Check, AlertTriangle } from "lucide-react";

interface SleepDebtData {
    targetPerNight: number;
    targetTotal: number;
    actualTotal: number;
    debt: number;
    daysTracked: number;
    status: "on_track" | "slight_debt" | "significant_debt" | "surplus";
}

export default function SleepDebt() {
    const data = useQuery(api.stats.getSleepDebt) as SleepDebtData | null | undefined;

    if (!data) return null;

    const statusConfig = {
        surplus: {
            icon: <TrendingUp className="w-4 h-4" />,
            color: "text-green-500",
            bg: "from-green-500/10 to-green-500/5",
            border: "border-green-500/20",
            message: `${Math.abs(data.debt)}h ahead this week! 🌟`,
        },
        on_track: {
            icon: <Check className="w-4 h-4" />,
            color: "text-green-500",
            bg: "from-green-500/10 to-green-500/5",
            border: "border-green-500/20",
            message: "You're on track! 💤",
        },
        slight_debt: {
            icon: <TrendingDown className="w-4 h-4" />,
            color: "text-yellow-500",
            bg: "from-yellow-500/10 to-yellow-500/5",
            border: "border-yellow-500/20",
            message: `${data.debt}h behind this week`,
        },
        significant_debt: {
            icon: <AlertTriangle className="w-4 h-4" />,
            color: "text-red-500",
            bg: "from-red-500/10 to-red-500/5",
            border: "border-red-500/20",
            message: `${data.debt}h behind this week`,
        },
    };

    const config = statusConfig[data.status];
    const progress = Math.min(100, (data.actualTotal / data.targetTotal) * 100);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-gradient-to-r ${config.bg} border ${config.border} rounded-xl p-3`}
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-background/50 ${config.color}`}>
                    <Moon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-medium">Sleep Debt</span>
                        <span className={`${config.color}`}>{config.icon}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{config.message}</div>
                </div>
                <div className="text-right">
                    <div className="text-lg font-bold">{data.actualTotal}h</div>
                    <div className="text-[10px] text-muted-foreground">/ {data.targetTotal}h target</div>
                </div>
            </div>
            <div className="mt-2 h-1.5 bg-background/50 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className={`h-full rounded-full ${data.status === "significant_debt" ? "bg-red-500" :
                            data.status === "slight_debt" ? "bg-yellow-500" : "bg-green-500"
                        }`}
                />
            </div>
        </motion.div>
    );
}
