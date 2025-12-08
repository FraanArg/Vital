import { query } from "./_generated/server";
import { v } from "convex/values";
import { subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, format, parseISO } from "date-fns";

// Food category mapping
const FOOD_CATEGORIES: Record<string, string> = {
    // Proteins
    "Chicken": "Protein", "Beef": "Protein", "Fish": "Protein", "Eggs": "Protein",
    "Salmon": "Protein", "Tuna": "Protein", "Turkey": "Protein", "Pork": "Protein",
    "Shrimp": "Protein", "Tofu": "Protein", "Yogurt": "Protein", "Cheese": "Protein",
    // Carbs
    "Rice": "Carbs", "Pasta": "Carbs", "Bread": "Carbs", "Oats": "Carbs",
    "Potato": "Carbs", "Quinoa": "Carbs", "Cereal": "Carbs", "Tortilla": "Carbs",
    // Vegetables
    "Broccoli": "Veggies", "Spinach": "Veggies", "Salad": "Veggies", "Tomato": "Veggies",
    "Carrot": "Veggies", "Cucumber": "Veggies", "Pepper": "Veggies", "Onion": "Veggies",
    // Fruits
    "Apple": "Fruits", "Banana": "Fruits", "Orange": "Fruits", "Berries": "Fruits",
    "Mango": "Fruits", "Grapes": "Fruits", "Strawberry": "Fruits", "Avocado": "Fruits",
    // Fats
    "Nuts": "Fats", "Olive Oil": "Fats", "Butter": "Fats", "Almonds": "Fats",
    // Drinks
    "Coffee": "Drinks", "Tea": "Drinks", "Juice": "Drinks", "Milk": "Drinks", "Smoothie": "Drinks",
    // Sweets
    "Chocolate": "Sweets", "Ice Cream": "Sweets", "Cake": "Sweets", "Cookie": "Sweets",
};

function categorizeFood(foodName: string): string {
    for (const [key, category] of Object.entries(FOOD_CATEGORIES)) {
        if (foodName.toLowerCase().includes(key.toLowerCase())) {
            return category;
        }
    }
    return "Other";
}

// Nutrition Breakdown - food category distribution
export const getNutritionBreakdown = query({
    args: { days: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const userId = identity.subject;
        const daysBack = args.days || 30;
        const startDate = subDays(new Date(), daysBack).toISOString();

        const logs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) => q.eq("userId", userId).gte("date", startDate))
            .collect();

        const categories: Record<string, number> = {};

        for (const log of logs) {
            if (log.meal?.items) {
                for (const item of log.meal.items) {
                    const category = categorizeFood(item);
                    categories[category] = (categories[category] || 0) + 1;
                }
            }
        }

        return Object.entries(categories)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    },
});

// Sleep Analysis - duration, consistency, patterns
export const getSleepAnalysis = query({
    args: { days: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const userId = identity.subject;
        const daysBack = args.days || 30;
        const startDate = subDays(new Date(), daysBack).toISOString();

        const logs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) => q.eq("userId", userId).gte("date", startDate))
            .collect();

        const sleepLogs = logs.filter(l => l.sleep && l.sleep > 0);
        if (sleepLogs.length === 0) return null;

        const durations = sleepLogs.map(l => l.sleep!);
        const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

        // Consistency score (0-100) based on standard deviation
        const variance = durations.reduce((sum, d) => sum + Math.pow(d - avgDuration, 2), 0) / durations.length;
        const stdDev = Math.sqrt(variance);
        const consistency = Math.max(0, Math.min(100, 100 - (stdDev * 20)));

        // Best and worst sleep
        const bestSleep = Math.max(...durations);
        const worstSleep = Math.min(...durations);

        // Average bedtime (from sleep_start)
        const bedtimes = logs.filter(l => l.sleep_start).map(l => {
            const [h, m] = l.sleep_start!.split(":").map(Number);
            return h * 60 + m;
        });
        const avgBedtimeMinutes = bedtimes.length > 0
            ? bedtimes.reduce((a, b) => a + b, 0) / bedtimes.length
            : null;
        const avgBedtime = avgBedtimeMinutes
            ? `${Math.floor(avgBedtimeMinutes / 60).toString().padStart(2, "0")}:${(avgBedtimeMinutes % 60).toString().padStart(2, "0")}`
            : null;

        return {
            avgDuration: Math.round(avgDuration * 10) / 10,
            consistency: Math.round(consistency),
            bestSleep,
            worstSleep,
            avgBedtime,
            totalNights: sleepLogs.length,
        };
    },
});

