import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getExercises = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        // Get system defaults (userId is null/undefined)
        // Note: In Convex, we might need a specific query for "system" exercises if userId is indexed.
        // For now, let's assume we fetch all and filter, or use a separate index.
        // Actually, let's fetch system defaults + user's custom exercises.

        const systemExercises = await ctx.db
            .query("exercises")
            .filter(q => q.eq(q.field("userId"), undefined))
            .collect();

        const userExercises = await ctx.db
            .query("exercises")
            .withIndex("by_user", q => q.eq("userId", identity.subject))
            .collect();

        return [...systemExercises, ...userExercises].sort((a, b) => a.name.localeCompare(b.name));
    },
});

export const createExercise = mutation({
    args: {
        name: v.string(),
        muscle: v.string(),
        category: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        return await ctx.db.insert("exercises", {
            ...args,
            userId: identity.subject,
        });
    },
});

export const seedDefaults = mutation({
    args: {},
    handler: async (ctx) => {
        const defaults = [
            // Chest
            { name: "Bench Press (Barbell)", muscle: "Chest", category: "Barbell" },
            { name: "Bench Press (Dumbbell)", muscle: "Chest", category: "Dumbbell" },
            { name: "Incline Bench Press (Barbell)", muscle: "Chest", category: "Barbell" },
            { name: "Incline Bench Press (Dumbbell)", muscle: "Chest", category: "Dumbbell" },
            { name: "Chest Fly", muscle: "Chest", category: "Machine" },
            { name: "Push Up", muscle: "Chest", category: "Bodyweight" },

            // Back
            { name: "Deadlift", muscle: "Back", category: "Barbell" },
            { name: "Pull Up", muscle: "Back", category: "Bodyweight" },
            { name: "Lat Pulldown", muscle: "Back", category: "Cable" },
            { name: "Seated Row", muscle: "Back", category: "Cable" },
            { name: "Bent Over Row", muscle: "Back", category: "Barbell" },

            // Legs
            { name: "Squat (Barbell)", muscle: "Legs", category: "Barbell" },
            { name: "Leg Press", muscle: "Legs", category: "Machine" },
            { name: "Lunges", muscle: "Legs", category: "Dumbbell" },
            { name: "Leg Extension", muscle: "Legs", category: "Machine" },
            { name: "Leg Curl", muscle: "Legs", category: "Machine" },
            { name: "Calf Raise", muscle: "Legs", category: "Machine" },

            // Shoulders
            { name: "Overhead Press (Barbell)", muscle: "Shoulders", category: "Barbell" },
            { name: "Overhead Press (Dumbbell)", muscle: "Shoulders", category: "Dumbbell" },
            { name: "Lateral Raise", muscle: "Shoulders", category: "Dumbbell" },
            { name: "Face Pull", muscle: "Shoulders", category: "Cable" },

            // Arms
            { name: "Bicep Curl (Barbell)", muscle: "Arms", category: "Barbell" },
            { name: "Bicep Curl (Dumbbell)", muscle: "Arms", category: "Dumbbell" },
            { name: "Tricep Extension", muscle: "Arms", category: "Cable" },
            { name: "Skullcrusher", muscle: "Arms", category: "Barbell" },
            { name: "Dips", muscle: "Arms", category: "Bodyweight" },

            // Core
            { name: "Plank", muscle: "Core", category: "Bodyweight" },
            { name: "Crunch", muscle: "Core", category: "Bodyweight" },
            { name: "Leg Raise", muscle: "Core", category: "Bodyweight" },
        ];

        // Check if defaults already exist to avoid duplicates
        // This is a naive check, ideally we'd check one by one or use a flag, 
        // but for a dev tool this is fine.
        const existing = await ctx.db.query("exercises").filter(q => q.eq(q.field("userId"), undefined)).first();
        if (existing) return "Defaults already seeded";

        for (const ex of defaults) {
            await ctx.db.insert("exercises", ex);
        }

        return "Seeded " + defaults.length + " exercises";
    },
});
