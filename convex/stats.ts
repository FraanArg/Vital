import { query } from "./_generated/server";
import { v } from "convex/values";
import { subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, format, parseISO } from "date-fns";

// Comprehensive food categorization keywords (English + Spanish)
const FOOD_KEYWORDS: Record<string, string[]> = {
    Protein: [
        // Meats
        "chicken", "pollo", "beef", "carne", "steak", "bife", "pork", "cerdo", "turkey", "pavo",
        "lamb", "cordero", "bacon", "panceta", "ham", "jamon", "jamón", "sausage", "salchicha",
        "milanesa", "asado", "chorizo", "bondiola", "lomo",
        // Fish & Seafood
        "fish", "pescado", "salmon", "salmón", "tuna", "atun", "atún", "shrimp", "camarón", "camaron",
        "merluza", "tilapia", "surimi",
        // Eggs & Dairy proteins
        "egg", "huevo", "eggs", "huevos", "omelette", "omelet", "revuelto",
        "yogurt", "yogur", "proteico", "proteina", "proteína", "protein",
        // Plant proteins
        "tofu", "tempeh", "seitan", "beans", "porotos", "frijoles", "lentils", "lentejas",
        "chickpeas", "garbanzos", "edamame",
    ],
    Carbs: [
        // Grains
        "rice", "arroz", "bread", "pan", "pasta", "fideos", "noodles", "spaghetti",
        "oats", "avena", "cereal", "quinoa", "couscous", "granola", "muesli",
        // Starchy
        "potato", "papa", "patata", "sweet potato", "batata", "corn", "maiz", "maíz", "choclo",
        // Baked goods
        "toast", "tostada", "tostado", "bagel", "croissant", "medialuna", "tortilla", "arepa",
        "pancake", "panqueque", "hotcake", "waffle", "crepe", "crepes",
        "pizza", "burger", "hamburguesa", "sandwich", "sanguche", "sándwich",
        "fries", "papas fritas", "empanada", "taco", "burrito", "wrap",
        "galleta", "galletitas", "crackers", "biscuit",
    ],
    Veggies: [
        "salad", "ensalada", "broccoli", "brocoli", "brócoli", "spinach", "espinaca",
        "carrot", "zanahoria", "tomato", "tomate", "cucumber", "pepino", "lettuce", "lechuga",
        "pepper", "pimiento", "morron", "morrón", "onion", "cebolla", "garlic", "ajo",
        "mushroom", "hongo", "champiñon", "champiñón", "zucchini", "calabacin", "calabacín",
        "eggplant", "berenjena", "celery", "apio", "asparagus", "espárrago",
        "cauliflower", "coliflor", "kale", "acelga", "cabbage", "repollo",
        "green beans", "judias", "chaucha", "peas", "arvejas", "guisantes",
        "radish", "rabano", "rábano", "verdura", "verduras", "vegetales",
    ],
    Fruits: [
        "apple", "manzana", "banana", "plátano", "platano", "orange", "naranja",
        "strawberry", "fresa", "frutilla", "frutillas", "blueberry", "arandano", "arándano",
        "mango", "grape", "uva", "uvas", "watermelon", "sandia", "sandía", "melon", "melón",
        "pineapple", "piña", "anana", "ananá", "kiwi", "peach", "durazno", "pear", "pera",
        "cherry", "cereza", "raspberry", "frambuesa", "blackberry", "mora",
        "papaya", "coconut", "coco", "lemon", "limon", "limón", "lime", "lima",
        "mandarin", "mandarina", "pomelo", "grapefruit", "fruta", "frutas",
        "exprimido", "exprimida", // for juices like "naranja exprimida"
    ],
    Fats: [
        "avocado", "palta", "aguacate", "nuts", "nueces", "almonds", "almendras",
        "peanut", "mani", "maní", "cacahuate", "walnut", "olive oil", "aceite",
        "butter", "manteca", "mantequilla", "coconut oil", "cream", "crema",
        "cheese", "queso", "chia", "flaxseed", "linaza", "seeds", "semillas",
    ],
    Sweets: [
        "chocolate", "ice cream", "helado", "cake", "torta", "pastel", "cookie", "galleta dulce",
        "candy", "caramelo", "donut", "dona", "pastry", "factura", "pie", "tarta",
        "brownie", "cupcake", "muffin", "cheesecake", "flan", "pudding", "dulce",
        "sugar", "azucar", "azúcar", "honey", "miel", "jam", "mermelada",
        "alfajor", "postre", "dessert",
    ],
    Drinks: [
        "water", "agua", "tea", "té", "coffee", "cafe", "café", "juice", "jugo",
        "smoothie", "licuado", "batido", "mate", "terere", "tereré",
        "soda", "gaseosa", "lemonade", "limonada", "milk", "leche",
        "cerveza", "beer", "wine", "vino", "cocktail",
    ],
};

