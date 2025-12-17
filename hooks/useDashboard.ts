"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

/**
 * OPTIMIZED Dashboard Data Hook
 * 
 * Fetches all dashboard data in ONE Convex query instead of 12+.
 * This reduces bandwidth by ~90% by:
 * 1. Consolidating queries
 * 2. Server-side aggregation (sending totals, not raw logs)
 * 3. Pre-calculated sparklines and comparisons
 */
export function useDashboard(selectedDate: Date) {
    const data = useQuery(api.dashboard.getDashboardData, {
        date: selectedDate.toISOString(),
    });

    return {
        isLoading: data === undefined,
        goals: data?.goals ?? null,
        todayTotals: data?.todayTotals ?? null,
        sparklineData: data?.sparklineData ?? null,
        comparison: data?.comparison ?? null,
        streak: data?.streak ?? null,
        todayLogIds: data?.todayLogIds ?? [],
    };
}
