import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Force sync
export const saveIconMapping = mutation({
    args: {
        type: v.string(),
        key: v.string(),
        icon: v.string(),
        customLabel: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("User not authenticated");
        const userId = identity.subject;

        const existing = await ctx.db
            .query("icon_mappings")
            .withIndex("by_user_key", (q) => q.eq("userId", userId).eq("key", args.key))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                icon: args.icon,
                ...(args.customLabel !== undefined ? { customLabel: args.customLabel } : {})
            });
        } else {
            await ctx.db.insert("icon_mappings", { ...args, userId });
        }
    },
});

export const getIconMappings = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];
        const userId = identity.subject;

        return await ctx.db
            .query("icon_mappings")
            .withIndex("by_user_type", (q) => q.eq("userId", userId))
            .collect();
    },
});
