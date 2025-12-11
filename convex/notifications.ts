import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

// Helper to convert time string to minutes since midnight
const timeToMinutes = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + (m || 0);
};

// Helper to convert minutes to time string
const minutesToTime = (minutes: number): string => {
    const h = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// Helper to check if a date is a weekday
const isWeekday = (date: Date): boolean => {
    const day = date.getDay();
    return day !== 0 && day !== 6;
};

// ============================================
// MEAL PATTERN ANALYSIS
// ============================================

// Analyzes user's meal logs to compute typical meal times
// Uses meal.time (when they actually ate), not log creation time
export const analyzeMealPatterns = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");
        const userId = identity.subject;

        // Get last 30 days of logs
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const logs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) =>
                q.eq("userId", userId).gte("date", thirtyDaysAgo.toISOString())
            )
            .collect();

        // Group meals by type and weekday/weekend
        const mealData: Record<string, { weekday: number[], weekend: number[] }> = {};

        for (const log of logs) {
            if (!log.meal?.time || !log.meal?.type) continue;

            const logDate = new Date(log.date);
            const weekday = isWeekday(logDate);
            const mealType = log.meal.type;
            const timeInMinutes = timeToMinutes(log.meal.time);

            if (!mealData[mealType]) {
                mealData[mealType] = { weekday: [], weekend: [] };
            }

            if (weekday) {
                mealData[mealType].weekday.push(timeInMinutes);
            } else {
                mealData[mealType].weekend.push(timeInMinutes);
            }
        }

        // Calculate averages and variances, then save patterns
        const now = new Date().toISOString();

        for (const [mealType, data] of Object.entries(mealData)) {
            // Weekday pattern
            if (data.weekday.length >= 3) {
                const avg = data.weekday.reduce((a, b) => a + b, 0) / data.weekday.length;
                const variance = Math.sqrt(
                    data.weekday.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / data.weekday.length
                );

                // Upsert pattern
                const existing = await ctx.db
                    .query("mealPatterns")
                    .withIndex("by_user_meal", (q) => q.eq("userId", userId).eq("mealType", mealType))
                    .filter((q) => q.eq(q.field("weekday"), true))
                    .first();

                if (existing) {
                    await ctx.db.patch(existing._id, {
                        averageTime: minutesToTime(Math.round(avg)),
                        variance: Math.round(variance),
                        sampleCount: data.weekday.length,
                        lastUpdated: now,
                    });
                } else {
                    await ctx.db.insert("mealPatterns", {
                        userId,
                        mealType,
                        weekday: true,
                        averageTime: minutesToTime(Math.round(avg)),
                        variance: Math.round(variance),
                        sampleCount: data.weekday.length,
                        lastUpdated: now,
                    });
                }
            }

            // Weekend pattern
            if (data.weekend.length >= 2) {
                const avg = data.weekend.reduce((a, b) => a + b, 0) / data.weekend.length;
                const variance = Math.sqrt(
                    data.weekend.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / data.weekend.length
                );

                const existing = await ctx.db
                    .query("mealPatterns")
                    .withIndex("by_user_meal", (q) => q.eq("userId", userId).eq("mealType", mealType))
                    .filter((q) => q.eq(q.field("weekday"), false))
                    .first();

                if (existing) {
                    await ctx.db.patch(existing._id, {
                        averageTime: minutesToTime(Math.round(avg)),
                        variance: Math.round(variance),
                        sampleCount: data.weekend.length,
                        lastUpdated: now,
                    });
                } else {
                    await ctx.db.insert("mealPatterns", {
                        userId,
                        mealType,
                        weekday: false,
                        averageTime: minutesToTime(Math.round(avg)),
                        variance: Math.round(variance),
                        sampleCount: data.weekend.length,
                        lastUpdated: now,
                    });
                }
            }
        }

        return { success: true, mealsAnalyzed: Object.keys(mealData).length };
    },
});

// Get user's meal patterns
export const getMealPatterns = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];
        const userId = identity.subject;

        return await ctx.db
            .query("mealPatterns")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();
    },
});

// ============================================
// MISSING MEAL DETECTION
// ============================================

