import { query } from "./_generated/server";
import { v } from "convex/values";

export const generateReport = query({
    args: {
        startDate: v.string(),
        endDate: v.string(),
        types: v.array(v.string()), // "food", "water", "exercise"
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const start = new Date(args.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(args.endDate);
        end.setHours(23, 59, 59, 999);

        const logs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) =>
                q
                    .eq("userId", identity.subject)
                    .gte("date", start.toISOString())
                    .lte("date", end.toISOString())
            )
            .collect();

        // Group by date
        const groupedLogs: Record<string, any> = {};

        // Initialize all dates in range
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            groupedLogs[dateStr] = {
                date: dateStr,
                food: [],
                water: 0,
                exercise: [],
            };
        }

        logs.forEach((log) => {
            const dateStr = log.date.split('T')[0];
            if (!groupedLogs[dateStr]) return;

            if (args.types.includes("food") && log.meal) {
                groupedLogs[dateStr].food.push(log.meal);
            }
            if (args.types.includes("water") && log.water) {
                groupedLogs[dateStr].water += log.water;
            }
            if (args.types.includes("exercise") && log.exercise) {
                groupedLogs[dateStr].exercise.push(log.exercise);
            }
            // Always include context data if available
            if (log.sleep) groupedLogs[dateStr].sleep = log.sleep;
            if (log.mood) groupedLogs[dateStr].mood = log.mood;
        });

        // Convert to array and sort by date
        return Object.values(groupedLogs).sort((a, b) => a.date.localeCompare(b.date));
    },
});
