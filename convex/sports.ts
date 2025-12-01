import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getSports = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];
        const userId = identity.subject;

        return await ctx.db
            .query("sports")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();
    },
});

export const createSport = mutation({
    args: {
        name: v.string(),
        icon: v.string(),
        category: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");
        const userId = identity.subject;

        // Check for duplicates
        const existing = await ctx.db
            .query("sports")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) => q.eq(q.field("name"), args.name))
            .first();

        if (existing) throw new Error("Sport already exists");

        await ctx.db.insert("sports", { ...args, userId });
    },
});

export const updateSport = mutation({
    args: {
        id: v.id("sports"),
        name: v.string(),
        icon: v.string(),
        category: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");
        const userId = identity.subject;

        const sport = await ctx.db.get(args.id);
        if (!sport || sport.userId !== userId) throw new Error("Unauthorized");

        await ctx.db.patch(args.id, {
            name: args.name,
            icon: args.icon,
            category: args.category,
        });
    },
});

export const deleteSport = mutation({
    args: { id: v.id("sports") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");
        const userId = identity.subject;

        const sport = await ctx.db.get(args.id);
        if (!sport || sport.userId !== userId) throw new Error("Unauthorized");

        await ctx.db.delete(args.id);
    },
});
