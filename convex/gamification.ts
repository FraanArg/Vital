import { query } from "./_generated/server";
import { v } from "convex/values";

export const getStreak = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { currentStreak: 0, longestStreak: 0 };

        // Fetch all logs for the user, sorted by date descending
        const logs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) => q.eq("userId", identity.subject))
            .order("desc")
            .collect();

        if (logs.length === 0) return { currentStreak: 0, longestStreak: 0 };

        // Extract unique dates (YYYY-MM-DD)
        const uniqueDates = Array.from(new Set(logs.map(l => l.date.split('T')[0]))).sort((a, b) => b.localeCompare(a));

        if (uniqueDates.length === 0) return { currentStreak: 0, longestStreak: 0 };

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // Check if streak is active (logged today or yesterday)
        const lastLogDate = uniqueDates[0];
        if (lastLogDate !== today && lastLogDate !== yesterday) {
            return { currentStreak: 0, longestStreak: calculateLongestStreak(uniqueDates) };
        }

        let currentStreak = 0;
        let currentDate = new Date(lastLogDate);

        // Calculate current streak
        for (const dateStr of uniqueDates) {
            const date = new Date(dateStr);
            // Check if this date is consecutive to the previous one checked (or the first one)
            // We need to handle the first iteration separately or just compare dates

            // Actually, simpler approach:
            // 1. Convert all unique dates to timestamps/days
            // 2. Iterate and check if diff is 1 day
        }

        // Re-implementing simpler logic
        let streak = 1;
        let prevDate = new Date(uniqueDates[0]);

        for (let i = 1; i < uniqueDates.length; i++) {
            const currDate = new Date(uniqueDates[i]);
            const diffTime = Math.abs(prevDate.getTime() - currDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                streak++;
                prevDate = currDate;
            } else {
                break;
            }
        }

        return {
            currentStreak: streak,
            longestStreak: calculateLongestStreak(uniqueDates)
        };
    },
});

function calculateLongestStreak(dates: string[]): number {
    if (dates.length === 0) return 0;
    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 0; i < dates.length - 1; i++) {
        const d1 = new Date(dates[i]);
        const d2 = new Date(dates[i + 1]);
        const diffTime = Math.abs(d1.getTime() - d2.getTime());
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            currentStreak++;
        } else {
            maxStreak = Math.max(maxStreak, currentStreak);
            currentStreak = 1;
        }
    }
    return Math.max(maxStreak, currentStreak);
}
