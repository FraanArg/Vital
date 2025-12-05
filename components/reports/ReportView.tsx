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

export default function ReportView({ data, startDate, endDate, userName = "Usuario" }: ReportViewProps) {
    return (
        <div className="bg-white text-black p-4 max-w-[297mm] mx-auto min-h-screen print:p-0 print:max-w-none font-sans text-xs">
            {/* Header */}
            <div className="mb-4 border-b border-gray-200 pb-2 flex justify-between items-end">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-gray-900">Reporte de Salud</h1>
                    <p className="text-gray-500 text-[10px]">Preparado para <span className="font-semibold text-gray-700">{userName}</span></p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Rango</p>
                    <p className="text-sm font-semibold text-gray-900">
                        {format(startDate, "d MMM", { locale: es })} - {format(endDate, "d MMM, yyyy", { locale: es })}
                    </p>
                </div>
            </div>

            {/* Compact Table */}
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr className="border-b-2 border-gray-800 text-[10px] uppercase tracking-wider text-gray-600">
                        <th className="py-1 w-24">Fecha</th>
                        <th className="py-1">Alimentación</th>
                        <th className="py-1 w-48">Actividad</th>
                        <th className="py-1 w-16 text-right">Agua</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
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
                            <tr key={day.date} className="break-inside-avoid hover:bg-gray-50">
                                {/* Date Column */}
                                <td className="py-2 pr-2 align-top">
                                    <div className="font-bold text-gray-900 whitespace-nowrap">
                                        {format(date, "EEE d", { locale: es })}
                                    </div>
                                    <div className="text-[9px] text-gray-400 capitalize">
                                        {format(date, "MMMM", { locale: es })}
                                    </div>
                                </td>

                                {/* Food Column */}
                                <td className="py-2 pr-2 align-top">
                                    {day.food.length > 0 ? (
                                        <div className="space-y-1">
                                            {sortedMealTypes.map(type => (
                                                <div key={type} className="flex items-baseline gap-1 text-[10px] leading-tight">
                                                    <span className="font-bold text-gray-700 min-w-[60px] shrink-0">{getMealLabel(type)}:</span>
                                                    <span className="text-gray-600">
                                                        {mealsByType[type].map((meal, idx) => (
                                                            <span key={idx}>
                                                                {idx > 0 && ", "}
                                                                {meal.items ? meal.items.join(", ") : meal.name}
                                                                {meal.calories && meal.calories > 0 && <span className="text-gray-400 ml-0.5">({meal.calories})</span>}
                                                            </span>
                                                        ))}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-gray-300 text-[10px] italic">-</span>
                                    )}
                                </td>

                                {/* Exercise Column */}
                                <td className="py-2 pr-2 align-top">
                                    {day.exercise.length > 0 ? (
                                        <ul className="space-y-0.5">
                                            {day.exercise.map((ex, idx) => (
                                                <li key={idx} className="text-[10px] leading-tight">
                                                    <span className="font-medium text-gray-800">{ex.activity}</span>
                                                    <span className="text-gray-500 ml-1">
                                                        ({ex.duration}m{ex.intensity ? `, ${ex.intensity}` : ''})
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span className="text-gray-300 text-[10px] italic">-</span>
                                    )}
                                </td>

                                {/* Water Column */}
                                <td className="py-2 align-top text-right">
                                    {day.water > 0 ? (
                                        <span className="font-bold text-blue-600 text-[11px]">
                                            {(day.water / 1000).toFixed(1)}L
                                        </span>
                                    ) : (
                                        <span className="text-gray-300 text-[10px]">-</span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Footer */}
            <div className="mt-4 pt-2 border-t border-gray-200 flex justify-between text-[9px] text-gray-400 print:fixed print:bottom-2 print:left-4 print:right-4">
                <span>Generado por Vital</span>
                <span>{format(new Date(), "PPpp", { locale: es })}</span>
            </div>
        </div>
    );
}