// Exercise Breakdown - workout types and intensity
export const getExerciseBreakdown = query({
    args: { days: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const userId = identity.subject;
        const daysBack = args.days || 30;
        const startDate = subDays(new Date(), daysBack).toISOString();

        const logs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) => q.eq("userId", userId).gte("date", startDate))
            .collect();

        const exerciseLogs = logs.filter(l => l.exercise);
        if (exerciseLogs.length === 0) return null;

        // Workout types
        const types: Record<string, number> = {};
        const intensities: Record<string, number> = { low: 0, mid: 0, high: 0 };
        let totalDuration = 0;

        for (const log of exerciseLogs) {
            const type = log.exercise!.type;
            types[type] = (types[type] || 0) + 1;

            const intensity = log.exercise!.intensity || "mid";
            intensities[intensity]++;

            totalDuration += log.exercise!.duration || 0;
        }

        return {
            types: Object.entries(types)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count),
            intensities,
            totalWorkouts: exerciseLogs.length,
            totalDuration,
            avgDuration: Math.round(totalDuration / exerciseLogs.length),
        };
    },
});

// Time Patterns - when user does things
export const getTimePatterns = query({
    args: { days: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const userId = identity.subject;
        const daysBack = args.days || 30;
        const startDate = subDays(new Date(), daysBack).toISOString();

        const logs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) => q.eq("userId", userId).gte("date", startDate))
            .collect();

        // Exercise times
        const exerciseTimes: number[] = [];
        const mealTimes: Record<string, number[]> = { breakfast: [], lunch: [], dinner: [], snack: [] };

        for (const log of logs) {
            if (log.exercise?.time) {
                const [h] = log.exercise.time.split(":").map(Number);
                exerciseTimes.push(h);
            }
            if (log.meal?.time) {
                const [h] = log.meal.time.split(":").map(Number);
                const type = log.meal.type.toLowerCase();
                if (mealTimes[type]) {
                    mealTimes[type].push(h);
                }
            }
        }

        const avgHour = (hours: number[]) => hours.length > 0
            ? Math.round(hours.reduce((a, b) => a + b, 0) / hours.length)
            : null;

        return {
            avgExerciseHour: avgHour(exerciseTimes),
            avgMealHours: {
                breakfast: avgHour(mealTimes.breakfast),
                lunch: avgHour(mealTimes.lunch),
                dinner: avgHour(mealTimes.dinner),
            },
        };
    },
});

// Personal Bests - records and streaks
export const getPersonalBests = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const userId = identity.subject;

        const logs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) => q.eq("userId", userId))
            .collect();

        // Longest workout
        const longestWorkout = logs
            .filter(l => l.exercise?.duration)
            .reduce((max, l) => Math.max(max, l.exercise!.duration), 0);

        // Best sleep
        const bestSleep = logs
            .filter(l => l.sleep)
            .reduce((max, l) => Math.max(max, l.sleep!), 0);

        // Most water in a day
        const waterByDay: Record<string, number> = {};
        for (const log of logs) {
            if (log.water) {
                const day = log.date.split("T")[0];
                waterByDay[day] = (waterByDay[day] || 0) + log.water;
            }
        }
        const mostWater = Math.max(0, ...Object.values(waterByDay));

        // Workout streak
        const workoutDays = new Set(
            logs.filter(l => l.exercise).map(l => l.date.split("T")[0])
        );
        const sortedDays = Array.from(workoutDays).sort();
        let currentStreak = 0;
        let maxStreak = 0;
        let prevDay: Date | null = null;

        for (const dayStr of sortedDays) {
            const day = new Date(dayStr);
            if (prevDay && (day.getTime() - prevDay.getTime()) === 86400000) {
                currentStreak++;
            } else {
                currentStreak = 1;
            }
            maxStreak = Math.max(maxStreak, currentStreak);
            prevDay = day;
        }

        // Total workouts
        const totalWorkouts = logs.filter(l => l.exercise).length;

        return {
            longestWorkout,
            bestSleep,
            mostWater,
            longestStreak: maxStreak,
            totalWorkouts,
        };
    },
});

