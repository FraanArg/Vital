import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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

export const upsert = mutation({
    args: {
        age: v.optional(v.number()),
        weight: v.optional(v.number()),
        height: v.optional(v.number()),
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
                updatedAt: new Date().toISOString(),
            });
            return existing._id;
        } else {
            return await ctx.db.insert("userProfile", {
                userId,
                age: args.age,
                weight: args.weight,
                height: args.height,
                updatedAt: new Date().toISOString(),
            });
        }
    },
});
