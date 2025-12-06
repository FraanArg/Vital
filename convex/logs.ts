import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createLog = mutation({
    args: {
        mood: v.optional(v.number()),
        work: v.optional(v.number()),
        sleep: v.optional(v.number()),
        sleep_start: v.optional(v.string()),
        sleep_end: v.optional(v.string()),
        water: v.optional(v.number()),
        food: v.optional(v.string()),
        meal: v.optional(v.object({
            type: v.string(),
            items: v.array(v.string()),
            time: v.string(),
        })),
        exercise: v.optional(v.object({
            type: v.string(),
            duration: v.number(),
            distance: v.optional(v.number()),
            intensity: v.optional(v.union(v.literal("low"), v.literal("mid"), v.literal("high"))),
            workout: v.optional(v.array(v.object({
                name: v.string(),
                sets: v.array(v.object({
                    reps: v.number(),
                    weight: v.number(),
                    rpe: v.optional(v.number()),
                })),
                notes: v.optional(v.string()),
            }))),
            notes: v.optional(v.string()),
            time: v.optional(v.string()),
        })),
        journal: v.optional(v.string()),
        custom: v.optional(v.array(v.object({
            name: v.string(),
            value: v.number(),
            unit: v.string(),
        }))),
        date: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");
        const userId = identity.subject;

        await ctx.db.insert("logs", { ...args, userId });
    },
});

export const updateLog = mutation({
    args: {
        id: v.id("logs"),
        mood: v.optional(v.number()),
        work: v.optional(v.number()),
        sleep: v.optional(v.number()),
        sleep_start: v.optional(v.string()),
        sleep_end: v.optional(v.string()),
        water: v.optional(v.number()),
        food: v.optional(v.string()),
        meal: v.optional(v.object({
            type: v.string(),
            items: v.array(v.string()),
            time: v.string(),
        })),
        exercise: v.optional(v.object({
            type: v.string(),
            duration: v.number(),
            distance: v.optional(v.number()),
            intensity: v.optional(v.union(v.literal("low"), v.literal("mid"), v.literal("high"))),
            workout: v.optional(v.array(v.object({
                name: v.string(),
                sets: v.array(v.object({
                    reps: v.number(),
                    weight: v.number(),
                    rpe: v.optional(v.number()),
                })),
                notes: v.optional(v.string()),
            }))),
            notes: v.optional(v.string()),
            time: v.optional(v.string()),
        })),
        journal: v.optional(v.string()),
        custom: v.optional(v.array(v.object({
            name: v.string(),
            value: v.number(),
            unit: v.string(),
        }))),
        date: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");
        const userId = identity.subject;

        const { id, ...updates } = args;
        const existing = await ctx.db.get(id);

        if (!existing || existing.userId !== userId) {
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(id, updates);
    },
});

export const getLogs = query({
    args: {
        from: v.string(),
        to: v.string()
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];
        const userId = identity.subject;

        return await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) =>
                q.eq("userId", userId)
                    .gte("date", args.from)
                    .lte("date", args.to)
            )
            .order("desc")
            .collect();
    },
});

export const getStats = query({
    args: {
        from: v.string(),
        to: v.string()
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];
        const userId = identity.subject;

        return await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) =>
                q.eq("userId", userId)
                    .gte("date", args.from)
                    .lte("date", args.to)
            )
            .collect();
    },
});

export const deleteLog = mutation({
    args: { id: v.id("logs") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");
        const userId = identity.subject;

        const log = await ctx.db.get(args.id);
        if (!log) return; // Already deleted or doesn't exist

        if (log.userId !== userId) {
            throw new Error("Unauthorized");
        }

        await ctx.db.delete(args.id);
    },
});

export const getExerciseHistory = query({
    args: {
        exerciseName: v.string(),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];
        const userId = identity.subject;

        const logs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();

        // Filter for logs containing the exercise
        // Note: This is done in memory because we can't easily index deep into the JSON object array
        // For a larger app, we might want a separate "exerciseLogs" table
        const history = logs
            .filter(log =>
                log.exercise?.workout?.some(w => w.name === args.exerciseName)
            )
            .map(log => {
                const workout = log.exercise?.workout?.find(w => w.name === args.exerciseName);
                return {
                    date: log.date,
                    sets: workout?.sets || [],
                    notes: workout?.notes
                };
            })
            .slice(0, args.limit || 5);

        return history;
    },
});
