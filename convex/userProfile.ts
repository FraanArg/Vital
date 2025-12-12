import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Default goals for new users
const DEFAULT_GOALS = {
    goalSleep: 8,
    goalWater: 2000,
    goalExercise: 30,
    goalMeals: 3,
    goalWork: 8,
};

export const get = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const userId = identity.subject;
        const profile = await ctx.db
            .query("userProfile")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        return profile;
    },
});

// Get user goals with defaults
export const getGoals = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return DEFAULT_GOALS;

        const userId = identity.subject;
        const profile = await ctx.db
            .query("userProfile")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        return {
            goalSleep: profile?.goalSleep ?? DEFAULT_GOALS.goalSleep,
            goalWater: profile?.goalWater ?? DEFAULT_GOALS.goalWater,
            goalExercise: profile?.goalExercise ?? DEFAULT_GOALS.goalExercise,
            goalMeals: profile?.goalMeals ?? DEFAULT_GOALS.goalMeals,
            goalWork: profile?.goalWork ?? DEFAULT_GOALS.goalWork,
        };
    },
});

export const upsert = mutation({
    args: {
        age: v.optional(v.number()),
        weight: v.optional(v.number()),
        height: v.optional(v.number()),
        goalSleep: v.optional(v.number()),
        goalWater: v.optional(v.number()),
        goalExercise: v.optional(v.number()),
        goalMeals: v.optional(v.number()),
        goalWork: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const userId = identity.subject;
        const existing = await ctx.db
            .query("userProfile")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                age: args.age,
                weight: args.weight,
                height: args.height,
                goalSleep: args.goalSleep,
                goalWater: args.goalWater,
                goalExercise: args.goalExercise,
                goalMeals: args.goalMeals,
                goalWork: args.goalWork,
                updatedAt: new Date().toISOString(),
            });
            return existing._id;
        } else {
            return await ctx.db.insert("userProfile", {
                userId,
                age: args.age,
                weight: args.weight,
                height: args.height,
                goalSleep: args.goalSleep ?? DEFAULT_GOALS.goalSleep,
                goalWater: args.goalWater ?? DEFAULT_GOALS.goalWater,
                goalExercise: args.goalExercise ?? DEFAULT_GOALS.goalExercise,
                goalMeals: args.goalMeals ?? DEFAULT_GOALS.goalMeals,
                goalWork: args.goalWork ?? DEFAULT_GOALS.goalWork,
                updatedAt: new Date().toISOString(),
            });
        }
    },
});
