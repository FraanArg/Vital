"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Droplets, Dumbbell } from "lucide-react";

interface MealItem {
    time?: string;
    name?: string; // Legacy support
    items?: string[]; // New structure
    type?: string;
    calories?: number;
}

interface ExerciseItem {
    type: string;
    duration: number;
    intensity?: string;
    notes?: string;
}

interface ReportData {
    date: string;
    food: MealItem[];
    water: number;
    exercise: ExerciseItem[];
    sleep?: number;
    mood?: number;
}

interface ReportViewProps {
    data: ReportData[];
    startDate: Date;
    endDate: Date;
    userName?: string;
}

const MEAL_LABELS: Record<string, string> = {
    desayuno: "Desayuno",
    colacion_am: "Col. AM",
    almuerzo: "Almuerzo",
    colacion_pm: "Col. PM",
    merienda: "Merienda",
    colacion_night: "Col. Noche",
    cena: "Cena",
    postre: "Postre"
};

const getMealLabel = (type?: string) => {
    if (!type) return "Comida";
    return MEAL_LABELS[type] || type.charAt(0).toUpperCase() + type.slice(1);
};

// Order for meal display
const MEAL_ORDER = ["desayuno", "colacion_am", "almuerzo", "colacion_pm", "merienda", "cena", "colacion_night", "postre"];

const ACTIVITY_TRANSLATIONS: Record<string, string> = {
    "football": "Fútbol",
    "soccer": "Fútbol",
    "tennis": "Tenis",
    "padel": "Pádel",
    "running": "Running",
    "jogging": "Trote",
    "walking": "Caminata",
    "cycling": "Ciclismo",
    "swimming": "Natación",
    "gym": "Gimnasio",
    "workout": "Entrenamiento",
    "yoga": "Yoga",
    "pilates": "Pilates",
    "crossfit": "Crossfit",
    "boxing": "Boxeo",
    "basketball": "Básquet",
    "volleyball": "Vóley",
    "hiking": "Senderismo"
};

const translateActivity = (activity: string) => {
    const lower = activity.toLowerCase();
    // Check for exact matches
    if (ACTIVITY_TRANSLATIONS[lower]) return ACTIVITY_TRANSLATIONS[lower];

    // Check for partial matches (e.g. "football match" -> "Fútbol")
    for (const [key, value] of Object.entries(ACTIVITY_TRANSLATIONS)) {
        if (lower.includes(key)) return value;
    }

    return activity; // Fallback to original
};

const getMoodLabel = (mood: number) => {
    if (mood >= 8) return "😊";
    if (mood >= 5) return "😐";
    return "😔";
};

