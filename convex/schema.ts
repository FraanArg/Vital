import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    logs: defineTable({
        userId: v.string(),
        mood: v.optional(v.number()),
        work: v.optional(v.number()),
        sleep: v.optional(v.number()),
        sleep_start: v.optional(v.string()),
        sleep_end: v.optional(v.string()),
        water: v.optional(v.number()),
        food: v.optional(v.string()),
        meal: v.optional(v.object({
            type: v.string(),
            items: v.array(v.string()),
            time: v.string(),
        })),
        exercise: v.optional(v.object({
            type: v.string(),
            duration: v.number(),
            distance: v.optional(v.number()),
            workout: v.optional(v.array(v.object({
                name: v.string(),
                sets: v.array(v.object({
                    reps: v.number(),
                    weight: v.number(),
                }))
            })))
        })),
        journal: v.optional(v.string()),
        custom: v.optional(v.array(v.object({
            name: v.string(),
            value: v.number(),
            unit: v.string(),
        }))),
        date: v.string(), // ISO string for easier querying
    }).index("by_user_date", ["userId", "date"]),

    foodItems: defineTable({
        userId: v.string(),
        name: v.string(),
        usage_count: v.number(),
    }).index("by_user_name", ["userId", "name"]),

    routines: defineTable({
        userId: v.string(),
        name: v.string(),
        exercises: v.array(v.object({
            name: v.string(),
            defaultSets: v.number(),
        }))
    }).index("by_user", ["userId"]),
});