// Achievements - unlocked badges
export const getAchievements = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const userId = identity.subject;

        const logs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) => q.eq("userId", userId))
            .collect();

        const achievements = [];

        // First workout
        if (logs.some(l => l.exercise)) {
            achievements.push({ id: "first_workout", name: "First Step", icon: "🏃", desc: "Logged your first workout" });
        }

        // 10 workouts
        if (logs.filter(l => l.exercise).length >= 10) {
            achievements.push({ id: "10_workouts", name: "Getting Started", icon: "💪", desc: "Completed 10 workouts" });
        }

        // 50 workouts
        if (logs.filter(l => l.exercise).length >= 50) {
            achievements.push({ id: "50_workouts", name: "Dedicated", icon: "🔥", desc: "Completed 50 workouts" });
        }

        // 100 workouts
        if (logs.filter(l => l.exercise).length >= 100) {
            achievements.push({ id: "100_workouts", name: "Century", icon: "🏆", desc: "Completed 100 workouts" });
        }

        // 7-day streak
        const workoutDays = new Set(logs.filter(l => l.exercise).map(l => l.date.split("T")[0]));
        const sortedDays = Array.from(workoutDays).sort();
        let streak = 0;
        let prevDay: Date | null = null;
        for (const dayStr of sortedDays) {
            const day = new Date(dayStr);
            if (prevDay && (day.getTime() - prevDay.getTime()) === 86400000) {
                streak++;
                if (streak >= 7) break;
            } else {
                streak = 1;
            }
            prevDay = day;
        }
        if (streak >= 7) {
            achievements.push({ id: "7_day_streak", name: "Week Warrior", icon: "🗓️", desc: "7-day workout streak" });
        }

        // Early bird (workout before 8am)
        if (logs.some(l => l.exercise?.time && parseInt(l.exercise.time.split(":")[0]) < 8)) {
            achievements.push({ id: "early_bird", name: "Early Bird", icon: "🌅", desc: "Worked out before 8am" });
        }

        // Night owl (workout after 9pm)
        if (logs.some(l => l.exercise?.time && parseInt(l.exercise.time.split(":")[0]) >= 21)) {
            achievements.push({ id: "night_owl", name: "Night Owl", icon: "🌙", desc: "Worked out after 9pm" });
        }

        // Good sleeper (8+ hours)
        if (logs.some(l => l.sleep && l.sleep >= 8)) {
            achievements.push({ id: "good_sleep", name: "Well Rested", icon: "😴", desc: "Got 8+ hours of sleep" });
        }

        // Hydrated (8+ glasses)
        const waterByDay: Record<string, number> = {};
        for (const log of logs) {
            if (log.water) {
                const day = log.date.split("T")[0];
                waterByDay[day] = (waterByDay[day] || 0) + log.water;
            }
        }
        if (Object.values(waterByDay).some(w => w >= 8)) {
            achievements.push({ id: "hydrated", name: "Hydrated", icon: "💧", desc: "Drank 8+ glasses in a day" });
        }

        return achievements;
    },
});

// Week Comparison - this week vs last week
export const getWeekComparison = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const userId = identity.subject;
        const now = new Date();

        const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
        const lastWeekStart = subDays(thisWeekStart, 7);
        const lastWeekEnd = subDays(thisWeekStart, 1);

        const thisWeekLogs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) =>
                q.eq("userId", userId)
                    .gte("date", thisWeekStart.toISOString())
            )
            .collect();

        const lastWeekLogs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) =>
                q.eq("userId", userId)
                    .gte("date", lastWeekStart.toISOString())
                    .lte("date", lastWeekEnd.toISOString())
            )
            .collect();

        const calcStats = (logs: any[]) => ({
            workouts: logs.filter(l => l.exercise).length,
            exerciseMinutes: logs.reduce((sum, l) => sum + (l.exercise?.duration || 0), 0),
            avgSleep: logs.filter(l => l.sleep).length > 0
                ? logs.reduce((sum, l) => sum + (l.sleep || 0), 0) / logs.filter(l => l.sleep).length
                : 0,
            totalWater: logs.reduce((sum, l) => sum + (l.water || 0), 0),
            meals: logs.filter(l => l.meal).length,
        });

        const thisWeek = calcStats(thisWeekLogs);
        const lastWeek = calcStats(lastWeekLogs);

        return {
            thisWeek,
            lastWeek,
            changes: {
                workouts: thisWeek.workouts - lastWeek.workouts,
                exerciseMinutes: thisWeek.exerciseMinutes - lastWeek.exerciseMinutes,
                avgSleep: Math.round((thisWeek.avgSleep - lastWeek.avgSleep) * 10) / 10,
                totalWater: thisWeek.totalWater - lastWeek.totalWater,
                meals: thisWeek.meals - lastWeek.meals,
            },
        };
    },
});

