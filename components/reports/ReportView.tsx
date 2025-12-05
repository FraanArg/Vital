"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Utensils, Droplets, Dumbbell } from "lucide-react";

interface MealItem {
    time?: string;
    name?: string; // Legacy support
    items?: string[]; // New structure
    type?: string;
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

const MEAL_LABELS: Record<string, string> = {
    desayuno: "Desayuno",
    colacion_am: "Colación Mañana",
    almuerzo: "Almuerzo",
    colacion_pm: "Colación Tarde",
    merienda: "Merienda",
    colacion_night: "Colación Noche",
    cena: "Cena",
    postre: "Postre"
};

const getMealLabel = (type?: string) => {
    if (!type) return "Comida";
    return MEAL_LABELS[type] || type.charAt(0).toUpperCase() + type.slice(1);
};

// Order for meal display
const MEAL_ORDER = ["desayuno", "colacion_am", "almuerzo", "colacion_pm", "merienda", "cena", "colacion_night", "postre"];

export default function ReportView({ data, startDate, endDate, userName = "Usuario" }: ReportViewProps) {
    return (
        <div className="bg-white text-black p-6 max-w-[210mm] mx-auto min-h-screen print:p-0 print:max-w-none font-sans text-sm">
            {/* Header */}
            <div className="mb-6 border-b border-gray-200 pb-4">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Reporte de Salud</h1>
                        <p className="text-gray-500 text-xs mt-1">Preparado para {userName}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Rango de Fechas</p>
                        <p className="text-sm font-semibold text-gray-900">
                            {format(startDate, "d 'de' MMMM, yyyy", { locale: es })} - {format(endDate, "d 'de' MMMM, yyyy", { locale: es })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Daily Breakdown */}
            <div className="space-y-6">
                {data.map((day) => {
                    const date = new Date(day.date);
                    const hasData = day.food.length > 0 || day.water > 0 || day.exercise.length > 0;

                    if (!hasData) return null;

                    // Group meals
                    const mealsByType: Record<string, MealItem[]> = {};
                    day.food.forEach(meal => {
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
                        <div key={day.date} className="break-inside-avoid mb-4">
                            <h3 className="text-base font-bold border-b border-gray-200 pb-1 mb-2 text-gray-800 capitalize">
                                {format(date, "EEEE, d 'de' MMMM", { locale: es })}
                            </h3>

                            <div className="grid grid-cols-1 gap-3">
                                {/* Food Section */}
                                {day.food.length > 0 && (
                                    <div className="text-xs">
                                        <div className="flex items-center gap-1.5 mb-1.5 text-orange-700">
                                            <Utensils className="w-3 h-3" />
                                            <h4 className="font-bold uppercase tracking-wide text-[10px]">Nutrición</h4>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pl-4 border-l-2 border-orange-100">
                                            {sortedMealTypes.map(type => (
                                                <div key={type} className="mb-1">
                                                    <span className="font-bold text-gray-700 block mb-0.5">{getMealLabel(type)}</span>
                                                    <ul className="space-y-0.5">
                                                        {mealsByType[type].map((meal, idx) => (
                                                            <li key={idx} className="text-gray-600 flex flex-wrap gap-1">
                                                                {meal.time && <span className="text-gray-400 font-mono text-[10px] mr-1">{meal.time}</span>}
                                                                <span>
                                                                    {meal.items ? meal.items.join(", ") : meal.name}
                                                                </span>
                                                                {meal.calories && meal.calories > 0 && (
                                                                    <span className="text-gray-400 text-[10px]">({meal.calories} kcal)</span>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Exercise Section */}
                                {day.exercise.length > 0 && (
                                    <div className="text-xs mt-1">
                                        <div className="flex items-center gap-1.5 mb-1.5 text-red-700">
                                            <Dumbbell className="w-3 h-3" />
                                            <h4 className="font-bold uppercase tracking-wide text-[10px]">Actividad</h4>
                                        </div>
                                        <ul className="space-y-1 pl-4 border-l-2 border-red-100">
                                            {day.exercise.map((ex, idx) => (
                                                <li key={idx} className="flex justify-between items-baseline">
                                                    <div>
                                                        <span className="font-medium text-gray-800">{ex.activity}</span>
                                                        {ex.notes && <span className="text-gray-500 italic ml-2">- {ex.notes}</span>}
                                                    </div>
                                                    <span className="text-gray-500 font-mono text-[10px]">
                                                        {ex.duration}m {ex.intensity && `• ${ex.intensity}`}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Water Section */}
                                {day.water > 0 && (
                                    <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50/50 px-2 py-1 rounded border border-blue-100 w-fit mt-1">
                                        <Droplets className="w-3 h-3" />
                                        <span className="font-medium">Agua:</span>
                                        <span className="font-bold">{(day.water / 1000).toFixed(1)}L</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="mt-8 pt-2 border-t border-gray-200 text-center text-[10px] text-gray-400 print:fixed print:bottom-2 print:left-0 print:right-0">
                Generado por Vital • {format(new Date(), "PPpp", { locale: es })}
            </div>
        </div>
    );
}