// Get meals that are typically logged by now but haven't been logged today
export const getMissingMeals = query({
    args: { currentTime: v.string() }, // "HH:mm"
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];
        const userId = identity.subject;

        const now = new Date();
        const weekday = isWeekday(now);
        const currentMinutes = timeToMinutes(args.currentTime);

        // Get today's start
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);

        // Get today's logs
        const todayLogs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) =>
                q.eq("userId", userId)
                    .gte("date", todayStart.toISOString())
                    .lte("date", todayEnd.toISOString())
            )
            .collect();

        const loggedMealTypes = new Set(todayLogs.map(l => l.meal?.type).filter(Boolean));

        // Get patterns for today (weekday or weekend)
        const patterns = await ctx.db
            .query("mealPatterns")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) => q.eq(q.field("weekday"), weekday))
            .collect();

        // Find meals that should have been logged by now
        const missingMeals: { mealType: string; expectedTime: string; minutesOverdue: number }[] = [];

        for (const pattern of patterns) {
            if (loggedMealTypes.has(pattern.mealType)) continue;

            const expectedMinutes = timeToMinutes(pattern.averageTime);
            const gracePeriod = Math.max(30, pattern.variance); // At least 30 min grace

            if (currentMinutes > expectedMinutes + gracePeriod) {
                missingMeals.push({
                    mealType: pattern.mealType,
                    expectedTime: pattern.averageTime,
                    minutesOverdue: currentMinutes - expectedMinutes,
                });
            }
        }

        return missingMeals.sort((a, b) => a.minutesOverdue - b.minutesOverdue);
    },
});

// ============================================
// UPCOMING MEAL REMINDERS
// ============================================

// Get meals that are coming up soon (within 15 min of typical time)
export const getUpcomingMealReminders = query({
    args: { currentTime: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];
        const userId = identity.subject;

        const now = new Date();
        const weekday = isWeekday(now);
        const currentMinutes = timeToMinutes(args.currentTime);

        // Get today's logs to check what's already logged
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);

        const todayLogs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) =>
                q.eq("userId", userId)
                    .gte("date", todayStart.toISOString())
                    .lte("date", todayEnd.toISOString())
            )
            .collect();

        const loggedMealTypes = new Set(todayLogs.map(l => l.meal?.type).filter(Boolean));

        // Get patterns
        const patterns = await ctx.db
            .query("mealPatterns")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) => q.eq(q.field("weekday"), weekday))
            .collect();

        const reminders: { mealType: string; typicalTime: string; minutesUntil: number }[] = [];

        for (const pattern of patterns) {
            if (loggedMealTypes.has(pattern.mealType)) continue;

            const expectedMinutes = timeToMinutes(pattern.averageTime);
            const minutesUntil = expectedMinutes - currentMinutes;

            // Remind if within -5 to +15 minutes of typical time
            if (minutesUntil >= -5 && minutesUntil <= 15) {
                reminders.push({
                    mealType: pattern.mealType,
                    typicalTime: pattern.averageTime,
                    minutesUntil,
                });
            }
        }

        return reminders;
    },
});

// ============================================
// LOGGING STREAK
// ============================================

export const getLoggingStreak = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { streak: 0, lastLogDate: null };
        const userId = identity.subject;

        // Get logs from last 60 days
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const logs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) =>
                q.eq("userId", userId).gte("date", sixtyDaysAgo.toISOString())
            )
            .order("desc")
            .collect();

        if (logs.length === 0) return { streak: 0, lastLogDate: null };

        // Group by date
        const logDates = new Set<string>();
        for (const log of logs) {
            const dateStr = log.date.split('T')[0];
            logDates.add(dateStr);
        }

        // Count streak from today backwards
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 60; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = checkDate.toISOString().split('T')[0];

            if (logDates.has(dateStr)) {
                streak++;
            } else if (i === 0) {
                // Today hasn't been logged yet - that's okay, continue checking
                continue;
            } else {
                // Streak broken
                break;
            }
        }

        const sortedDates = Array.from(logDates).sort().reverse();
        return {
            streak,
            lastLogDate: sortedDates[0] || null,
            hasLoggedToday: logDates.has(today.toISOString().split('T')[0]),
        };
    },
});

// ============================================
// NOTIFICATION PREFERENCES
// ============================================

export const getNotificationPreferences = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;
        const userId = identity.subject;

        return await ctx.db
            .query("notificationPreferences")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();
    },
});

export const updateNotificationPreferences = mutation({
    args: {
        enabled: v.boolean(),
        mealReminders: v.boolean(),
        waterReminders: v.boolean(),
        exerciseReminders: v.boolean(),
        streakAlerts: v.boolean(),
        smartNudges: v.boolean(),
        quietHoursStart: v.optional(v.string()),
        quietHoursEnd: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");
        const userId = identity.subject;

        const existing = await ctx.db
            .query("notificationPreferences")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        const data = {
            ...args,
            userId,
            updatedAt: new Date().toISOString(),
        };

        if (existing) {
            await ctx.db.patch(existing._id, data);
        } else {
            await ctx.db.insert("notificationPreferences", data);
        }
    },
});