// Monthly Summary
export const getMonthlySummary = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const userId = identity.subject;
        const now = new Date();
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);

        const logs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) =>
                q.eq("userId", userId)
                    .gte("date", monthStart.toISOString())
                    .lte("date", monthEnd.toISOString())
            )
            .collect();

        const totalWorkouts = logs.filter(l => l.exercise).length;
        const totalExerciseMinutes = logs.reduce((sum, l) => sum + (l.exercise?.duration || 0), 0);
        const sleepLogs = logs.filter(l => l.sleep);
        const avgSleep = sleepLogs.length > 0
            ? sleepLogs.reduce((sum, l) => sum + l.sleep!, 0) / sleepLogs.length
            : 0;
        const totalMeals = logs.filter(l => l.meal).length;
        const daysLogged = new Set(logs.map(l => l.date.split("T")[0])).size;

        // Highlights
        const highlights = [];
        if (totalWorkouts >= 20) highlights.push("🔥 20+ workouts this month!");
        if (avgSleep >= 7.5) highlights.push("😴 Great sleep average!");
        if (daysLogged >= 25) highlights.push("📱 Consistent logging!");

        return {
            totalWorkouts,
            totalExerciseMinutes,
            avgSleep: Math.round(avgSleep * 10) / 10,
            totalMeals,
            daysLogged,
            daysInMonth: monthEnd.getDate(),
            highlights,
        };
    },
});

// Food Frequency - most logged foods
export const getFoodFrequency = query({
    args: { days: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const userId = identity.subject;
        const daysBack = args.days || 30;
        const startDate = subDays(new Date(), daysBack).toISOString();

        const logs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) => q.eq("userId", userId).gte("date", startDate))
            .collect();

        const foods: Record<string, number> = {};

        for (const log of logs) {
            if (log.meal?.items) {
                for (const item of log.meal.items) {
                    foods[item] = (foods[item] || 0) + 1;
                }
            }
        }

        return Object.entries(foods)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    },
});

// Activity Calendar - daily activity levels
export const getActivityCalendar = query({
    args: { month: v.optional(v.number()), year: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const userId = identity.subject;
        const now = new Date();
        const month = args.month ?? now.getMonth();
        const year = args.year ?? now.getFullYear();

        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);

        const logs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) =>
                q.eq("userId", userId)
                    .gte("date", monthStart.toISOString())
                    .lte("date", monthEnd.toISOString())
            )
            .collect();

        // Group by day and calculate activity level
        const dayActivity: Record<string, { exercise: boolean; meals: number; sleep: boolean }> = {};

        for (const log of logs) {
            const day = log.date.split("T")[0];
            if (!dayActivity[day]) {
                dayActivity[day] = { exercise: false, meals: 0, sleep: false };
            }
            if (log.exercise) dayActivity[day].exercise = true;
            if (log.meal) dayActivity[day].meals++;
            if (log.sleep) dayActivity[day].sleep = true;
        }

        // Convert to array with activity levels (0-4)
        const result = [];
        for (let d = 1; d <= monthEnd.getDate(); d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const activity = dayActivity[dateStr];
            let level = 0;
            if (activity) {
                if (activity.exercise) level += 2;
                if (activity.meals > 0) level += 1;
                if (activity.sleep) level += 1;
            }
            result.push({ date: dateStr, day: d, level: Math.min(level, 4) });
        }

        return result;
    },
});

// ============================================
// HEALTH SCORE - 0-100 overall wellness score
// ============================================
export const getHealthScore = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const userId = identity.subject;
        const now = new Date();
        const weekStart = subDays(now, 7);

        const logs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) =>
                q.eq("userId", userId).gte("date", weekStart.toISOString())
            )
            .collect();

        if (logs.length === 0) return { score: 0, breakdown: { sleep: 0, exercise: 0, consistency: 0, nutrition: 0 }, trend: "stable" as const };

        // Sleep score (0-25) - based on avg hours and consistency
        const sleepLogs = logs.filter(l => l.sleep && l.sleep > 0);
        const avgSleep = sleepLogs.length > 0
            ? sleepLogs.reduce((sum, l) => sum + l.sleep!, 0) / sleepLogs.length
            : 0;
        const sleepScore = Math.min(25, Math.round((avgSleep / 8) * 25));

        // Exercise score (0-25) - based on workouts per week
        const exerciseLogs = logs.filter(l => l.exercise);
        const exerciseScore = Math.min(25, Math.round((exerciseLogs.length / 5) * 25));

        // Consistency score (0-25) - based on daily logging
        const uniqueDays = new Set(logs.map(l => l.date.split("T")[0])).size;
        const consistencyScore = Math.min(25, Math.round((uniqueDays / 7) * 25));

        // Nutrition score (0-25) - based on meals logged
        const mealLogs = logs.filter(l => l.meal);
        const nutritionScore = Math.min(25, Math.round((mealLogs.length / 21) * 25)); // 3 meals * 7 days

        const totalScore = sleepScore + exerciseScore + consistencyScore + nutritionScore;

        // Trend - compare to previous week
        const prevWeekStart = subDays(weekStart, 7);
        const prevLogs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) =>
                q.eq("userId", userId)
                    .gte("date", prevWeekStart.toISOString())
                    .lt("date", weekStart.toISOString())
            )
            .collect();

        const prevUniqueD = new Set(prevLogs.map(l => l.date.split("T")[0])).size;
        const prevScore = Math.min(100, Math.round((prevUniqueD / 7) * 100));
        const trend = totalScore > prevScore + 5 ? "up" : totalScore < prevScore - 5 ? "down" : "stable";

        return {
            score: totalScore,
            breakdown: {
                sleep: sleepScore,
                exercise: exerciseScore,
                consistency: consistencyScore,
                nutrition: nutritionScore,
            },
            trend: trend as "up" | "down" | "stable",
            avgSleep: Math.round(avgSleep * 10) / 10,
            workoutsThisWeek: exerciseLogs.length,
            daysActive: uniqueDays,
        };
    },
});

