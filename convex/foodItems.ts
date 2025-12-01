import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];
        const userId = identity.subject;

        return await ctx.db
            .query("foodItems")
            .withIndex("by_user_name", (q) => q.eq("userId", userId))
            .collect();
    },
});

export const create = mutation({
    args: { name: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");
        const userId = identity.subject;

        const existing = await ctx.db
            .query("foodItems")
            .withIndex("by_user_name", (q) => q.eq("userId", userId).eq("name", args.name))
            .first();

        if (existing) return existing._id;

        return await ctx.db.insert("foodItems", {
            userId,
            name: args.name,
            usage_count: 1,
        });
    },
});

export const incrementUsage = mutation({
    args: { id: v.id("foodItems") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const item = await ctx.db.get(args.id);
        if (!item) return;

        await ctx.db.patch(args.id, {
            usage_count: (item.usage_count || 0) + 1,
        });
    },
});

export const remove = mutation({
    args: { id: v.id("foodItems") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        await ctx.db.delete(args.id);
    },
});
