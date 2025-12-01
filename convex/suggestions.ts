import { query } from "./_generated/server";
import { v } from "convex/values";

export const getSuggestions = query({
    args: {
        type: v.string(), // "food" | "exercise"
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];
        const userId = identity.subject;

        // 1. Get logs from the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const logs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) =>
                q.eq("userId", userId).gte("date", thirtyDaysAgo.toISOString())
            )
            .collect();

        // 2. Determine current time of day context
        const now = new Date();
        const hour = now.getHours();
        let timeContext = "evening";
        if (hour >= 5 && hour < 11) timeContext = "morning";
        else if (hour >= 11 && hour < 17) timeContext = "afternoon";

        // 3. Analyze patterns
        const scores: Record<string, number> = {};

        logs.forEach(log => {
            let items: string[] = [];
            let logTimeContext = "evening";
            const logDate = new Date(log.date);
            const logHour = logDate.getHours();

            if (logHour >= 5 && logHour < 11) logTimeContext = "morning";
            else if (logHour >= 11 && logHour < 17) logTimeContext = "afternoon";

            if (args.type === "food") {
                if (log.food) items.push(log.food);
                if (log.meal) items.push(log.meal.type); // Suggest meal types like "Breakfast"
            } else if (args.type === "exercise") {
                if (log.exercise) {
                    // For sports, use the specific sport name (e.g., "padel")
                    // For gym/run, use the type (e.g., "gym", "run")
                    const name = log.exercise.type === "sports" ? "sports" : log.exercise.type;
                    // Note: We might want to be more specific for sports later, but this matches current UI structure
                    items.push(name);
                }
            }

            items.forEach(item => {
                if (!scores[item]) scores[item] = 0;

                // Base score for frequency
                scores[item] += 1;

                // Bonus for matching time of day
                if (logTimeContext === timeContext) {
                    scores[item] += 2;
                }
            });
        });

        // 4. Sort and return top 3
        return Object.entries(scores)
            .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
            .slice(0, 3)
            .map(([name]) => ({ name }));
    },
});
