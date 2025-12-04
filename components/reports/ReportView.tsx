"use client";

import { format } from "date-fns";
import { Utensils, Droplets, Dumbbell } from "lucide-react";

interface MealItem {
    time?: string;
    name: string;
    calories?: number;
}

interface ExerciseItem {
    activity: string;
    duration: number;
    intensity?: string;
    notes?: string;
}

interface ReportData {
    date: string;
    food: MealItem[];
    water: number;
    exercise: ExerciseItem[];
}

interface ReportViewProps {
    data: ReportData[];
    startDate: Date;
    endDate: Date;
    userName?: string;
}

export default function ReportView({ data, startDate, endDate, userName = "User" }: ReportViewProps) {
    return (
        <div className="bg-white text-black p-8 max-w-[210mm] mx-auto min-h-screen print:p-0 print:max-w-none">
            {/* Header */}
            <div className="mb-8 border-b border-gray-200 pb-4">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Health Report</h1>
                        <p className="text-gray-500 mt-1">Prepared for {userName}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500 uppercase tracking-wider font-medium">Date Range</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {format(startDate, "MMM d, yyyy")} - {format(endDate, "MMM d, yyyy")}
                        </p>
                    </div>
                </div>
            </div>

            {/* Daily Breakdown */}
            <div className="space-y-8">
                {data.map((day) => {
                    const date = new Date(day.date);
                    const hasData = day.food.length > 0 || day.water > 0 || day.exercise.length > 0;

                    if (!hasData) return null;

                    return (
                        <div key={day.date} className="break-inside-avoid">
                            <h3 className="text-lg font-bold border-b-2 border-gray-100 pb-1 mb-3 text-gray-800 flex items-center gap-2">
                                {format(date, "EEEE, MMMM d")}
                            </h3>

                            <div className="grid grid-cols-1 gap-4">
                                {/* Food Section */}
                                {day.food.length > 0 && (
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-2 mb-2 text-orange-600">
                                            <Utensils className="w-4 h-4" />
                                            <h4 className="font-semibold text-sm uppercase tracking-wide">Nutrition</h4>
                                        </div>
                                        <ul className="space-y-1.5">
                                            {day.food.map((meal, idx) => (
                                                <li key={idx} className="text-sm flex justify-between items-start">
                                                    <span className="font-medium text-gray-900">
                                                        {meal.time && <span className="text-gray-400 font-mono mr-2">{meal.time}</span>}
                                                        {meal.name}
                                                    </span>
                                                    {meal.calories && meal.calories > 0 && (
                                                        <span className="text-gray-500 text-xs font-mono">{meal.calories} kcal</span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Exercise Section */}
                                {day.exercise.length > 0 && (
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-2 mb-2 text-red-600">
                                            <Dumbbell className="w-4 h-4" />
                                            <h4 className="font-semibold text-sm uppercase tracking-wide">Activity</h4>
                                        </div>
                                        <ul className="space-y-1.5">
                                            {day.exercise.map((ex, idx) => (
                                                <li key={idx} className="text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="font-medium text-gray-900">{ex.activity}</span>
                                                        <span className="text-gray-500 text-xs font-mono">
                                                            {ex.duration}m {ex.intensity && `• ${ex.intensity}`}
                                                        </span>
                                                    </div>
                                                    {ex.notes && (
                                                        <p className="text-xs text-gray-500 mt-0.5 italic">&quot;{ex.notes}&quot;</p>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Water Section */}
                                {day.water > 0 && (
                                    <div className="flex items-center gap-3 text-sm text-blue-700 bg-blue-50 p-2 rounded-lg border border-blue-100 w-fit">
                                        <Droplets className="w-4 h-4" />
                                        <span className="font-medium">Water Intake:</span>
                                        <span className="font-bold text-lg">{(day.water / 1000).toFixed(1)}L</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="mt-12 pt-4 border-t border-gray-200 text-center text-xs text-gray-400 print:fixed print:bottom-4 print:left-0 print:right-0">
                Generated by Personal Tracker • {format(new Date(), "PPpp")}
            </div>
        </div>
    );
}