// ============================================
// AI COACH - Personalized recommendations
// ============================================
export const getAICoachAdvice = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const userId = identity.subject;
        const now = new Date();
        const weekStart = subDays(now, 7);

        const logs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) =>
                q.eq("userId", userId).gte("date", weekStart.toISOString())
            )
            .collect();

        const advice: { icon: string; title: string; message: string; priority: "high" | "medium" | "low" }[] = [];

        // Analyze patterns
        const sleepLogs = logs.filter(l => l.sleep);
        const avgSleep = sleepLogs.length > 0
            ? sleepLogs.reduce((sum, l) => sum + l.sleep!, 0) / sleepLogs.length
            : 0;
        const exerciseLogs = logs.filter(l => l.exercise);
        const highIntensity = exerciseLogs.filter(l => l.exercise?.intensity === "high");
        const consecutiveHighIntensity = highIntensity.length;

        // Sleep advice
        if (avgSleep > 0 && avgSleep < 6.5) {
            advice.push({
                icon: "😴",
                title: "Prioritize Sleep",
                message: `You're averaging ${avgSleep.toFixed(1)}h of sleep. Try to get 7-8 hours tonight for better recovery and focus.`,
                priority: "high",
            });
        }

        // Recovery advice
        if (consecutiveHighIntensity >= 3) {
            advice.push({
                icon: "🧘",
                title: "Recovery Day Recommended",
                message: `You've had ${consecutiveHighIntensity} high-intensity workouts recently. Consider active recovery or rest today.`,
                priority: "high",
            });
        }

        // Workout streak encouragement
        if (exerciseLogs.length === 0) {
            advice.push({
                icon: "🏃",
                title: "Get Moving",
                message: "No workouts logged this week yet. Even a 20-minute walk can boost your mood and energy!",
                priority: "medium",
            });
        } else if (exerciseLogs.length >= 4) {
            advice.push({
                icon: "🔥",
                title: "Great Momentum",
                message: `${exerciseLogs.length} workouts this week! Keep the momentum going.`,
                priority: "low",
            });
        }

        // Balance advice
        const uniqueDays = new Set(logs.map(l => l.date.split("T")[0])).size;
        if (uniqueDays >= 5) {
            advice.push({
                icon: "⭐",
                title: "Consistent Tracker",
                message: "You've logged activities on " + uniqueDays + " days this week. Consistency is the key to progress!",
                priority: "low",
            });
        }

        // Prediction
        const workoutsPerDay = exerciseLogs.length / 7;
        const daysRemaining = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();
        const predictedMonthly = exerciseLogs.length + Math.round(workoutsPerDay * daysRemaining);
        if (predictedMonthly >= 16) {
            advice.push({
                icon: "📈",
                title: "On Track for Goals",
                message: `At your current pace, you'll hit ${predictedMonthly} workouts this month. Great job!`,
                priority: "low",
            });
        }

        return advice.sort((a, b) => {
            const priority = { high: 0, medium: 1, low: 2 };
            return priority[a.priority] - priority[b.priority];
        }).slice(0, 3);
    },
});