// ============================================
// IN-APP NOTIFICATIONS
// ============================================

export const getNotifications = query({
    args: { unreadOnly: v.optional(v.boolean()) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];
        const userId = identity.subject;

        let query = ctx.db
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("userId", userId));

        const notifications = await query.order("desc").take(20);

        if (args.unreadOnly) {
            return notifications.filter(n => !n.read);
        }

        return notifications;
    },
});

export const markNotificationRead = mutation({
    args: { id: v.id("notifications") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const notification = await ctx.db.get(args.id);
        if (notification && notification.userId === identity.subject) {
            await ctx.db.patch(args.id, { read: true });
        }
    },
});

export const markAllNotificationsRead = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");
        const userId = identity.subject;

        const unread = await ctx.db
            .query("notifications")
            .withIndex("by_user_unread", (q) => q.eq("userId", userId).eq("read", false))
            .collect();

        for (const n of unread) {
            await ctx.db.patch(n._id, { read: true });
        }
    },
});

// Create a notification (internal use)
export const createNotification = mutation({
    args: {
        type: v.string(),
        title: v.string(),
        message: v.string(),
        icon: v.string(),
        actionUrl: v.optional(v.string()),
        metadata: v.optional(v.any()),
        expiresAt: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");
        const userId = identity.subject;

        await ctx.db.insert("notifications", {
            ...args,
            userId,
            read: false,
            createdAt: new Date().toISOString(),
        });
    },
});

// ============================================
// SMART NUDGES
// ============================================

export const getSmartNudges = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];
        const userId = identity.subject;

        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const logs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) =>
                q.eq("userId", userId).gte("date", sevenDaysAgo.toISOString())
            )
            .collect();

        const nudges: { type: string; icon: string; title: string; message: string }[] = [];

        // Analyze water intake
        const waterLogs = logs.filter(l => l.water);
        const totalWater = waterLogs.reduce((sum, l) => sum + (l.water || 0), 0);
        const avgWaterPerDay = totalWater / 7;

        if (avgWaterPerDay < 1.5) {
            nudges.push({
                type: "water",
                icon: "💧",
                title: "Hidratación",
                message: `Tu promedio de agua esta semana es ${avgWaterPerDay.toFixed(1)}L/día. ¡Intenta llegar a 2L!`,
            });
        } else if (avgWaterPerDay >= 2) {
            nudges.push({
                type: "water",
                icon: "💧",
                title: "¡Excelente hidratación!",
                message: `Promedio de ${avgWaterPerDay.toFixed(1)}L/día esta semana. ¡Sigue así!`,
            });
        }

        // Analyze protein intake (simple keyword check)
        const proteinKeywords = ['pollo', 'carne', 'pescado', 'huevo', 'atún', 'proteína', 'whey', 'yogur'];
        let proteinMeals = 0;
        let totalMeals = 0;

        for (const log of logs) {
            if (log.meal?.items) {
                totalMeals++;
                const hasProtein = log.meal.items.some(item =>
                    proteinKeywords.some(kw => item.toLowerCase().includes(kw))
                );
                if (hasProtein) proteinMeals++;
            }
        }

        if (totalMeals > 0) {
            const proteinPercent = (proteinMeals / totalMeals) * 100;
            if (proteinPercent >= 60) {
                nudges.push({
                    type: "protein",
                    icon: "💪",
                    title: "Buen aporte de proteína",
                    message: `${Math.round(proteinPercent)}% de tus comidas incluyen proteína. ¡Sigue así!`,
                });
            } else if (proteinPercent < 40) {
                nudges.push({
                    type: "protein",
                    icon: "🥩",
                    title: "Más proteína",
                    message: `Solo ${Math.round(proteinPercent)}% de tus comidas tienen proteína. Intenta agregar más.`,
                });
            }
        }

        // Analyze exercise frequency
        const exerciseLogs = logs.filter(l => l.exercise);
        if (exerciseLogs.length >= 4) {
            nudges.push({
                type: "exercise",
                icon: "🏆",
                title: "¡Semana activa!",
                message: `${exerciseLogs.length} entrenamientos esta semana. ¡Excelente constancia!`,
            });
        } else if (exerciseLogs.length === 0) {
            nudges.push({
                type: "exercise",
                icon: "🏃",
                title: "¡A moverse!",
                message: "No registraste ejercicio esta semana. ¿Qué tal una caminata?",
            });
        }

        return nudges;
    },
});

// ============================================
// END OF DAY SUMMARY
// ============================================