function categorizeFood(foodName: string): string {
    const lowerFood = foodName.toLowerCase();
    for (const [category, keywords] of Object.entries(FOOD_KEYWORDS)) {
        for (const keyword of keywords) {
            if (lowerFood.includes(keyword)) {
                return category;
            }
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

// Use the same comprehensive keywords as FOOD_KEYWORDS for consistency
function getNutrientCategory(item: string): string {
    const lowerItem = item.toLowerCase();

    // Check each category with comprehensive keywords
    const nutrientMap: Record<string, string[]> = {
        Protein: ["chicken", "pollo", "beef", "carne", "steak", "bife", "pork", "cerdo", "turkey", "pavo", "lamb", "cordero", "bacon", "panceta", "ham", "jamon", "jamón", "sausage", "salchicha", "milanesa", "asado", "chorizo", "bondiola", "lomo", "fish", "pescado", "salmon", "salmón", "tuna", "atun", "atún", "shrimp", "camarón", "camaron", "merluza", "tilapia", "surimi", "egg", "huevo", "eggs", "huevos", "omelette", "omelet", "revuelto", "yogurt", "yogur", "proteico", "proteina", "proteína", "protein", "tofu", "tempeh", "seitan", "beans", "porotos", "frijoles", "lentils", "lentejas", "chickpeas", "garbanzos", "edamame"],
        Carbs: ["rice", "arroz", "bread", "pan", "pasta", "fideos", "noodles", "spaghetti", "oats", "avena", "cereal", "quinoa", "couscous", "granola", "muesli", "potato", "papa", "patata", "sweet potato", "batata", "corn", "maiz", "maíz", "choclo", "toast", "tostada", "tostado", "bagel", "croissant", "medialuna", "tortilla", "arepa", "pancake", "panqueque", "hotcake", "waffle", "crepe", "crepes", "pizza", "burger", "hamburguesa", "sandwich", "sanguche", "sándwich", "fries", "papas fritas", "empanada", "taco", "burrito", "wrap", "galleta", "galletitas", "crackers", "biscuit"],
        Veggies: ["salad", "ensalada", "broccoli", "brocoli", "brócoli", "spinach", "espinaca", "carrot", "zanahoria", "tomato", "tomate", "cucumber", "pepino", "lettuce", "lechuga", "pepper", "pimiento", "morron", "morrón", "onion", "cebolla", "garlic", "ajo", "mushroom", "hongo", "champiñon", "champiñón", "zucchini", "calabacin", "calabacín", "eggplant", "berenjena", "celery", "apio", "asparagus", "espárrago", "cauliflower", "coliflor", "kale", "acelga", "cabbage", "repollo", "green beans", "judias", "chaucha", "peas", "arvejas", "guisantes", "radish", "rabano", "rábano", "verdura", "verduras", "vegetales"],
        Fruits: ["apple", "manzana", "banana", "plátano", "platano", "orange", "naranja", "strawberry", "fresa", "frutilla", "frutillas", "blueberry", "arandano", "arándano", "mango", "grape", "uva", "uvas", "watermelon", "sandia", "sandía", "melon", "melón", "pineapple", "piña", "anana", "ananá", "kiwi", "peach", "durazno", "pear", "pera", "cherry", "cereza", "raspberry", "frambuesa", "blackberry", "mora", "papaya", "coconut", "coco", "lemon", "limon", "limón", "lime", "lima", "mandarin", "mandarina", "pomelo", "grapefruit", "fruta", "frutas", "exprimido", "exprimida"],
        Fats: ["avocado", "palta", "aguacate", "nuts", "nueces", "almonds", "almendras", "peanut", "mani", "maní", "cacahuate", "walnut", "olive oil", "aceite", "butter", "manteca", "mantequilla", "coconut oil", "cream", "crema", "cheese", "queso", "chia", "flaxseed", "linaza", "seeds", "semillas"],
        Sweets: ["chocolate", "ice cream", "helado", "cake", "torta", "pastel", "cookie", "galleta dulce", "candy", "caramelo", "donut", "dona", "pastry", "factura", "pie", "tarta", "brownie", "cupcake", "muffin", "cheesecake", "flan", "pudding", "dulce", "sugar", "azucar", "azúcar", "honey", "miel", "jam", "mermelada", "alfajor", "postre", "dessert"],
        Hydration: ["water", "agua", "tea", "té", "coffee", "cafe", "café", "juice", "jugo", "smoothie", "licuado", "batido", "mate", "terere", "tereré", "soda", "gaseosa", "lemonade", "limonada", "milk", "leche"],
    };

    for (const [category, keywords] of Object.entries(nutrientMap)) {
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

// ============================================
// ADVANCED CORRELATIONS - Deep pattern analysis
// ============================================
export const getAdvancedCorrelations = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const userId = identity.subject;
        const startDate = subDays(new Date(), 60).toISOString(); // 60 days of data

        const logs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) => q.eq("userId", userId).gte("date", startDate))
            .collect();

        if (logs.length < 14) return []; // Need at least 2 weeks of data

        const correlations: {
            icon: string;
            title: string;
            insight: string;
            impact: string;
            confidence: number;
            category: "mood" | "sleep" | "exercise" | "nutrition";
        }[] = [];

        // Group logs by date
        const byDate: Record<string, typeof logs> = {};
        for (const log of logs) {
            const date = log.date.split('T')[0];
            if (!byDate[date]) byDate[date] = [];
            byDate[date].push(log);
        }

        const dates = Object.keys(byDate).sort();

        // ========================================
        // Correlation 1: Mood ↔ Exercise
        // ========================================
        const exerciseDays: number[] = [];
        const noExerciseDays: number[] = [];

        for (const date of dates) {
            const dayLogs = byDate[date];
            const mood = dayLogs.find(l => l.mood)?.mood;
            const hasExercise = dayLogs.some(l => l.exercise);

            if (mood) {
                if (hasExercise) {
                    exerciseDays.push(mood);
                } else {
                    noExerciseDays.push(mood);
                }
            }
        }

        if (exerciseDays.length >= 5 && noExerciseDays.length >= 5) {
            const avgExerciseMood = exerciseDays.reduce((a, b) => a + b, 0) / exerciseDays.length;
            const avgNoExerciseMood = noExerciseDays.reduce((a, b) => a + b, 0) / noExerciseDays.length;
            const moodDiff = avgExerciseMood - avgNoExerciseMood;
            const moodDiffPercent = Math.round((moodDiff / avgNoExerciseMood) * 100);

            if (Math.abs(moodDiffPercent) >= 10) {
                correlations.push({
                    icon: moodDiff > 0 ? "😊" : "😔",
                    title: "Mood & Exercise",
                    insight: moodDiff > 0
                        ? `Your mood is ${moodDiffPercent}% better on days you exercise`
                        : `Your mood drops ${Math.abs(moodDiffPercent)}% on exercise days (might need recovery)`,
                    impact: moodDiff > 0 ? "positive" : "negative",
                    confidence: Math.min(0.9, 0.5 + (exerciseDays.length + noExerciseDays.length) / 40),
                    category: "mood",
                });
            }
        }

        // ========================================
        // Correlation 2: Sleep Duration ↔ Dinner Time
        // ========================================
        const earlyDinnerSleep: number[] = [];
        const lateDinnerSleep: number[] = [];

        for (let i = 0; i < dates.length - 1; i++) {
            const todayLogs = byDate[dates[i]];
            const tomorrowLogs = byDate[dates[i + 1]];

            // Find dinner (evening meal)
            const dinner = todayLogs.find(l => l.meal?.type === "dinner" || l.meal?.type === "cena");
            const sleep = tomorrowLogs?.find(l => l.sleep)?.sleep;

            if (dinner?.meal?.time && sleep) {
                const dinnerHour = parseInt(dinner.meal.time.split(':')[0]);
                if (dinnerHour < 20) {
                    earlyDinnerSleep.push(sleep);
                } else {
                    lateDinnerSleep.push(sleep);
                }
            }
        }

        if (earlyDinnerSleep.length >= 3 && lateDinnerSleep.length >= 3) {
            const avgEarlySleep = earlyDinnerSleep.reduce((a, b) => a + b, 0) / earlyDinnerSleep.length;
            const avgLateSleep = lateDinnerSleep.reduce((a, b) => a + b, 0) / lateDinnerSleep.length;
            const sleepDiff = avgEarlySleep - avgLateSleep;
            const sleepDiffMins = Math.round(sleepDiff * 60);

            if (Math.abs(sleepDiffMins) >= 15) {
                correlations.push({
                    icon: sleepDiff > 0 ? "🌙" : "⏰",
                    title: "Dinner & Sleep",
                    insight: sleepDiff > 0
                        ? `You sleep ${sleepDiffMins} minutes longer when eating dinner before 8pm`
                        : `Late dinners are associated with ${Math.abs(sleepDiffMins)} mins less sleep`,
                    impact: sleepDiff > 0 ? "positive" : "negative",
                    confidence: Math.min(0.85, 0.4 + (earlyDinnerSleep.length + lateDinnerSleep.length) / 20),
                    category: "sleep",
                });
            }
        }

        // ========================================
        // Correlation 3: Sleep Quality → Next Day Exercise
        // ========================================
        let goodSleepExercise = 0, goodSleepTotal = 0;
        let badSleepExercise = 0, badSleepTotal = 0;

        for (let i = 0; i < dates.length - 1; i++) {
            const todayLogs = byDate[dates[i]];
            const tomorrowLogs = byDate[dates[i + 1]];
            const sleep = todayLogs.find(l => l.sleep)?.sleep || 0;
            const nextDayExercise = tomorrowLogs?.some(l => l.exercise);

            if (sleep >= 7) {
                goodSleepTotal++;
                if (nextDayExercise) goodSleepExercise++;
            } else if (sleep > 0 && sleep < 6) {
                badSleepTotal++;
                if (nextDayExercise) badSleepExercise++;
            }
        }

        if (goodSleepTotal >= 5 && badSleepTotal >= 3) {
            const goodSleepRate = (goodSleepExercise / goodSleepTotal) * 100;
            const badSleepRate = (badSleepExercise / badSleepTotal) * 100;
            const rateDiff = goodSleepRate - badSleepRate;

            if (rateDiff > 15) {
                correlations.push({
                    icon: "💪",
                    title: "Sleep & Exercise",
                    insight: `After sleeping 7+ hours, you're ${Math.round(rateDiff)}% more likely to exercise the next day`,
                    impact: "positive",
                    confidence: Math.min(0.85, 0.5 + (goodSleepTotal + badSleepTotal) / 30),
                    category: "exercise",
                });
            }
        }

        // ========================================
        // Correlation 4: Hydration → Mood
        // ========================================
        const highWaterMood: number[] = [];
        const lowWaterMood: number[] = [];

        for (const date of dates) {
            const dayLogs = byDate[date];
            const totalWater = dayLogs.reduce((sum, l) => sum + (l.water || 0), 0);
            const mood = dayLogs.find(l => l.mood)?.mood;

            if (mood) {
                if (totalWater >= 2) {
                    highWaterMood.push(mood);
                } else if (totalWater > 0 && totalWater < 1.5) {
                    lowWaterMood.push(mood);
                }
            }
        }

        if (highWaterMood.length >= 5 && lowWaterMood.length >= 5) {
            const avgHighWater = highWaterMood.reduce((a, b) => a + b, 0) / highWaterMood.length;
            const avgLowWater = lowWaterMood.reduce((a, b) => a + b, 0) / lowWaterMood.length;
            const moodDiff = avgHighWater - avgLowWater;

            if (moodDiff > 0.3) {
                correlations.push({
                    icon: "💧",
                    title: "Hydration & Mood",
                    insight: `Your mood is ${Math.round((moodDiff / avgLowWater) * 100)}% higher on well-hydrated days (2L+)`,
                    impact: "positive",
                    confidence: Math.min(0.8, 0.4 + (highWaterMood.length + lowWaterMood.length) / 30),
                    category: "mood",
                });
            }
        }

        // ========================================
        // Correlation 5: Best Days for Exercise
        // ========================================
        const dayStats: Record<number, { exercises: number; total: number }> = {};
        for (const date of dates) {
            const dayOfWeek = new Date(date).getDay();
            if (!dayStats[dayOfWeek]) dayStats[dayOfWeek] = { exercises: 0, total: 0 };
            dayStats[dayOfWeek].total++;
            if (byDate[date].some(l => l.exercise)) {
                dayStats[dayOfWeek].exercises++;
            }
        }

        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        let bestDay = -1, bestRate = 0, worstDay = -1, worstRate = 1;

        for (const [day, stats] of Object.entries(dayStats)) {
            if (stats.total >= 4) {
                const rate = stats.exercises / stats.total;
                if (rate > bestRate) { bestRate = rate; bestDay = parseInt(day); }
                if (rate < worstRate) { worstRate = rate; worstDay = parseInt(day); }
            }
        }

        if (bestDay >= 0 && bestRate > 0.4) {
            correlations.push({
                icon: "📅",
                title: "Best Workout Day",
                insight: `${dayNames[bestDay]} is your power day - you exercise ${Math.round(bestRate * 100)}% of the time`,
                impact: "positive",
                confidence: 0.75,
                category: "exercise",
            });
        }

        // Sort by confidence
        correlations.sort((a, b) => b.confidence - a.confidence);
        return correlations.slice(0, 5);
    },
});

