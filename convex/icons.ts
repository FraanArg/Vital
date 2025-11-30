import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveIconMapping = mutation({
    args: {
        type: v.string(),
        key: v.string(),
        icon: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = ctx.auth.getUserIdentity()?.token.claims.sub;
        if (!userId) throw new Error("User not authenticated");

        const existing = await ctx.db
            .query("icon_mappings")
            .withIndex("by_user_key", (q) => q.eq("userId", userId).eq("key", args.key))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, { icon: args.icon });
        } else {
            await ctx.db.insert("icon_mappings", { ...args, userId });
        }
    },
});

export const getIconMappings = query({
    handler: async (ctx) => {
        const userId = ctx.auth.getUserIdentity()?.token.claims.sub;
        if (!userId) return [];

        return await ctx.db
            .query("icon_mappings")
            .withIndex("by_user_type", (q) => q.eq("userId", userId))
            .collect();
    },
});