// Get summary of what was logged today vs what's typically logged
export const getEndOfDaySummary = query({
    args: { currentTime: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;
        const userId = identity.subject;

        const currentMinutes = timeToMinutes(args.currentTime);

        // Only show after 8 PM (20:00)
        if (currentMinutes < 20 * 60) return null;

        const now = new Date();
        const weekday = isWeekday(now);
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);

        // Get today's logs
        const todayLogs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) =>
                q.eq("userId", userId)
                    .gte("date", todayStart.toISOString())
                    .lte("date", todayEnd.toISOString())
            )
            .collect();

        // What was logged today
        const loggedMealTypes = new Set(todayLogs.map(l => l.meal?.type).filter(Boolean));
        const hasWater = todayLogs.some(l => l.water);
        const totalWater = todayLogs.reduce((sum, l) => sum + (l.water || 0), 0);
        const hasExercise = todayLogs.some(l => l.exercise);
        const hasSleep = todayLogs.some(l => l.sleep);
        const hasMood = todayLogs.some(l => l.mood);

        // Get typical patterns
        const patterns = await ctx.db
            .query("mealPatterns")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) => q.eq(q.field("weekday"), weekday))
            .collect();

        const expectedMeals = patterns.map(p => p.mealType);
        const missingMeals = expectedMeals.filter(m => !loggedMealTypes.has(m));

        // Calculate completeness score
        let completedItems = 0;
        let totalItems = 0;

        // Meals
        totalItems += expectedMeals.length || 3; // At least 3 typical meals
        completedItems += Math.min(loggedMealTypes.size, expectedMeals.length || 3);

        // Water (target 2L)
        totalItems += 1;
        if (totalWater >= 2) completedItems += 1;
        else if (totalWater >= 1) completedItems += 0.5;

        const completenessPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

        return {
            logged: {
                meals: Array.from(loggedMealTypes),
                mealCount: loggedMealTypes.size,
                water: totalWater,
                hasExercise,
                hasSleep,
                hasMood,
            },
            missing: {
                meals: missingMeals,
                needsWater: totalWater < 1.5,
            },
            completenessPercent,
            message: completenessPercent >= 80
                ? "¡Excelente día de registro! 🌟"
                : completenessPercent >= 50
                    ? "Buen progreso hoy. ¿Falta algo?"
                    : "Todavía hay tiempo para completar tu día",
        };
    },
});

// ============================================
// STREAK PROTECTION ALERT
// ============================================

// Check if streak is at risk
export const getStreakProtectionAlert = query({
    args: { currentTime: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;
        const userId = identity.subject;

        const currentMinutes = timeToMinutes(args.currentTime);

        // Only show after 7 PM (19:00)
        if (currentMinutes < 19 * 60) return null;

        // Get streak info
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const logs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) =>
                q.eq("userId", userId).gte("date", sixtyDaysAgo.toISOString())
            )
            .order("desc")
            .collect();

        if (logs.length === 0) return null;

        // Group by date
        const logDates = new Set<string>();
        for (const log of logs) {
            const dateStr = log.date.split('T')[0];
            logDates.add(dateStr);
        }

        // Calculate streak
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];
        const hasLoggedToday = logDates.has(todayStr);

        // Count streak (excluding today if not logged)
        let streak = 0;
        for (let i = hasLoggedToday ? 0 : 1; i < 60; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = checkDate.toISOString().split('T')[0];

            if (logDates.has(dateStr)) {
                streak++;
            } else {
                break;
            }
        }

        // Only alert if there's a streak worth protecting and haven't logged today
        if (streak >= 3 && !hasLoggedToday) {
            return {
                streak,
                isAtRisk: true,
                hoursLeft: Math.max(0, Math.floor((24 * 60 - currentMinutes) / 60)),
                message: streak >= 7
                    ? `¡Tu racha de ${streak} días está en riesgo! 🔥`
                    : `Tienes una racha de ${streak} días. ¡No la pierdas!`,
                urgency: currentMinutes >= 22 * 60 ? "high" : "medium",
            };
        }

        return null;
    },
});

// ============================================
// COMBINED DAILY ALERTS
// ============================================

// Get all alerts for the notification center in one call
export const getDailyAlerts = query({
    args: { currentTime: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { alerts: [], badge: 0 };

        const currentMinutes = timeToMinutes(args.currentTime);
        const isEvening = currentMinutes >= 19 * 60; // After 7 PM
        const isLateEvening = currentMinutes >= 21 * 60; // After 9 PM

        const alerts: {
            type: string;
            icon: string;
            title: string;
            message: string;
            priority: number;
            color: string;
        }[] = [];

        // Evening-only alerts would be added via other queries
        // This is a placeholder for combining multiple alert sources

        return {
            alerts,
            badge: alerts.length,
            isEvening,
            isLateEvening,
        };
    },
});