export default function ReportView({ data, startDate, endDate, userName = "Usuario" }: ReportViewProps) {
    return (
        <div className="bg-white text-black p-8 max-w-[297mm] mx-auto min-h-screen print:p-0 print:max-w-none font-sans text-xs selection:bg-blue-100 flex flex-col">
            {/* Header */}
            <div className="mb-8 border-b-2 border-gray-900 pb-4 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-[10px]">V</div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-serif">Reporte de Salud</h1>
                    </div>
                    <p className="text-gray-500 text-[11px] font-medium">Preparado para <span className="text-gray-900">{userName}</span></p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-0.5">Periodo</p>
                    <p className="text-sm font-medium text-gray-900 font-mono">
                        {format(startDate, "d MMM", { locale: es })} — {format(endDate, "d MMM, yyyy", { locale: es })}
                    </p>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 flex-1">
                {data.map((day) => {
                    const date = new Date(day.date);
                    const hasData = day.food?.length > 0 || day.water > 0 || day.exercise?.length > 0 || day.sleep || day.mood;

                    if (!hasData) return null;

                    // Group meals
                    const mealsByType: Record<string, MealItem[]> = {};
                    day.food?.forEach(meal => {
                        const type = meal.type || "other";
                        if (!mealsByType[type]) mealsByType[type] = [];
                        mealsByType[type].push(meal);
                    });

                    // Sort types based on MEAL_ORDER
                    const sortedMealTypes = Object.keys(mealsByType).sort((a, b) => {
                        const idxA = MEAL_ORDER.indexOf(a);
                        const idxB = MEAL_ORDER.indexOf(b);
                        if (idxA === -1 && idxB === -1) return 0;
                        if (idxA === -1) return 1;
                        if (idxB === -1) return -1;
                        return idxA - idxB;
                    });

                    return (
                        <div key={day.date} className="break-inside-avoid border-b border-gray-100 pb-4 mb-2 last:border-0">
                            {/* Day Header */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-bold text-gray-900 text-lg leading-none">
                                            {format(date, "EEEE d", { locale: es })}
                                        </span>
                                        <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">
                                            {format(date, "MMMM", { locale: es })}
                                        </span>
                                    </div>
                                    {/* Sleep & Mood Context */}
                                    {(day.sleep || day.mood) && (
                                        <div className="flex items-center gap-2 px-2 py-0.5 bg-gray-50 rounded-md border border-gray-100">
                                            {day.sleep && <span className="text-[9px] text-gray-600 flex items-center gap-1">🌙 {day.sleep}h</span>}
                                            {day.mood && <span className="text-[9px] text-gray-600 flex items-center gap-1">{getMoodLabel(day.mood)}</span>}
                                        </div>
                                    )}
                                </div>

                                {/* Water Badge */}
                                {day.water > 0 && (
                                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                                        <Droplets className="w-3 h-3" />
                                        {day.water < 10
                                            ? `${day.water}L`
                                            : `${(day.water / 1000).toFixed(1)}L`
                                        }
                                    </div>
                                )}
                            </div>

                            {/* Content Grid */}
                            <div className="space-y-3">
                                {/* Food Section */}
                                {day.food?.length > 0 && (
                                    <div className="space-y-1.5">
                                        {sortedMealTypes.map(type => {
                                            const firstMeal = mealsByType[type]?.[0];
                                            return (
                                                <div key={type} className="flex items-baseline gap-2 text-[11px] leading-snug group">
                                                    <div className="min-w-[120px] shrink-0 flex items-baseline justify-between mr-2">
                                                        <span className="font-semibold text-gray-700">{getMealLabel(type)}</span>
                                                        {firstMeal?.time && <span className="font-mono text-[9px] text-gray-400">{firstMeal.time}</span>}
                                                    </div>
                                                    <span className="text-gray-600 block flex-1">
                                                        {mealsByType[type]?.map((meal, idx) => (
                                                            <span key={idx}>
                                                                {idx > 0 && <span className="text-gray-300 mx-1">•</span>}
                                                                <span className="text-gray-800">
                                                                    {meal.items ? meal.items.join(", ") : meal.name}
                                                                </span>
                                                                {meal.calories && meal.calories > 0 && <span className="text-gray-400 text-[9px] ml-1">({meal.calories})</span>}
                                                            </span>
                                                        ))}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Exercise Section */}
                                {day.exercise?.length > 0 && (
                                    <div className="pt-2 border-t border-dashed border-gray-100">
                                        <ul className="flex flex-wrap gap-3">
                                            {day.exercise.map((ex, idx) => {
                                                const activity = ex.type || "";
                                                const translatedActivity = translateActivity(activity);

                                                return (
                                                    <li key={idx} className="text-[10px] flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
                                                        <Dumbbell className="w-3 h-3 text-gray-400" />
                                                        <span className="font-semibold text-gray-800">{translatedActivity}</span>
                                                        <span className="text-gray-400 text-[9px]">
                                                            {ex.duration}m
                                                        </span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center text-[9px] text-gray-400 print:fixed print:bottom-4 print:left-8 print:right-8">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span className="uppercase tracking-wider font-medium">Vital Health Tracker</span>
                </div>
                <span className="font-mono">{format(new Date(), "PP p", { locale: es })}</span>
            </div>
        </div>
    );
}
