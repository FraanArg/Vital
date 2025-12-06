import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get the last undoable change for the user
export const getLastChange = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const userId = identity.subject;

        const history = await ctx.db
            .query("logHistory")
            .withIndex("by_user_time", (q) => q.eq("userId", userId))
            .order("desc")
            .first();

        if (!history) return null;

        // Only return if it's recent (within 5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        if (history.createdAt < fiveMinutesAgo) return null;

        return history;
    },
});

// Undo the last change
export const undo = mutation({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const userId = identity.subject;

        // Get the most recent history entry
        const history = await ctx.db
            .query("logHistory")
            .withIndex("by_user_time", (q) => q.eq("userId", userId))
            .order("desc")
            .first();

        if (!history) throw new Error("Nothing to undo");

        // Only allow undo if recent (within 5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        if (history.createdAt < fiveMinutesAgo) {
            throw new Error("Undo expired");
        }

        const snapshot = history.snapshot;

        if (history.action === "update") {
            // Restore the previous version
            const logId = history.logId as any;
            const existing = await ctx.db.get(logId);

            if (existing && existing.userId === userId) {
                // Remove _id and _creationTime from snapshot before patching
                const { _id, _creationTime, userId: _, ...restoreData } = snapshot;
                await ctx.db.patch(logId, restoreData);
            }
        } else if (history.action === "delete") {
            // Re-create the deleted log
            const { _id, _creationTime, ...logData } = snapshot;
            await ctx.db.insert("logs", logData);
        }

        // Remove the history entry after undo
        await ctx.db.delete(history._id);

        return { success: true, action: history.action };
    },
});

// Save a snapshot before making changes (internal helper)
export const saveSnapshot = mutation({
    args: {
        logId: v.id("logs"),
        action: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const userId = identity.subject;

        // Get the current log data
        const log = await ctx.db.get(args.logId);
        if (!log || log.userId !== userId) {
            throw new Error("Unauthorized");
        }

        // Save snapshot
        await ctx.db.insert("logHistory", {
            userId,
            logId: args.logId,
            action: args.action,
            snapshot: log,
            createdAt: new Date().toISOString(),
        });

        // Clean up old history (keep only last 10 entries per user)
        const allHistory = await ctx.db
            .query("logHistory")
            .withIndex("by_user_time", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();

        if (allHistory.length > 10) {
            const toDelete = allHistory.slice(10);
            for (const entry of toDelete) {
                await ctx.db.delete(entry._id);
            }
        }
    },
});
