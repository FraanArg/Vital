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
                    rpe: v.optional(v.number()),
                })),
                notes: v.optional(v.string()), // Exercise-specific notes
            }))),
            notes: v.optional(v.string()), // General workout notes
            time: v.optional(v.string()), // Start time e.g. "18:00"
        })),
        journal: v.optional(v.string()),
        custom: v.optional(v.array(v.object({
            name: v.string(),
            value: v.number(),
            unit: v.string(),
        }))),
        date: v.string(), // ISO string for easier querying
    }).index("by_userId_date", ["userId", "date"]),

    foodItems: defineTable({
        userId: v.optional(v.string()), // null = system default, string = user custom
        name: v.string(),
        usage_count: v.number(),
        icon: v.optional(v.string()),
        category: v.optional(v.string()), // "Protein", "Carb", "Veggie", "Fruit", "Fat", "Drink", "Sweet", "Other"
    }).index("by_user_name", ["userId", "name"]),

    routines: defineTable({
        userId: v.string(),
        name: v.string(),
        exercises: v.array(v.object({
            name: v.string(),
            defaultSets: v.number(),
            day: v.optional(v.string()), // e.g. "Day 1", "Push", etc.
            targetRpe: v.optional(v.string()), // e.g. "8", "7-8"
            targetReps: v.optional(v.string()), // e.g. "8-12"
            alternateName: v.optional(v.string()), // e.g. "Dead Bug"
            notes: v.optional(v.string()), // e.g. "Pause at top"
        }))
    }).index("by_user", ["userId"]),

    icon_mappings: defineTable({
        userId: v.string(),
        type: v.string(), // "food" | "sport"
        key: v.string(),  // "apple", "padel"
        icon: v.string(), // "Apple", "Swords"
        customLabel: v.optional(v.string()), // "Paddle Tennis"
    }).index("by_user_type", ["userId", "type"])
        .index("by_user_key", ["userId", "key"]),

    sports: defineTable({
        userId: v.string(),
        name: v.string(),
        icon: v.string(),
        category: v.optional(v.string()), // "Racket", "Team", "Water", etc.
    }).index("by_user", ["userId"]),

    exercises: defineTable({
        name: v.string(),
        muscle: v.string(), // "Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio"
        category: v.string(), // "Barbell", "Dumbbell", "Machine", "Bodyweight", "Cable", "Weighted Bodyweight", "Assisted Bodyweight"
        icon: v.optional(v.string()), // Emoji or icon name
        userId: v.optional(v.string()), // null = system default, string = user custom
    }).index("by_user", ["userId"])
        .index("by_muscle", ["muscle"]),
});