// ============================================
// MEAL SUGGESTIONS - Personalized meal ideas
// ============================================
export const getMealSuggestions = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const userId = identity.subject;
        const weekStart = subDays(new Date(), 7).toISOString();
        const today = new Date().toISOString().split('T')[0];

        const [weekLogs, todayLogs] = await Promise.all([
            ctx.db.query("logs").withIndex("by_userId_date", (q) =>
                q.eq("userId", userId).gte("date", weekStart)
            ).collect(),
            ctx.db.query("logs").withIndex("by_userId_date", (q) =>
                q.eq("userId", userId).gte("date", today)
            ).collect(),
        ]);

        const suggestions: {
            icon: string;
            title: string;
            message: string;
            type: "nutrient" | "timing" | "variety";
            foods?: string[];
        }[] = [];

        // Analyze weekly nutrients
        const weekNutrients: Record<string, number> = {
            Protein: 0, Carbs: 0, Veggies: 0, Fruits: 0, Fats: 0
        };

        for (const log of weekLogs) {
            if (log.meal?.items) {
                for (const item of log.meal.items) {
                    const category = categorizeFood(item);
                    if (weekNutrients[category] !== undefined) {
                        weekNutrients[category]++;
                    }
                }
            }
        }

        const totalItems = Object.values(weekNutrients).reduce((a, b) => a + b, 0);

        // Low protein week
        if (totalItems >= 10 && weekNutrients.Protein < totalItems * 0.15) {
            suggestions.push({
                icon: "🥩",
                title: "Low Protein Week",
                message: "Your protein intake was low this week. Try adding more eggs, chicken, fish, or legumes.",
                type: "nutrient",
                foods: ["Eggs", "Chicken", "Salmon", "Lentils", "Greek Yogurt"],
            });
        }

        // Low veggies
        if (totalItems >= 10 && weekNutrients.Veggies < totalItems * 0.2) {
            suggestions.push({
                icon: "🥬",
                title: "More Veggies Needed",
                message: "Add more vegetables for fiber and vitamins. They help with digestion and energy.",
                type: "nutrient",
                foods: ["Salad", "Broccoli", "Spinach", "Carrots", "Bell Peppers"],
            });
        }

        // Low fruits
        if (totalItems >= 10 && weekNutrients.Fruits < 5) {
            suggestions.push({
                icon: "🍎",
                title: "Fruit Boost",
                message: "Fruits are great for natural energy and vitamins. Try adding some as snacks.",
                type: "nutrient",
                foods: ["Banana", "Apple", "Berries", "Orange", "Mango"],
            });
        }

        // Time-based suggestions
        const hour = new Date().getHours();
        const todayMeals = todayLogs.filter(l => l.date.startsWith(today) && l.meal);

        if (hour >= 7 && hour < 11 && !todayMeals.some(m => ["breakfast", "desayuno"].includes(m.meal?.type || ""))) {
            suggestions.push({
                icon: "🌅",
                title: "Breakfast Time",
                message: "Start your day with a balanced breakfast for sustained energy.",
                type: "timing",
                foods: ["Oatmeal", "Eggs", "Toast", "Yogurt", "Fruit"],
            });
        }

        if (hour >= 12 && hour < 15 && !todayMeals.some(m => ["lunch", "almuerzo"].includes(m.meal?.type || ""))) {
            suggestions.push({
                icon: "☀️",
                title: "Lunch Time",
                message: "It's midday - fuel up with a protein-rich lunch.",
                type: "timing",
                foods: ["Chicken Salad", "Rice Bowl", "Sandwich", "Soup"],
            });
        }

        if (hour >= 19 && hour < 22 && !todayMeals.some(m => ["dinner", "cena"].includes(m.meal?.type || ""))) {
            suggestions.push({
                icon: "🌙",
                title: "Dinner Time",
                message: "Don't forget dinner! Eating before 8pm may help with sleep quality.",
                type: "timing",
                foods: ["Grilled Fish", "Pasta", "Stir Fry", "Salad"],
            });
        }

        // Variety suggestion - if eating same things repeatedly
        const itemCounts: Record<string, number> = {};
        for (const log of weekLogs) {
            if (log.meal?.items) {
                for (const item of log.meal.items) {
                    const lower = item.toLowerCase();
                    itemCounts[lower] = (itemCounts[lower] || 0) + 1;
                }
            }
        }

        const repetitive = Object.entries(itemCounts).filter(([_, count]) => count >= 5);
        if (repetitive.length >= 2) {
            suggestions.push({
                icon: "🔄",
                title: "Mix It Up",
                message: `You've had ${repetitive[0][0]} ${repetitive[0][1]}x this week. Try some variety for better nutrition!`,
                type: "variety",
            });
        }

        return suggestions.slice(0, 4);
    },
});

