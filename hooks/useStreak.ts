"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useMemo } from "react";
import { subDays, startOfDay, isSameDay, addDays } from "date-fns";

interface StreakData {
    currentStreak: number;
    longestStreak: number;
    todayLogged: boolean;
    isLoading: boolean;
}

/**
 * Unified streak calculation hook
 * Handles midnight edge case: logs within 4 hours of midnight count as previous day
 */
export function useStreak(): StreakData {
    const logs = useQuery(api.logs.getStats, {
        from: subDays(new Date(), 100).toISOString(),
        to: new Date().toISOString(),
    });

    return useMemo(() => {
        if (!logs) {
            return { currentStreak: 0, longestStreak: 0, todayLogged: false, isLoading: true };
        }

        if (logs.length === 0) {
            return { currentStreak: 0, longestStreak: 0, todayLogged: false, isLoading: false };
        }

        // Get unique logged dates, handling midnight edge case
        const loggedDates = new Set<string>();

        for (const log of logs) {
            const logDate = new Date(log.date);
            const logCreated = new Date(log._creationTime);

            // If log was created between midnight and 4am, consider it as previous day
            const hour = logCreated.getHours();
            let effectiveDate = startOfDay(logDate);

            if (hour >= 0 && hour < 4) {
                // Check if the log date matches creation date (same calendar day)
                if (isSameDay(logDate, logCreated)) {
                    // This log was probably meant for "yesterday" - user logging before bed
                    effectiveDate = subDays(effectiveDate, 1);
                }
            }

            loggedDates.add(effectiveDate.toISOString().split('T')[0]);
        }

        const sortedDates = Array.from(loggedDates).sort().reverse();
        const today = startOfDay(new Date()).toISOString().split('T')[0];
        const yesterday = subDays(startOfDay(new Date()), 1).toISOString().split('T')[0];

        // Check if logged today
        const todayLogged = sortedDates.includes(today);

        // Calculate current streak
        let currentStreak = 0;
        let checkDate = todayLogged ? today : yesterday;

        for (const date of sortedDates) {
            if (date === checkDate) {
                currentStreak++;
                checkDate = subDays(new Date(checkDate), 1).toISOString().split('T')[0];
            } else if (date < checkDate) {
                break; // Gap found
            }
        }

        // If not logged today and yesterday wasn't logged either, streak is 0
        if (!todayLogged && !sortedDates.includes(yesterday)) {
            currentStreak = 0;
        }

        // Calculate longest streak
        let longestStreak = 0;
        let tempStreak = 0;
        let prevDate: string | null = null;

        for (const date of sortedDates.slice().reverse()) {
            if (!prevDate) {
                tempStreak = 1;
            } else {
                const expectedNext: string = addDays(new Date(prevDate), 1).toISOString().split('T')[0];
                if (date === expectedNext) {
                    tempStreak++;
                } else {
                    longestStreak = Math.max(longestStreak, tempStreak);
                    tempStreak = 1;
                }
            }
            prevDate = date;
        }
        longestStreak = Math.max(longestStreak, tempStreak);

        return {
            currentStreak,
            longestStreak,
            todayLogged,
            isLoading: false,
        };
    }, [logs]);
}
