import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createRoutine = mutation({
    args: {
        name: v.string(),
        exercises: v.array(v.object({
            name: v.string(),
            defaultSets: v.number(),
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