// ============================================
// PREDICTIONS - Future projections
// ============================================
export const getPredictions = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const userId = identity.subject;
        const now = new Date();
        const monthStart = startOfMonth(now);
        const weekStart = subDays(now, 7);

        const [monthLogs, weekLogs] = await Promise.all([
            ctx.db.query("logs").withIndex("by_userId_date", (q) =>
                q.eq("userId", userId).gte("date", monthStart.toISOString())
            ).collect(),
            ctx.db.query("logs").withIndex("by_userId_date", (q) =>
                q.eq("userId", userId).gte("date", weekStart.toISOString())
            ).collect(),
        ]);

        const dayOfMonth = now.getDate();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const daysRemaining = daysInMonth - dayOfMonth;

        // Current stats
        const workoutsThisMonth = monthLogs.filter(l => l.exercise).length;
        const sleepLogs = weekLogs.filter(l => l.sleep);
        const avgSleep = sleepLogs.length > 0
            ? sleepLogs.reduce((sum, l) => sum + l.sleep!, 0) / sleepLogs.length
            : 0;

        // Rate calculations
        const workoutRate = workoutsThisMonth / dayOfMonth;
        const predictedWorkouts = Math.round(workoutsThisMonth + (workoutRate * daysRemaining));

        return {
            workouts: {
                current: workoutsThisMonth,
                predicted: predictedWorkouts,
                target: 16,
                onTrack: predictedWorkouts >= 16,
            },
            sleep: {
                current: Math.round(avgSleep * 10) / 10,
                target: 7.5,
                onTrack: avgSleep >= 7,
            },
            daysRemaining,
            daysInMonth,
        };
    },
});

// ============================================
// DAILY NUTRIENT BALANCE - Today's food categories
// ============================================

// Nutrient keywords mapping (inline version for Convex)
const NUTRIENT_KEYWORDS: Record<string, string[]> = {
    Protein: ["chicken", "pollo", "beef", "carne", "steak", "bife", "pork", "cerdo", "turkey", "pavo", "fish", "pescado", "salmon", "tuna", "atun", "shrimp", "egg", "huevo", "tofu", "beans", "porotos", "lentils", "lentejas", "protein", "proteina"],
    Carbs: ["rice", "arroz", "bread", "pan", "pasta", "fideos", "noodles", "oats", "avena", "cereal", "potato", "papa", "corn", "maiz", "toast", "pizza", "burger", "sandwich", "fries", "empanada", "taco", "burrito"],
    Veggies: ["salad", "ensalada", "broccoli", "spinach", "espinaca", "carrot", "zanahoria", "tomato", "tomate", "cucumber", "pepino", "lettuce", "lechuga", "pepper", "pimiento", "onion", "cebolla", "garlic", "ajo", "mushroom"],
    Fruits: ["apple", "manzana", "banana", "platano", "orange", "naranja", "strawberry", "fresa", "blueberry", "mango", "grape", "uva", "watermelon", "pineapple", "kiwi", "peach", "durazno", "pear", "pera"],
    Fats: ["avocado", "palta", "aguacate", "nuts", "nueces", "almonds", "almendras", "peanut", "mani", "butter", "manteca", "cheese", "queso", "olive oil", "aceite"],
    Sweets: ["chocolate", "ice cream", "helado", "cake", "torta", "cookie", "galleta", "candy", "donut", "pastry", "sugar", "honey", "miel"],
    Hydration: ["water", "agua", "tea", "té", "coffee", "cafe", "juice", "jugo", "smoothie", "mate"],
};

function getNutrientCategory(item: string): string {
    const lowerItem = item.toLowerCase();
    for (const [category, keywords] of Object.entries(NUTRIENT_KEYWORDS)) {
        for (const keyword of keywords) {
            if (lowerItem.includes(keyword)) {
                return category;
            }
        }
    }
    return "Other";
}

export const getDailyNutrientBalance = query({
    args: { date: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const userId = identity.subject;
        const targetDate = args.date || new Date().toISOString().split('T')[0];

        const logs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) =>
                q.eq("userId", userId).gte("date", targetDate)
            )
            .collect();

        // Filter to just today
        const todayLogs = logs.filter(l => l.date.startsWith(targetDate));

        const nutrients: Record<string, number> = {
            Protein: 0, Carbs: 0, Veggies: 0, Fruits: 0, Fats: 0, Sweets: 0, Hydration: 0, Other: 0
        };

        let totalItems = 0;

        for (const log of todayLogs) {
            if (log.meal?.items) {
                for (const item of log.meal.items) {
                    const category = getNutrientCategory(item);
                    nutrients[category]++;
                    totalItems++;
                }
            }
            if (log.water && log.water > 0) {
                nutrients.Hydration += Math.ceil(log.water / 0.5); // Count each 500ml as 1
            }
        }

        // Calculate balance status
        const getStatus = (count: number, target: number) => {
            if (count === 0) return "missing";
            if (count >= target) return "good";
            return "low";
        };

        return {
            nutrients: [
                { category: "Protein", count: nutrients.Protein, emoji: "🥩", status: getStatus(nutrients.Protein, 2), target: 2 },
                { category: "Carbs", count: nutrients.Carbs, emoji: "🍞", status: getStatus(nutrients.Carbs, 2), target: 2 },
                { category: "Veggies", count: nutrients.Veggies, emoji: "🥬", status: getStatus(nutrients.Veggies, 3), target: 3 },
                { category: "Fruits", count: nutrients.Fruits, emoji: "🍎", status: getStatus(nutrients.Fruits, 2), target: 2 },
                { category: "Fats", count: nutrients.Fats, emoji: "🥑", status: getStatus(nutrients.Fats, 1), target: 1 },
                { category: "Sweets", count: nutrients.Sweets, emoji: "🍫", status: nutrients.Sweets > 2 ? "high" : "good", target: 2 },
                { category: "Hydration", count: nutrients.Hydration, emoji: "💧", status: getStatus(nutrients.Hydration, 4), target: 4 },
            ],
            totalItems,
            mealsLogged: todayLogs.filter(l => l.meal).length,
        };
    },
});

