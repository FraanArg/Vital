import { query } from "./_generated/server";
import { v } from "convex/values";
import { startOfDay, endOfDay, subDays, startOfWeek, addDays, isSameDay } from "date-fns";

/**
 * OPTIMIZED DASHBOARD QUERY
 * 
 * Returns all data needed for the dashboard in ONE query.
 * Previously we had 8+ separate queries, each transferring full log objects.
 * 
 * This reduces:
 * - Query count from 12+ to 1
 * - Bandwidth by ~90% (only returns aggregated data, not full logs)
 */
export const getDashboardData = query({
    args: { date: v.string() },
    handler: async (ctx, { date }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        const userId = identity.subject;
        const selectedDate = new Date(date);
        const dayStart = startOfDay(selectedDate).toISOString();
        const dayEnd = endOfDay(selectedDate).toISOString();

        // Get user goals
        const userProfile = await ctx.db.query("userProfile")
            .filter((q) => q.eq(q.field("userId"), userId))
            .first();

        const goals = {
            goalWater: userProfile?.goalWater ?? 2000,
            goalSleep: userProfile?.goalSleep ?? 8,
            goalExercise: userProfile?.goalExercise ?? 30,
            goalMeals: userProfile?.goalMeals ?? 3,
        };

        // Get today's logs - aggregate on server
        const todayLogs = await ctx.db.query("logs")
            .withIndex("by_userId_date", (q) =>
                q.eq("userId", userId).gte("date", dayStart).lte("date", dayEnd)
            )
            .collect();

        // Calculate today's totals (don't send full logs to client)
        const todayTotals = {
            water: todayLogs.reduce((sum, l) => sum + (l.water || 0), 0),
            sleep: todayLogs.reduce((sum, l) => sum + (l.sleep || 0), 0),
            exercise: todayLogs.reduce((sum, l) => sum + (l.exercise?.duration || 0), 0),
            meals: todayLogs.filter(l => l.meal).length,
        };

        // Get 7-day data for sparklines (minimal data)
        const weekStart = subDays(startOfDay(selectedDate), 6);
        const weekLogs = await ctx.db.query("logs")
            .withIndex("by_userId_date", (q) =>
                q.eq("userId", userId).gte("date", weekStart.toISOString())
            )
            .collect();

        // Build sparkline data (just arrays of numbers, not full logs)
        const sparklineData = {
            water: [] as number[],
            sleep: [] as number[],
            exercise: [] as number[],
            meals: [] as number[],
        };

        for (let i = 6; i >= 0; i--) {
            const day = subDays(startOfDay(selectedDate), i);
            const dayLogs = weekLogs.filter(l => isSameDay(new Date(l.date), day));
            sparklineData.water.push(dayLogs.reduce((s, l) => s + (l.water || 0), 0));
            sparklineData.sleep.push(dayLogs.reduce((s, l) => s + (l.sleep || 0), 0));
            sparklineData.exercise.push(dayLogs.reduce((s, l) => s + (l.exercise?.duration || 0), 0));
            sparklineData.meals.push(dayLogs.filter(l => l.meal).length);
        }

        // Get last week's totals for comparison (just totals, not logs)
        const lastWeekStart = subDays(weekStart, 7);
        const lastWeekEnd = subDays(weekStart, 1);
        const lastWeekLogs = await ctx.db.query("logs")
            .withIndex("by_userId_date", (q) =>
                q.eq("userId", userId)
                    .gte("date", lastWeekStart.toISOString())
                    .lte("date", lastWeekEnd.toISOString())
            )
            .collect();

        const lastWeekTotals = {
            water: lastWeekLogs.reduce((s, l) => s + (l.water || 0), 0),
            sleep: lastWeekLogs.reduce((s, l) => s + (l.sleep || 0), 0),
            exercise: lastWeekLogs.reduce((s, l) => s + (l.exercise?.duration || 0), 0),
            meals: lastWeekLogs.filter(l => l.meal).length,
        };

        const thisWeekTotals = {
            water: sparklineData.water.reduce((a, b) => a + b, 0),
            sleep: sparklineData.sleep.reduce((a, b) => a + b, 0),
            exercise: sparklineData.exercise.reduce((a, b) => a + b, 0),
            meals: sparklineData.meals.reduce((a, b) => a + b, 0),
        };

        // Calculate weekly comparison percentages
        const comparison = {
            water: lastWeekTotals.water > 0 ? Math.round(((thisWeekTotals.water - lastWeekTotals.water) / lastWeekTotals.water) * 100) : null,
            sleep: lastWeekTotals.sleep > 0 ? Math.round(((thisWeekTotals.sleep - lastWeekTotals.sleep) / lastWeekTotals.sleep) * 100) : null,
            exercise: lastWeekTotals.exercise > 0 ? Math.round(((thisWeekTotals.exercise - lastWeekTotals.exercise) / lastWeekTotals.exercise) * 100) : null,
            meals: lastWeekTotals.meals > 0 ? Math.round(((thisWeekTotals.meals - lastWeekTotals.meals) / lastWeekTotals.meals) * 100) : null,
        };

        // Calculate streak (server-side, don't send 100 days of logs)
        const streakLogs = await ctx.db.query("logs")
            .withIndex("by_userId_date", (q) =>
                q.eq("userId", userId).gte("date", subDays(new Date(), 100).toISOString())
            )
            .collect();

        const loggedDates = new Set(streakLogs.map(l => l.date.split('T')[0]));
        const sortedDates = Array.from(loggedDates).sort().reverse();
        const today = startOfDay(new Date()).toISOString().split('T')[0];
        const yesterday = subDays(startOfDay(new Date()), 1).toISOString().split('T')[0];

        let currentStreak = 0;
        const todayLogged = sortedDates.includes(today);
        let checkDate = todayLogged ? today : yesterday;

        for (const d of sortedDates) {
            if (d === checkDate) {
                currentStreak++;
                checkDate = subDays(new Date(checkDate + 'T00:00:00'), 1).toISOString().split('T')[0];
            } else if (d < checkDate) {
                break;
            }
        }

        if (!todayLogged && !sortedDates.includes(yesterday)) {
            currentStreak = 0;
        }

        return {
            goals,
            todayTotals,
            sparklineData,
            comparison,
            streak: {
                current: currentStreak,
                todayLogged,
            },
            // Return minimal log data for history section
            todayLogIds: todayLogs.map(l => l._id),
        };
    },
});

/**
 * Lightweight query just for today's logs with full details
 * Only called when user needs to see/edit specific log entries
 */
export const getTodayLogsDetailed = query({
    args: { date: v.string() },
    handler: async (ctx, { date }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const userId = identity.subject;
        const selectedDate = new Date(date);

        return await ctx.db.query("logs")
            .withIndex("by_userId_date", (q) =>
                q.eq("userId", userId)
                    .gte("date", startOfDay(selectedDate).toISOString())
                    .lte("date", endOfDay(selectedDate).toISOString())
            )
            .collect();
    },
});
