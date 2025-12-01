import { Doc } from "../convex/_generated/dataModel";
import { format } from "date-fns";
import { Droplets, Moon, Utensils, Dumbbell, Smile } from "lucide-react";

interface ReportViewProps {
    logs: Doc<"logs">[];
    categories: string[];
}

export default function ReportView({ logs, categories }: ReportViewProps) {
    // Group logs by date
    const groupedLogs: Record<string, Doc<"logs">[]> = {};
    logs.forEach(log => {
        const dateKey = format(new Date(log.date), "yyyy-MM-dd");
        if (!groupedLogs[dateKey]) groupedLogs[dateKey] = [];
        groupedLogs[dateKey].push(log);
    });

    // Sort dates descending
    const sortedDates = Object.keys(groupedLogs).sort((a, b) => b.localeCompare(a));

    // Calculate Period Totals
    const periodStats = logs.reduce((acc, log) => {
        if (log.water) acc.water += log.water;
        if (log.sleep) {
            acc.sleep += log.sleep;
            acc.sleepDays++;
        }
        if (log.exercise) {
            acc.workouts++;
            acc.exerciseMinutes += log.exercise.duration || 0;
        }
        if (log.mood) {
            acc.mood += log.mood;
            acc.moodDays++;
        }
        return acc;
    }, { water: 0, sleep: 0, sleepDays: 0, workouts: 0, exerciseMinutes: 0, mood: 0, moodDays: 0 });

    return (
        <div className="space-y-8 print:space-y-6">
            {/* Period Summary Card */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 print:grid-cols-4 print:gap-2 print:mb-6">
                {categories.includes("water") && (
                    <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 print:border print:border-gray-200 print:bg-white">
                        <div className="text-xs text-cyan-500 font-bold uppercase tracking-wider mb-1 print:text-black">Total Water</div>
                        <div className="text-2xl font-bold print:text-black">{periodStats.water} L</div>
                    </div>
                )}
                {categories.includes("sleep") && (
                    <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20 print:border print:border-gray-200 print:bg-white">
                        <div className="text-xs text-violet-500 font-bold uppercase tracking-wider mb-1 print:text-black">Avg Sleep</div>
                        <div className="text-2xl font-bold print:text-black">
                            {periodStats.sleepDays > 0 ? (periodStats.sleep / periodStats.sleepDays).toFixed(1) : 0} h
                        </div>
                    </div>
                )}
                {categories.includes("exercise") && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 print:border print:border-gray-200 print:bg-white">
                        <div className="text-xs text-emerald-500 font-bold uppercase tracking-wider mb-1 print:text-black">Workouts</div>
                        <div className="text-2xl font-bold print:text-black">
                            {periodStats.workouts} <span className="text-sm font-normal text-muted-foreground print:text-gray-500">({Math.round(periodStats.exerciseMinutes / 60)}h)</span>
                        </div>
                    </div>
                )}
                {categories.includes("mood") && (
                    <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 print:border print:border-gray-200 print:bg-white">
                        <div className="text-xs text-yellow-500 font-bold uppercase tracking-wider mb-1 print:text-black">Avg Mood</div>
                        <div className="text-2xl font-bold print:text-black">
                            {periodStats.moodDays > 0 ? (periodStats.mood / periodStats.moodDays).toFixed(1) : 0}/10
                        </div>
                    </div>
                )}
            </div>
            {logs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-t border-border/50">
                    No data found for the selected range.
                </div>
            ) : (
                sortedDates.map(date => {
                    const dayLogs = groupedLogs[date];
                    const dayDate = new Date(date + "T00:00:00"); // Fix timezone issues by appending time

                    return (
                        <div key={date} className="break-inside-avoid">
                            <h3 className="text-lg font-bold mb-3 border-b border-border/50 pb-2 print:text-black">
                                {format(dayDate, "EEEE, MMMM do")}
                            </h3>
                            <div className="space-y-3 pl-4 border-l-2 border-border/50 ml-2">
                                {dayLogs.map(log => {
                                    if (categories.includes("food") && (log.meal || log.food)) {
                                        return (
                                            <div key={log._id} className="flex gap-3 text-sm">
                                                <Utensils className="w-4 h-4 text-orange-500 mt-0.5 print:text-black" />
                                                <div>
                                                    <span className="font-semibold uppercase text-xs text-muted-foreground print:text-black block mb-0.5">
                                                        {log.meal?.type?.replace("_", " ") || "Food"}
                                                        {log.meal?.time && ` • ${log.meal.time}`}
                                                    </span>
                                                    <div className="text-foreground print:text-black">
                                                        {log.meal?.items?.join(", ") || log.food?.name}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (categories.includes("exercise") && log.exercise) {
                                        return (
                                            <div key={log._id} className="flex gap-3 text-sm">
                                                <Dumbbell className="w-4 h-4 text-emerald-500 mt-0.5 print:text-black" />
                                                <div>
                                                    <span className="font-semibold capitalize">{log.exercise.type}</span>
                                                    <span className="text-muted-foreground print:text-black"> • {log.exercise.duration}m</span>
                                                    {log.exercise.workout && (
                                                        <div className="text-xs text-muted-foreground print:text-black mt-1">
                                                            {log.exercise.workout.map(w => w.name).join(", ")}
                                                        </div>
                                                    )}
                                                    {log.exercise.notes && (
                                                        <div className="text-xs italic text-muted-foreground print:text-black mt-1">
                                                            &quot;{log.exercise.notes}&quot;
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (categories.includes("water") && log.water) {
                                        return (
                                            <div key={log._id} className="flex gap-3 text-sm text-muted-foreground print:text-black">
                                                <Droplets className="w-4 h-4 text-cyan-500 print:text-black" />
                                                <span>Drank {log.water}L of water</span>
                                            </div>
                                        );
                                    }

                                    if (categories.includes("sleep") && log.sleep) {
                                        return (
                                            <div key={log._id} className="flex gap-3 text-sm">
                                                <Moon className="w-4 h-4 text-violet-500 print:text-black" />
                                                <div>
                                                    <span className="font-semibold">Slept {log.sleep}h</span>
                                                    {log.sleep_start && log.sleep_end && (
                                                        <span className="text-muted-foreground print:text-black"> ({log.sleep_start} - {log.sleep_end})</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (categories.includes("mood") && log.mood) {
                                        return (
                                            <div key={log._id} className="flex gap-3 text-sm">
                                                <Smile className="w-4 h-4 text-yellow-500 print:text-black" />
                                                <span>Mood: {log.mood}/10</span>
                                            </div>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