// ============================================
// SMART REMINDERS - Pattern-based suggestions
// ============================================
export const getSmartReminders = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const userId = identity.subject;
        const twoWeeksAgo = subDays(new Date(), 14).toISOString();
        const today = new Date().toISOString().split('T')[0];

        const [recentLogs, todayLogs] = await Promise.all([
            ctx.db.query("logs").withIndex("by_userId_date", (q) =>
                q.eq("userId", userId).gte("date", twoWeeksAgo)
            ).collect(),
            ctx.db.query("logs").withIndex("by_userId_date", (q) =>
                q.eq("userId", userId).gte("date", today)
            ).collect(),
        ]);

        const reminders: {
            icon: string;
            title: string;
            message: string;
            priority: "high" | "medium" | "low";
        }[] = [];

        const currentHour = new Date().getHours();

        // Analyze typical logging patterns
        const waterTimes: number[] = [];
        const mealTimes: Record<string, number[]> = {
            breakfast: [], lunch: [], dinner: []
        };

        for (const log of recentLogs) {
            if (log.water && log.water > 0) {
                const logHour = new Date(log.date).getHours();
                waterTimes.push(logHour);
            }
            if (log.meal?.time) {
                const mealHour = parseInt(log.meal.time.split(':')[0]);
                const mealType = log.meal.type.toLowerCase();
                if (mealType.includes("breakfast") || mealType.includes("desayuno")) {
                    mealTimes.breakfast.push(mealHour);
                } else if (mealType.includes("lunch") || mealType.includes("almuerzo")) {
                    mealTimes.lunch.push(mealHour);
                } else if (mealType.includes("dinner") || mealType.includes("cena")) {
                    mealTimes.dinner.push(mealHour);
                }
            }
        }

        // Water reminder
        const todayWater = todayLogs.filter(l => l.date.startsWith(today)).reduce((sum, l) => sum + (l.water || 0), 0);
        if (currentHour >= 12 && todayWater < 1) {
            reminders.push({
                icon: "💧",
                title: "Hydration Check",
                message: "You haven't logged much water today. Stay hydrated!",
                priority: "medium",
            });
        }

        // Meal reminders based on typical times
        const todayMeals = todayLogs.filter(l => l.date.startsWith(today) && l.meal);

        if (mealTimes.breakfast.length >= 3) {
            const avgBreakfastHour = Math.round(mealTimes.breakfast.reduce((a, b) => a + b, 0) / mealTimes.breakfast.length);
            if (currentHour >= avgBreakfastHour && currentHour < avgBreakfastHour + 3) {
                if (!todayMeals.some(m => ["breakfast", "desayuno"].includes(m.meal?.type?.toLowerCase() || ""))) {
                    reminders.push({
                        icon: "🌅",
                        title: "Breakfast Time",
                        message: `You usually have breakfast around ${avgBreakfastHour}:00. Don't forget to log it!`,
                        priority: "low",
                    });
                }
            }
        }

        if (mealTimes.dinner.length >= 3) {
            const avgDinnerHour = Math.round(mealTimes.dinner.reduce((a, b) => a + b, 0) / mealTimes.dinner.length);
            if (currentHour >= avgDinnerHour && currentHour < 23) {
                if (!todayMeals.some(m => ["dinner", "cena"].includes(m.meal?.type?.toLowerCase() || ""))) {
                    reminders.push({
                        icon: "🌙",
                        title: "Dinner Reminder",
                        message: `It's past your usual dinner time (${avgDinnerHour}:00). Have you eaten?`,
                        priority: "low",
                    });
                }
            }
        }

        // Exercise day reminder
        const recentExerciseDays = recentLogs.filter(l => l.exercise).map(l => new Date(l.date).getDay());
        const currentDayOfWeek = new Date().getDay();
        const exerciseOnThisDay = recentExerciseDays.filter(d => d === currentDayOfWeek).length;

        if (exerciseOnThisDay >= 2 && currentHour >= 16) {
            const todayExercise = todayLogs.some(l => l.date.startsWith(today) && l.exercise);
            if (!todayExercise) {
                reminders.push({
                    icon: "💪",
                    title: "Workout Day",
                    message: "You often exercise on this day. Time to get moving?",
                    priority: "low",
                });
            }
        }

        // Sort by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        reminders.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        return reminders.slice(0, 3);
    },
});

