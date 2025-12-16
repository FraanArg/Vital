"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Moon, TrendingDown, TrendingUp, Check, AlertTriangle } from "lucide-react";
import { InsightCard } from "./ui/InsightCard";

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
            variant: "success" as const,
            statusIcon: <TrendingUp className="w-3 h-3" />,
            message: `${Math.abs(data.debt)}h ahead this week! 🌟`,
        },
        on_track: {
            variant: "success" as const,
            statusIcon: <Check className="w-3 h-3" />,
            message: "You're on track! 💤",
        },
        slight_debt: {
            variant: "warning" as const,
            statusIcon: <TrendingDown className="w-3 h-3" />,
            message: `${data.debt}h behind this week`,
        },
        significant_debt: {
            variant: "danger" as const,
            statusIcon: <AlertTriangle className="w-3 h-3" />,
            message: `${data.debt}h behind this week`,
        },
    };

    const config = statusConfig[data.status];
    const progress = Math.min(100, (data.actualTotal / data.targetTotal) * 100);

    return (
        <InsightCard
            icon={<Moon className="w-5 h-5" />}
            title="Sleep Debt"
            description={config.message}
            variant={config.variant}
            value={`${data.actualTotal}h`}
            subValue={`/ ${data.targetTotal}h target`}
            progress={progress}
            delay={0.1}
        />
    );
}