// ============================================
// CORRELATIONS - Pattern discovery
// ============================================
export const getCorrelations = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const userId = identity.subject;
        const startDate = subDays(new Date(), 30).toISOString();

        const logs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) => q.eq("userId", userId).gte("date", startDate))
            .collect();

        if (logs.length < 7) return []; // Need at least a week of data

        const correlations: { icon: string; title: string; insight: string; confidence: number }[] = [];

        // Group logs by date
        const byDate: Record<string, typeof logs> = {};
        for (const log of logs) {
            const date = log.date.split('T')[0];
            if (!byDate[date]) byDate[date] = [];
            byDate[date].push(log);
        }

        const dates = Object.keys(byDate).sort();

        // Analysis 1: Sleep → Next day exercise correlation
        let goodSleepWorkoutDays = 0;
        let badSleepWorkoutDays = 0;
        let goodSleepDays = 0;
        let badSleepDays = 0;

        for (let i = 0; i < dates.length - 1; i++) {
            const todayLogs = byDate[dates[i]];
            const tomorrowLogs = byDate[dates[i + 1]];
            const sleep = todayLogs.find(l => l.sleep)?.sleep || 0;
            const hasWorkoutTomorrow = tomorrowLogs?.some(l => l.exercise);

            if (sleep >= 7) {
                goodSleepDays++;
                if (hasWorkoutTomorrow) goodSleepWorkoutDays++;
            } else if (sleep > 0) {
                badSleepDays++;
                if (hasWorkoutTomorrow) badSleepWorkoutDays++;
            }
        }

        if (goodSleepDays >= 3 && badSleepDays >= 3) {
            const goodSleepWorkoutRate = goodSleepWorkoutDays / goodSleepDays;
            const badSleepWorkoutRate = badSleepWorkoutDays / badSleepDays;

            if (goodSleepWorkoutRate > badSleepWorkoutRate * 1.3) {
                correlations.push({
                    icon: "😴",
                    title: "Sleep & Exercise Link",
                    insight: `When you sleep 7+ hours, you exercise ${Math.round((goodSleepWorkoutRate - badSleepWorkoutRate) * 100)}% more the next day`,
                    confidence: Math.min(0.9, 0.5 + (goodSleepDays + badSleepDays) / 30),
                });
            }
        }

        // Analysis 2: Best workout days
        const dayOfWeekCounts: Record<number, { workouts: number; total: number }> = {};
        for (const date of dates) {
            const dayOfWeek = new Date(date).getDay();
            if (!dayOfWeekCounts[dayOfWeek]) dayOfWeekCounts[dayOfWeek] = { workouts: 0, total: 0 };
            dayOfWeekCounts[dayOfWeek].total++;
            if (byDate[date].some(l => l.exercise)) {
                dayOfWeekCounts[dayOfWeek].workouts++;
            }
        }

        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        let bestDay = -1;
        let bestRate = 0;

        for (const [day, counts] of Object.entries(dayOfWeekCounts)) {
            if (counts.total >= 2) {
                const rate = counts.workouts / counts.total;
                if (rate > bestRate) {
                    bestRate = rate;
                    bestDay = parseInt(day);
                }
            }
        }

        if (bestDay >= 0 && bestRate > 0.5) {
            correlations.push({
                icon: "📅",
                title: "Best Workout Day",
                insight: `You exercise most often on ${dayNames[bestDay]}s (${Math.round(bestRate * 100)}% of the time)`,
                confidence: 0.7,
            });
        }

        // Analysis 3: Meal logging consistency
        const daysWithMeals = dates.filter(d => byDate[d].some(l => l.meal)).length;
        const mealConsistency = daysWithMeals / dates.length;

        if (mealConsistency >= 0.7) {
            correlations.push({
                icon: "🍽️",
                title: "Great Meal Tracking",
                insight: `You log meals ${Math.round(mealConsistency * 100)}% of days. Keep it up!`,
                confidence: 0.8,
            });
        } else if (mealConsistency < 0.3) {
            correlations.push({
                icon: "📝",
                title: "Improve Meal Tracking",
                insight: "Log meals more consistently to get better nutrition insights",
                confidence: 0.6,
            });
        }

        return correlations.slice(0, 3); // Return top 3
    },
});

