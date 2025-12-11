"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Bell, X, Check, ChevronRight, Utensils, Droplets, Dumbbell, Flame, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useHaptics } from "../hooks/useHaptics";

const MEAL_LABELS: Record<string, string> = {
    desayuno: "Breakfast",
    colacion_am: "Morning Snack",
    almuerzo: "Lunch",
    colacion_pm: "Afternoon Snack",
    merienda: "Snack",
    colacion_night: "Night Snack",
    cena: "Dinner",
    postre: "Dessert"
};

const getMealLabel = (type: string) => MEAL_LABELS[type] || type;

export default function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState("");
    const haptics = useHaptics();

    // Update current time every minute
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
        };
        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    // Queries
    const upcomingReminders = useQuery(api.notifications.getUpcomingMealReminders,
        currentTime ? { currentTime } : "skip"
    );
    const missingMeals = useQuery(api.notifications.getMissingMeals,
        currentTime ? { currentTime } : "skip"
    );
    const streak = useQuery(api.notifications.getLoggingStreak);
    const smartNudges = useQuery(api.notifications.getSmartNudges);
    const notifications = useQuery(api.notifications.getNotifications, { unreadOnly: false });
    const preferences = useQuery(api.notifications.getNotificationPreferences);
    const streakAlert = useQuery(api.notifications.getStreakProtectionAlert,
        currentTime ? { currentTime } : "skip"
    );
    const endOfDaySummary = useQuery(api.notifications.getEndOfDaySummary,
        currentTime ? { currentTime } : "skip"
    );

    // Mutations
    const markRead = useMutation(api.notifications.markNotificationRead);
    const markAllRead = useMutation(api.notifications.markAllNotificationsRead);
    const analyzePatterns = useMutation(api.notifications.analyzeMealPatterns);

    // Calculate total unread/active items
    const activeItems = [
        ...(upcomingReminders || []),
        ...(missingMeals || []),
        ...(notifications?.filter(n => !n.read) || []),
        ...(streakAlert ? [streakAlert] : []),
    ];
    const unreadCount = activeItems.length;

    // Trigger pattern analysis on mount (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            analyzePatterns().catch(console.error);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "meal_reminder":
            case "missing_meal":
                return <Utensils className="w-4 h-4" />;
            case "water":
                return <Droplets className="w-4 h-4" />;
            case "exercise":
                return <Dumbbell className="w-4 h-4" />;
            case "streak":
                return <Flame className="w-4 h-4" />;
            default:
                return <Sparkles className="w-4 h-4" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "meal_reminder":
            case "missing_meal":
                return "text-orange-500 bg-orange-500/10";
            case "water":
                return "text-blue-500 bg-blue-500/10";
            case "exercise":
                return "text-green-500 bg-green-500/10";
            case "streak":
                return "text-amber-500 bg-amber-500/10";
            case "protein":
                return "text-red-500 bg-red-500/10";
            default:
                return "text-purple-500 bg-purple-500/10";
        }
    };

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={() => {
                    haptics.light();
                    setIsOpen(!isOpen);
                }}
                className="relative p-2 rounded-full hover:bg-secondary transition-colors"
            >
                <Bell className="w-5 h-5 text-muted-foreground" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-[70vh] overflow-hidden bg-card border border-border rounded-2xl shadow-xl z-50"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                                <div className="flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-primary" />
                                    <h3 className="font-semibold">Notifications</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    {notifications && notifications.some(n => !n.read) && (
                                        <button
                                            onClick={() => markAllRead()}
                                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-1 hover:bg-muted rounded-full transition-colors"
                                    >
                                        <X className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
                                {/* Streak Protection Alert */}
                                {streakAlert && streakAlert.isAtRisk && (
                                    <div className={`p-3 m-3 rounded-xl border ${streakAlert.urgency === 'high' ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/30 animate-pulse' : 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${streakAlert.urgency === 'high' ? 'bg-red-500/20' : 'bg-amber-500/20'}`}>
                                                <Flame className={`w-5 h-5 ${streakAlert.urgency === 'high' ? 'text-red-500' : 'text-amber-500'}`} />
                                            </div>
                                            <div>
                                                <p className={`font-semibold ${streakAlert.urgency === 'high' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                                    {streakAlert.message}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {streakAlert.hoursLeft > 0 ? `${streakAlert.hoursLeft}h left to log` : 'Last hour!'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Streak Banner (when not at risk) */}
                                {streak && streak.streak > 0 && !streakAlert?.isAtRisk && (
                                    <div className="p-3 m-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                                                <Flame className="w-5 h-5 text-amber-500" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-amber-600 dark:text-amber-400">
                                                    🔥 {streak.streak} day streak
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {streak.hasLoggedToday
                                                        ? "Already logged today!"
                                                        : "Don't forget to log today!"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* End of Day Summary */}
                                {endOfDaySummary && (
                                    <div className="p-3 m-3 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-semibold text-indigo-600 dark:text-indigo-400">📊 Daily Summary</p>
                                            <span className="text-xs font-bold text-indigo-500">{endOfDaySummary.completenessPercent}%</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                                            <div
                                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                                                style={{ width: `${endOfDaySummary.completenessPercent}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">{endOfDaySummary.message}</p>
                                        {endOfDaySummary.missing.meals.length > 0 && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Missing: {endOfDaySummary.missing.meals.slice(0, 3).join(', ')}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Upcoming Meal Reminders */}
                                {upcomingReminders && upcomingReminders.length > 0 && (
                                    <div className="p-3">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
                                            Reminders
                                        </p>
                                        {upcomingReminders.map((reminder, i) => (
                                            <div
                                                key={i}
                                                className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-center gap-3 mb-2"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                                                    <Utensils className="w-4 h-4 text-orange-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">
                                                        Time for {getMealLabel(reminder.mealType).toLowerCase()}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Usually you eat at {reminder.typicalTime}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Missing Meals */}
                                {missingMeals && missingMeals.length > 0 && (
                                    <div className="p-3">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
                                            Unlogged meals
                                        </p>
                                        {missingMeals.slice(0, 3).map((meal, i) => (
                                            <div
                                                key={i}
                                                className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10 flex items-center gap-3 mb-2"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                                                    <Utensils className="w-4 h-4 text-yellow-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">
                                                        Did you have {getMealLabel(meal.mealType).toLowerCase()}?
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Usually at {meal.expectedTime}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Smart Nudges */}
                                {smartNudges && smartNudges.length > 0 && (
                                    <div className="p-3">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
                                            Weekly Insights
                                        </p>
                                        {smartNudges.map((nudge, i) => (
                                            <div
                                                key={i}
                                                className={`p-3 rounded-xl border flex items-start gap-3 mb-2 ${getTypeColor(nudge.type).replace('text-', 'border-').replace('/10', '/20')} ${getTypeColor(nudge.type).split(' ')[1]}`}
                                            >
                                                <span className="text-xl">{nudge.icon}</span>
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{nudge.title}</p>
                                                    <p className="text-xs text-muted-foreground">{nudge.message}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Empty State */}
                                {(!upcomingReminders || upcomingReminders.length === 0) &&
                                    (!missingMeals || missingMeals.length === 0) &&
                                    (!smartNudges || smartNudges.length === 0) &&
                                    (!streak || streak.streak === 0) && (
                                        <div className="p-8 text-center">
                                            <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                                            <p className="text-sm text-muted-foreground">
                                                No notifications
                                            </p>
                                            <p className="text-xs text-muted-foreground/70 mt-1">
                                                Log meals to receive smart reminders
                                            </p>
                                        </div>
                                    )}
                            </div>

                            {/* Footer */}
                            <div className="p-3 border-t border-border bg-muted/30">
                                <a
                                    href="/profile"
                                    className="flex items-center justify-between px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                >
                                    <span>Notification settings</span>
                                    <ChevronRight className="w-4 h-4" />
                                </a>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