// ============================================
// SLEEP DEBT CALCULATOR
// ============================================
export const getSleepDebt = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const userId = identity.subject;
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();

        const logs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) => q.eq("userId", userId).gte("date", weekStart))
            .collect();

        const TARGET_HOURS = 8; // Could be from user profile later
        const daysInWeek = Math.min(7, Math.floor((Date.now() - new Date(weekStart).getTime()) / (1000 * 60 * 60 * 24)) + 1);

        const targetTotal = TARGET_HOURS * daysInWeek;
        const actualTotal = logs.reduce((sum, log) => sum + (log.sleep || 0), 0);
        const debt = targetTotal - actualTotal;

        let status: "on_track" | "slight_debt" | "significant_debt" | "surplus";
        if (debt <= 0) status = "surplus";
        else if (debt <= 2) status = "on_track";
        else if (debt <= 5) status = "slight_debt";
        else status = "significant_debt";

        return {
            targetPerNight: TARGET_HOURS,
            targetTotal,
            actualTotal: Math.round(actualTotal * 10) / 10,
            debt: Math.round(debt * 10) / 10,
            daysTracked: daysInWeek,
            status,
        };
    },
});

// ============================================
// EXERCISE PERSONAL RECORDS
// ============================================
export const getExercisePRs = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return {};

        const userId = identity.subject;

        // Get all exercise logs
        const logs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) => q.eq("userId", userId))
            .collect();

        // Build PR map: { exerciseName: { maxWeight, maxReps, date } }
        const prs: Record<string, { maxWeight: number; maxReps: number; date: string }> = {};

        for (const log of logs) {
            if (log.exercise?.workout) {
                for (const exercise of log.exercise.workout) {
                    for (const set of exercise.sets) {
                        const name = exercise.name.toLowerCase();
                        if (!prs[name]) {
                            prs[name] = { maxWeight: 0, maxReps: 0, date: "" };
                        }
                        if (set.weight > prs[name].maxWeight) {
                            prs[name].maxWeight = set.weight;
                            prs[name].date = log.date;
                        }
                        if (set.reps > prs[name].maxReps) {
                            prs[name].maxReps = set.reps;
                        }
                    }
                }
            }
        }

        return prs;
    },
});

