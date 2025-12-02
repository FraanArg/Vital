import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getExercises = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        // Get system defaults (userId is null/undefined)
        // Note: In Convex, we might need a specific query for "system" exercises if userId is indexed.
        // For now, let's assume we fetch all and filter, or use a separate index.
        // Actually, let's fetch system defaults + user's custom exercises.

        const systemExercises = await ctx.db
            .query("exercises")
            .filter(q => q.eq(q.field("userId"), undefined))
            .collect();

        const userExercises = await ctx.db
            .query("exercises")
            .withIndex("by_user", q => q.eq("userId", identity.subject))
            .collect();

        return [...systemExercises, ...userExercises].sort((a, b) => a.name.localeCompare(b.name));
    },
});

export const createExercise = mutation({
    args: {
        name: v.string(),
        muscle: v.string(),
        category: v.string(),
        icon: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        return await ctx.db.insert("exercises", {
            ...args,
            userId: identity.subject,
        });
    },
});

export const seedDefaults = mutation({
    args: {},
    handler: async (ctx) => {
        const defaults = [
            // Chest
            { name: "Bench Press (Barbell)", muscle: "Chest", category: "Barbell", icon: "🏋️‍♂️" },
            { name: "Bench Press (Dumbbell)", muscle: "Chest", category: "Dumbbell", icon: "🏋️‍♂️" },
            { name: "Incline Bench Press (Barbell)", muscle: "Chest", category: "Barbell", icon: "📐" },
            { name: "Incline Bench Press (Dumbbell)", muscle: "Chest", category: "Dumbbell", icon: "📐" },
            { name: "Chest Fly", muscle: "Chest", category: "Machine", icon: "🦋" },
            { name: "Push Up", muscle: "Chest", category: "Bodyweight", icon: "💪" },
            { name: "Wide Push Up", muscle: "Chest", category: "Bodyweight", icon: "↔️" },
            { name: "Pike Push Up", muscle: "Shoulders", category: "Bodyweight", icon: "🧘" },
            { name: "Dips", muscle: "Chest", category: "Bodyweight", icon: "🪜" },

            // Back
            { name: "Deadlift", muscle: "Back", category: "Barbell", icon: "🏋️‍♂️" },
            { name: "Pull Up", muscle: "Back", category: "Bodyweight", icon: "🧗" },
            { name: "Lat Pulldown", muscle: "Back", category: "Cable", icon: "⬇️" },
            { name: "Seated Row", muscle: "Back", category: "Cable", icon: "🚣" },
            { name: "Bent Over Row", muscle: "Back", category: "Barbell", icon: "🙇" },
            { name: "One-Arm Dumbbell Row", muscle: "Back", category: "Dumbbell", icon: "💪" },
            { name: "Inverted Row", muscle: "Back", category: "Bodyweight", icon: "🙃" },
            { name: "Chest-Supported Row", muscle: "Back", category: "Machine", icon: "💺" },
            { name: "Backpack/Band Row", muscle: "Back", category: "Weighted Bodyweight", icon: "🎒" },

            // Legs
            { name: "Squat (Barbell)", muscle: "Legs", category: "Barbell", icon: "🦵" },
            { name: "Front Squat", muscle: "Legs", category: "Barbell", icon: "🦵" },
            { name: "Back Squat", muscle: "Legs", category: "Barbell", icon: "🍑" },
            { name: "Romanian Deadlift", muscle: "Legs", category: "Barbell", icon: "📉" },
            { name: "Leg Press", muscle: "Legs", category: "Machine", icon: "🦶" },
            { name: "Lunges", muscle: "Legs", category: "Dumbbell", icon: "🚶" },
            { name: "Bulgarian Split Squat", muscle: "Legs", category: "Dumbbell", icon: "🇧🇬" },
            { name: "Leg Extension", muscle: "Legs", category: "Machine", icon: "🦵" },
            { name: "Leg Curl", muscle: "Legs", category: "Machine", icon: "🍗" },
            { name: "Nordic Curl", muscle: "Legs", category: "Bodyweight", icon: "🇩🇰" },
            { name: "Calf Raise (Standing)", muscle: "Legs", category: "Machine", icon: "👠" },
            { name: "Calf Raise (Seated)", muscle: "Legs", category: "Machine", icon: "🪑" },
            { name: "Hip Thrust", muscle: "Legs", category: "Barbell", icon: "🍑" },
            { name: "Single-Leg Hip Thrust", muscle: "Legs", category: "Bodyweight", icon: "🦩" },
            { name: "Box Jump", muscle: "Legs", category: "Plyometric", icon: "📦" },
            { name: "Broad Jump", muscle: "Legs", category: "Plyometric", icon: "🐇" },
            { name: "Lateral Bound", muscle: "Legs", category: "Plyometric", icon: "⛸️" },

            // Shoulders
            { name: "Overhead Press (Barbell)", muscle: "Shoulders", category: "Barbell", icon: "🙆" },
            { name: "Overhead Press (Dumbbell)", muscle: "Shoulders", category: "Dumbbell", icon: "🙆" },
            { name: "Seated Dumbbell Shoulder Press", muscle: "Shoulders", category: "Dumbbell", icon: "🪑" },
            { name: "Lateral Raise", muscle: "Shoulders", category: "Dumbbell", icon: "🦅" },
            { name: "Face Pull", muscle: "Shoulders", category: "Cable", icon: "🤡" },

            // Arms
            { name: "Bicep Curl (Barbell)", muscle: "Arms", category: "Barbell", icon: "💪" },
            { name: "Bicep Curl (Dumbbell)", muscle: "Arms", category: "Dumbbell", icon: "💪" },
            { name: "Tricep Extension", muscle: "Arms", category: "Cable", icon: "💪" },
            { name: "Tricep Pressdown", muscle: "Arms", category: "Cable", icon: "⬇️" },
            { name: "Skullcrusher", muscle: "Arms", category: "Barbell", icon: "💀" },

            // Core
            { name: "Plank", muscle: "Core", category: "Bodyweight", icon: "🪵" },
            { name: "Plank with Shoulder Taps", muscle: "Core", category: "Bodyweight", icon: "👋" },
            { name: "Side Plank", muscle: "Core", category: "Bodyweight", icon: "📐" },
            { name: "Copenhagen Plank", muscle: "Core", category: "Bodyweight", icon: "🇩🇰" },
            { name: "Crunch", muscle: "Core", category: "Bodyweight", icon: "🍫" },
            { name: "Leg Raise", muscle: "Core", category: "Bodyweight", icon: "🦵" },
            { name: "Hanging Leg Raise", muscle: "Core", category: "Bodyweight", icon: "🐒" },
            { name: "Dead Bug", muscle: "Core", category: "Bodyweight", icon: "🐞" },
            { name: "Hollow Body Hold", muscle: "Core", category: "Bodyweight", icon: "🥣" },
            { name: "Pallof Press", muscle: "Core", category: "Cable", icon: "🛑" },

            // Cardio/Other
            { name: "Sprint", muscle: "Cardio", category: "Cardio", icon: "🏃" },
            { name: "Kettlebell Swing", muscle: "Legs", category: "Kettlebell", icon: "🔔" },
        ];

        // Check if defaults already exist to avoid duplicates
        // We check individually to allow adding new defaults to existing databases
        const existingSystemExercises = await ctx.db
            .query("exercises")
            .filter(q => q.eq(q.field("userId"), undefined))
            .collect();

        const existingNames = new Set(existingSystemExercises.map(e => e.name));

        let addedCount = 0;
        for (const ex of defaults) {
            if (!existingNames.has(ex.name)) {
                await ctx.db.insert("exercises", ex);
                addedCount++;
            }
        }

        return "Seeded " + addedCount + " new exercises";
    },
});
