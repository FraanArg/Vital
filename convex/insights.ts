import { query } from "./_generated/server";
import { v } from "convex/values";

interface Insight {
    type: "food" | "sleep" | "exercise";
    icon: string;
    title: string;
    message: string;
    priority: number; // Higher = more important
}

export const getDailyInsights = query({
    args: {
        date: v.string(),
    },
    handler: async (ctx, args): Promise<Insight[]> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const userId = identity.subject;

        // Get logs for the day
        const dateStart = new Date(args.date);
        dateStart.setHours(0, 0, 0, 0);
        const dateEnd = new Date(args.date);
        dateEnd.setHours(23, 59, 59, 999);

        const logs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) => q.eq("userId", userId))
            .filter((q) =>
                q.and(
                    q.gte(q.field("date"), dateStart.toISOString()),
                    q.lte(q.field("date"), dateEnd.toISOString())
                )
            )
            .collect();

        // Get user profile for context
        const profile = await ctx.db
            .query("userProfile")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        // Get all food items to map categories
        const foodItems = await ctx.db.query("foodItems").collect();
        const foodCategoryMap = new Map(foodItems.map(f => [f.name.toLowerCase(), f.category]));

        const insights: Insight[] = [];

        // Analyze exercise intensity
        const exercises = logs.filter(l => l.exercise);
        const hasHighIntensity = exercises.some(l => l.exercise?.intensity === "high");
        const hasMidIntensity = exercises.some(l => l.exercise?.intensity === "mid");
        const totalExerciseMinutes = exercises.reduce((sum, l) => sum + (l.exercise?.duration || 0), 0);

        // Analyze food categories
        const meals = logs.filter(l => l.meal);
        const categoryCounts: Record<string, number> = {};

        for (const log of meals) {
            if (log.meal?.items) {
                for (const item of log.meal.items) {
                    const category = foodCategoryMap.get(item.toLowerCase()) || "Other";
                    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
                }
            }
        }

        const totalFoodItems = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
        const proteinCount = categoryCounts["Protein"] || 0;
        const carbCount = categoryCounts["Carb"] || 0;
        const veggieCount = categoryCounts["Veggie"] || 0;
        const sweetCount = categoryCounts["Sweet"] || 0;

        // Check sleep
        const sleepLogs = logs.filter(l => l.sleep);
        const totalSleep = sleepLogs.reduce((sum, l) => sum + (l.sleep || 0), 0);

        // Generate insights based on data

        // Exercise + Protein insight
        if (hasHighIntensity && totalFoodItems > 0 && proteinCount < totalFoodItems * 0.25) {
            insights.push({
                type: "food",
                icon: "💪",
                title: "Protein Boost Recommended",
                message: "After high-intensity exercise, your muscles need protein for recovery. Consider adding more protein to your meals.",
                priority: 90,
            });
        } else if (hasMidIntensity && proteinCount === 0 && totalFoodItems > 2) {
            insights.push({
                type: "food",
                icon: "🍗",
                title: "Add Some Protein",
                message: "You exercised today but haven't logged much protein. Try adding eggs, chicken, or yogurt.",
                priority: 70,
            });
        }

        // Carb-heavy insight
        if (totalFoodItems >= 4 && carbCount > totalFoodItems * 0.5) {
            insights.push({
                type: "food",
                icon: "🍞",
                title: "Carb-Heavy Day",
                message: "Your meals today are mostly carbs. Try balancing with some protein and veggies.",
                priority: 60,
            });
        }

        // Low veggie insight
        if (totalFoodItems >= 4 && veggieCount < 2) {
            insights.push({
                type: "food",
                icon: "🥦",
                title: "More Veggies?",
                message: "You're a bit low on vegetables today. Add some greens to your next meal!",
                priority: 50,
            });
        }

        // Sweet warning
        if (sweetCount >= 3) {
            insights.push({
                type: "food",
                icon: "🍬",
                title: "Sweet Tooth Today",
                message: "You've had quite a few sweets. Consider balancing with some protein or fruit.",
                priority: 55,
            });
        }

        // Sleep recommendations based on exercise
        if (hasHighIntensity && totalSleep > 0 && totalSleep < 7) {
            insights.push({
                type: "sleep",
                icon: "😴",
                title: "Rest Up!",
                message: "After intense exercise, your body needs 7-8 hours of sleep for proper recovery.",
                priority: 85,
            });
        } else if (hasHighIntensity && totalSleep === 0) {
            insights.push({
                type: "sleep",
                icon: "🛏️",
                title: "Sleep Matters",
                message: "After your intense workout, aim for 7-8 hours of sleep tonight for optimal recovery.",
                priority: 80,
            });
        }

        // Long exercise session
        if (totalExerciseMinutes >= 90) {
            insights.push({
                type: "exercise",
                icon: "🏆",
                title: "Great Workout!",
                message: "You've exercised for over 90 minutes today. Make sure to refuel with protein and carbs.",
                priority: 40,
            });
        }

        // No exercise but heavy eating
        if (exercises.length === 0 && totalFoodItems >= 6) {
            insights.push({
                type: "exercise",
                icon: "🚶",
                title: "Get Moving?",
                message: "You've eaten well today! Consider a short walk or some light activity.",
                priority: 30,
            });
        }

        // Sort by priority (highest first)
        insights.sort((a, b) => b.priority - a.priority);

        // Return top 3 insights
        return insights.slice(0, 3);
    },
});
