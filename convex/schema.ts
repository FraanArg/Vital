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
            intensity: v.optional(v.union(v.literal("low"), v.literal("mid"), v.literal("high"))),
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
            end_time: v.optional(v.string()), // End time e.g. "19:30"
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

    userProfile: defineTable({
        userId: v.string(),
        age: v.optional(v.number()),
        weight: v.optional(v.number()), // kg
        height: v.optional(v.number()), // cm
        // Daily goals
        goalSleep: v.optional(v.number()), // hours, default 8
        goalWater: v.optional(v.number()), // ml, default 2000
        goalExercise: v.optional(v.number()), // minutes, default 30
        goalMeals: v.optional(v.number()), // count, default 3
        goalWork: v.optional(v.number()), // hours, default 8
        updatedAt: v.string(),
    }).index("by_user", ["userId"]),

    // Body composition tracking
    bodyMeasurements: defineTable({
        userId: v.string(),
        date: v.string(), // ISO date
        weight: v.optional(v.number()), // kg
        bodyFat: v.optional(v.number()), // percentage
        chest: v.optional(v.number()), // cm
        waist: v.optional(v.number()), // cm
        hips: v.optional(v.number()), // cm
        arms: v.optional(v.number()), // cm (bicep)
        thighs: v.optional(v.number()), // cm
        neck: v.optional(v.number()), // cm
        notes: v.optional(v.string()),
    }).index("by_user_date", ["userId", "date"]),

    // History for undo functionality
    logHistory: defineTable({
        userId: v.string(),
        logId: v.string(), // Original log ID
        action: v.string(), // "update" or "delete"
        snapshot: v.any(), // Full log data before change
        createdAt: v.string(),
    }).index("by_user_time", ["userId", "createdAt"]),

    // Notification preferences per user
    notificationPreferences: defineTable({
        userId: v.string(),
        enabled: v.boolean(),
        mealReminders: v.boolean(),
        waterReminders: v.boolean(),
        exerciseReminders: v.boolean(),
        streakAlerts: v.boolean(),
        smartNudges: v.boolean(),
        quietHoursStart: v.optional(v.string()), // "22:00"
        quietHoursEnd: v.optional(v.string()),   // "08:00"
        pushSubscription: v.optional(v.string()), // JSON string of push subscription
        updatedAt: v.string(),
    }).index("by_user", ["userId"]),

    // Cached meal timing patterns per user
    mealPatterns: defineTable({
        userId: v.string(),
        mealType: v.string(), // "desayuno", "almuerzo", etc.
        weekday: v.boolean(), // true = weekday pattern, false = weekend
        averageTime: v.string(), // "12:30" - typical meal time
        variance: v.number(), // minutes of variance
        sampleCount: v.number(), // how many meals analyzed
        lastUpdated: v.string(),
    }).index("by_user", ["userId"])
        .index("by_user_meal", ["userId", "mealType"]),

    // In-app notifications queue
    notifications: defineTable({
        userId: v.string(),
        type: v.string(), // "meal_reminder", "missing_meal", "streak", "nudge"
        title: v.string(),
        message: v.string(),
        icon: v.string(),
        read: v.boolean(),
        actionUrl: v.optional(v.string()),
        metadata: v.optional(v.any()), // Additional data
        createdAt: v.string(),
        expiresAt: v.optional(v.string()), // Auto-dismiss after this time
    }).index("by_user", ["userId"])
        .index("by_user_unread", ["userId", "read"]),
});

