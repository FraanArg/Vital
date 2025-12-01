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

    if (logs.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                No data found for the selected range.
            </div>
        );
    }

    return (
        <div className="space-y-8 print:space-y-6">
            {sortedDates.map(date => {
                const dayLogs = groupedLogs[date];
                const dayDate = new Date(date + "T00:00:00"); // Fix timezone issues by appending time

                // Calculate daily summaries
                const totalWater = dayLogs.reduce((acc, log) => acc + (log.water || 0), 0);
                const totalSleep = dayLogs.reduce((acc, log) => acc + (log.sleep || 0), 0);

                return (
                    <div key={date} className="break-inside-avoid">
                        <h3 className="text-xl font-bold mb-4 border-b border-border/50 pb-2 flex justify-between items-end">
                            <span>{format(dayDate, "EEEE, MMMM do, yyyy")}</span>
                            <span className="text-sm font-normal text-muted-foreground print:text-black">
                                {totalWater > 0 && `💧 ${totalWater}L `}
                                {totalSleep > 0 && `😴 ${totalSleep}h `}
                            </span>
                        </h3>

                        <div className="space-y-3 pl-4 border-l-2 border-border/30">
                            {dayLogs.map(log => {
                                if (categories.includes("food") && (log.food || log.meal)) {
                                    return (
                                        <div key={log._id} className="flex gap-3 text-sm">
                                            <Utensils className="w-4 h-4 text-orange-500 mt-0.5 print:text-black" />
                                            <div>
                                                {log.meal ? (
                                                    <>
                                                        <span className="font-semibold uppercase text-xs tracking-wide text-muted-foreground print:text-black block">
                                                            {log.meal.type.replace('_', ' ')} • {log.meal.time}
                                                        </span>
                                                        <span>{log.meal.items.join(", ")}</span>
                                                    </>
                                                ) : (
                                                    <span>{log.food}</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }

                                if (categories.includes("exercise") && log.exercise) {
                                    return (
                                        <div key={log._id} className="flex gap-3 text-sm">
                                            <Dumbbell className="w-4 h-4 text-blue-500 mt-0.5 print:text-black" />
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
                                            <Droplets className="w-4 h-4 text-blue-400 print:text-black" />
                                            <span>Drank {log.water}L of water</span>
                                        </div>
                                    );
                                }

                                if (categories.includes("sleep") && log.sleep) {
                                    return (
                                        <div key={log._id} className="flex gap-3 text-sm">
                                            <Moon className="w-4 h-4 text-indigo-500 print:text-black" />
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
            })}
        </div>
    );
}