// ============================================
// NUTRITION SUGGESTIONS - Context-aware advice
// ============================================
export const getNutritionSuggestions = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const userId = identity.subject;
        const today = new Date().toISOString().split('T')[0];

        // Get today's logs and user profile
        const [todayLogs, profile] = await Promise.all([
            ctx.db.query("logs").withIndex("by_userId_date", (q) =>
                q.eq("userId", userId).gte("date", today)
            ).collect(),
            ctx.db.query("userProfile").withIndex("by_user", (q) =>
                q.eq("userId", userId)
            ).first(),
        ]);

        const suggestions: { icon: string; title: string; message: string; priority: "high" | "medium" | "low" }[] = [];

        // Analyze today's nutrients
        const nutrients: Record<string, number> = {
            Protein: 0, Carbs: 0, Veggies: 0, Fruits: 0, Fats: 0, Sweets: 0, Hydration: 0
        };

        let hasExerciseToday = false;

        for (const log of todayLogs.filter(l => l.date.startsWith(today))) {
            if (log.meal?.items) {
                for (const item of log.meal.items) {
                    const category = getNutrientCategory(item);
                    nutrients[category]++;
                }
            }
            if (log.water) nutrients.Hydration += Math.ceil(log.water / 0.5);
            if (log.exercise) hasExerciseToday = true;
        }

        const totalFood = nutrients.Protein + nutrients.Carbs + nutrients.Veggies + nutrients.Fruits + nutrients.Fats + nutrients.Sweets;

        // Suggestion 1: Low protein
        if (totalFood >= 2 && nutrients.Protein === 0) {
            suggestions.push({
                icon: "🥩",
                title: "Add Some Protein",
                message: "You haven't had protein today. Try eggs, chicken, fish, or beans.",
                priority: "high",
            });
        }

        // Suggestion 2: Low veggies
        if (totalFood >= 3 && nutrients.Veggies === 0) {
            suggestions.push({
                icon: "🥬",
                title: "Add Vegetables",
                message: "Include some veggies for fiber and vitamins. A salad or steamed broccoli works great.",
                priority: "medium",
            });
        }

        // Suggestion 3: Post-workout protein
        if (hasExerciseToday && nutrients.Protein < 2) {
            suggestions.push({
                icon: "💪",
                title: "Post-Workout Protein",
                message: "After exercising, protein helps with recovery. Consider a protein-rich snack.",
                priority: "high",
            });
        }

        // Suggestion 4: Too many sweets
        if (nutrients.Sweets >= 3) {
            suggestions.push({
                icon: "🍫",
                title: "Watch the Sweets",
                message: "You've had quite a bit of sugar today. Try fruit for your next sweet craving.",
                priority: "medium",
            });
        }

        // Suggestion 5: Hydration reminder
        const hour = new Date().getHours();
        if (hour >= 12 && nutrients.Hydration < 3) {
            suggestions.push({
                icon: "💧",
                title: "Stay Hydrated",
                message: "Make sure to drink enough water throughout the day.",
                priority: "low",
            });
        }

        // Suggestion 6: Great balance
        if (nutrients.Protein >= 2 && nutrients.Veggies >= 2 && nutrients.Carbs >= 1 && nutrients.Fruits >= 1) {
            suggestions.push({
                icon: "✨",
                title: "Great Balance!",
                message: "You've hit multiple nutrient categories today. Keep it up!",
                priority: "low",
            });
        }

        // Profile-aware suggestions
        if (profile?.weight && profile.weight > 80 && hasExerciseToday) {
            // Higher protein recommendation for heavier active users
            suggestions.push({
                icon: "🏋️",
                title: "Protein for Recovery",
                message: "At your activity level, aim for protein with each meal for optimal recovery.",
                priority: "medium",
            });
        }

        // Sort by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        return suggestions.slice(0, 3);
    },
});
