import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createRoutine = mutation({
    args: {
        name: v.string(),
        exercises: v.array(v.object({
            name: v.string(),
            defaultSets: v.number(),
            day: v.optional(v.string()),
            targetRpe: v.optional(v.string()),
            targetReps: v.optional(v.string()),
        }))
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");
        const userId = identity.subject;

        await ctx.db.insert("routines", { ...args, userId });
    },
});

export const getRoutines = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];
        const userId = identity.subject;

        return await ctx.db
            .query("routines")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();
    },
});

export const deleteRoutine = mutation({
    args: { id: v.id("routines") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");
        const userId = identity.subject;

        const routine = await ctx.db.get(args.id);
        if (!routine) return;

        if (routine.userId !== userId) {
            throw new Error("Unauthorized");
        }

        await ctx.db.delete(args.id);
    },
});

export const updateRoutine = mutation({
    args: {
        id: v.id("routines"),
        name: v.string(),
        exercises: v.array(v.object({
            name: v.string(),
            defaultSets: v.number(),
            day: v.optional(v.string()),
            targetRpe: v.optional(v.string()),
            targetReps: v.optional(v.string()),
        }))
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");
        const userId = identity.subject;

        const routine = await ctx.db.get(args.id);
        if (!routine) return;

        if (routine.userId !== userId) {
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(args.id, {
            name: args.name,
            exercises: args.exercises
        });
    },
});

export const seedRoutines = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");
        const userId = identity.subject;

        const routines = [
            // Routine 1
            {
                name: "Routine 1: Day 1 (Lower + Push)",
                exercises: [
                    { name: "Back Squat", defaultSets: 4 },
                    { name: "Romanian Deadlift", defaultSets: 3 },
                    { name: "Bulgarian Split Squat", defaultSets: 3 },
                    { name: "Calf Raise (Standing)", defaultSets: 4 },
                    { name: "Hanging Leg Raise", defaultSets: 3 },
                    { name: "Push Up", defaultSets: 2 },
                ]
            },
            {
                name: "Routine 1: Day 2 (Upper)",
                exercises: [
                    { name: "Bench Press (Barbell)", defaultSets: 4 },
                    { name: "Pull Up", defaultSets: 4 },
                    { name: "Incline Bench Press (Dumbbell)", defaultSets: 3 },
                    { name: "One-Arm Dumbbell Row", defaultSets: 3 },
                    { name: "Seated Dumbbell Shoulder Press", defaultSets: 3 },
                    { name: "Face Pull", defaultSets: 3 },
                    { name: "Bicep Curl (Dumbbell)", defaultSets: 3 },
                    { name: "Tricep Pressdown", defaultSets: 3 },
                ]
            },
            {
                name: "Routine 1: Day 3 (Optional Pump)",
                exercises: [
                    { name: "Box Jump", defaultSets: 3 },
                    { name: "Hip Thrust", defaultSets: 3 },
                    { name: "Leg Curl", defaultSets: 3 },
                    { name: "Lateral Raise", defaultSets: 3 },
                    { name: "Copenhagen Plank", defaultSets: 3 },
                    { name: "Calf Raise (Seated)", defaultSets: 3 },
                ]
            },

            // Routine 2
            {
                name: "Routine 2: Day 1 (Strength + Tempo)",
                exercises: [
                    { name: "Bulgarian Split Squat", defaultSets: 3 },
                    { name: "Single-Leg Hip Thrust", defaultSets: 3 },
                    { name: "Push Up", defaultSets: 4 },
                    { name: "Inverted Row", defaultSets: 4 },
                    { name: "Calf Raise (Standing)", defaultSets: 3 },
                    { name: "Hollow Body Hold", defaultSets: 3 },
                ]
            },
            {
                name: "Routine 2: Day 2 (Sprints + Upper)",
                exercises: [
                    { name: "Sprint", defaultSets: 6 },
                    { name: "Lateral Bound", defaultSets: 3 },
                    { name: "Pike Push Up", defaultSets: 3 },
                    { name: "Wide Push Up", defaultSets: 3 },
                    { name: "Backpack/Band Row", defaultSets: 3 },
                    { name: "Plank with Shoulder Taps", defaultSets: 3 },
                ]
            },

            // Routine 3
            {
                name: "Routine 3: Day 1 (Lower Power)",
                exercises: [
                    { name: "Box Jump", defaultSets: 3 },
                    { name: "Sprint", defaultSets: 4 },
                    { name: "Back Squat", defaultSets: 3 },
                    { name: "Romanian Deadlift", defaultSets: 3 },
                    { name: "Nordic Curl", defaultSets: 3 },
                    { name: "Copenhagen Plank", defaultSets: 3 },
                    { name: "Calf Raise (Standing)", defaultSets: 3 },
                ]
            },
            {
                name: "Routine 3: Day 2 (Upper)",
                exercises: [
                    { name: "Bench Press (Barbell)", defaultSets: 3 },
                    { name: "Pull Up", defaultSets: 3 },
                    { name: "One-Arm Dumbbell Row", defaultSets: 3 },
                    { name: "Incline Bench Press (Dumbbell)", defaultSets: 3 },
                    { name: "Face Pull", defaultSets: 3 },
                    { name: "Pallof Press", defaultSets: 3 },
                ]
            },
        ];

        for (const routine of routines) {
            await ctx.db.insert("routines", { ...routine, userId });
        }

        return "Seeded " + routines.length + " routines";
    },
});