// ============================================
// PROGRESSIVE OVERLOAD SUGGESTIONS
// ============================================
export const getProgressiveSuggestions = query({
    args: { exerciseNames: v.optional(v.array(v.string())) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return {};

        const userId = identity.subject;
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

        const logs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) => q.eq("userId", userId).gte("date", thirtyDaysAgo))
            .collect();

        // Find last workout for each exercise
        const lastWorkout: Record<string, { weight: number; reps: number; date: string }> = {};

        // Sort by date descending to get most recent first
        const sortedLogs = logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        for (const log of sortedLogs) {
            if (log.exercise?.workout) {
                for (const exercise of log.exercise.workout) {
                    const name = exercise.name.toLowerCase();
                    if (!lastWorkout[name] && exercise.sets.length > 0) {
                        // Get the heaviest set from the last workout
                        const heaviestSet = exercise.sets.reduce((max, set) =>
                            set.weight > max.weight ? set : max, exercise.sets[0]);
                        lastWorkout[name] = {
                            weight: heaviestSet.weight,
                            reps: heaviestSet.reps,
                            date: log.date,
                        };
                    }
                }
            }
        }

        // Generate suggestions
        const suggestions: Record<string, { lastWeight: number; lastReps: number; suggestedWeight: number; suggestedReps: number; lastDate: string }> = {};

        for (const [name, last] of Object.entries(lastWorkout)) {
            if (args.exerciseNames && !args.exerciseNames.map(n => n.toLowerCase()).includes(name)) {
                continue;
            }
            suggestions[name] = {
                lastWeight: last.weight,
                lastReps: last.reps,
                suggestedWeight: last.weight + 2.5, // +2.5kg
                suggestedReps: last.reps < 12 ? last.reps + 1 : last.reps, // +1 rep if under 12
                lastDate: last.date,
            };
        }

        return suggestions;
    },
});
