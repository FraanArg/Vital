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
