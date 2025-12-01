import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const exportData = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        // Fetch ALL logs for the user
        const logs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) => q.eq("userId", identity.subject))
            .collect();

        return logs;
    },
});

export const importData = mutation({
    args: {
        logs: v.array(v.any()), // Accepting any for now, will validate inside or trust the structure
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        let importedCount = 0;

        for (const log of args.logs) {
            // Basic validation: must have a date
            if (!log.date) continue;

            // Check if log already exists for this date
            const existing = await ctx.db
                .query("logs")
                .withIndex("by_userId_date", (q) =>
                    q.eq("userId", identity.subject).eq("date", log.date)
                )
                .first();

            if (existing) {
                // Update existing log
                await ctx.db.patch(existing._id, {
                    water: log.water,
                    sleep: log.sleep,
                    mood: log.mood,
                    exercise: log.exercise,
                    food: log.food, // Assuming food is a string or object depending on schema
                    meal: log.meal,
                    // Don't overwrite userId or _id
                });
            } else {
                // Insert new log
                await ctx.db.insert("logs", {
                    userId: identity.subject,
                    date: log.date,
                    water: log.water,
                    sleep: log.sleep,
                    mood: log.mood,
                    exercise: log.exercise,
                    food: log.food,
                    meal: log.meal,
                });
            }
            importedCount++;
        }

        return { success: true, count: importedCount };
    },
});
