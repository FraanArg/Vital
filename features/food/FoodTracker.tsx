"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import FoodCombobox from "../../components/FoodCombobox";
import { Clock } from "lucide-react";
import SuggestionRow from "../../components/SuggestionRow";

const MEAL_ROWS = [
    [
        { id: "desayuno", label: "DESAYUNO", icon: "☕" },
        { id: "colacion_am", label: "COLACIÓN (MAÑANA)", icon: "🍎" }
    ],
    [
        { id: "almuerzo", label: "ALMUERZO", icon: "🍽️" },
        { id: "colacion_pm", label: "COLACIÓN (SIESTA)", icon: "🍎" }
    ],
    [
        { id: "merienda", label: "MERIENDA", icon: "🫖" },
        { id: "colacion_night", label: "COLACIÓN (TARDE)", icon: "🍎" }
    ],
    [
        { id: "cena", label: "CENA", icon: "🌙" },
        { id: "postre", label: "POSTRE", icon: "🍰" }
    ]
];

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = ["00", "15", "30", "45"];

export default function FoodTracker({ onClose, selectedDate, initialData }: { onClose: () => void, selectedDate: Date, initialData?: Doc<"logs"> | null }) {
    const [mealType, setMealType] = useState<string | null>(initialData?.meal?.type || null);
    const [selectedHour, setSelectedHour] = useState(initialData?.meal?.time?.split(':')[0] || "12");
    const [selectedMinute, setSelectedMinute] = useState(initialData?.meal?.time?.split(':')[1] || "00");
    const [items, setItems] = useState<string[]>(initialData?.meal?.items || []);
    const [isSaving, setIsSaving] = useState(false);

    const createLog = useMutation(api.logs.createLog);
    const updateLog = useMutation(api.logs.updateLog);

    // Auto-select meal and time based on current time ONLY if not editing
    useEffect(() => {
        if (initialData) return;

        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // Round to nearest 15 minutes
        let roundedMinute = "00";
        if (currentMinute >= 45) roundedMinute = "45";
        else if (currentMinute >= 30) roundedMinute = "30";
        else if (currentMinute >= 15) roundedMinute = "15";

        setSelectedHour(currentHour.toString().padStart(2, '0'));
        setSelectedMinute(roundedMinute);

        if (!mealType) {
            if (currentHour >= 6 && currentHour < 10) setMealType("desayuno");
            else if (currentHour >= 10 && currentHour < 12) setMealType("colacion_am");
            else if (currentHour >= 12 && currentHour < 15) setMealType("almuerzo");
            else if (currentHour >= 15 && currentHour < 17) setMealType("colacion_pm");
            else if (currentHour >= 17 && currentHour < 19) setMealType("merienda");
            else if (currentHour >= 19 && currentHour < 21) setMealType("colacion_night");
            else if (currentHour >= 21 && currentHour < 23) setMealType("cena");
            else setMealType("postre");
        }
    }, [initialData]);

    const save = async () => {
        if (mealType && items.length > 0) {
            setIsSaving(true);
            try {
                const logData = {
                    meal: {
                        type: mealType,
                        items: items,
                        time: `${selectedHour}:${selectedMinute}`
                    },
                    date: selectedDate.toISOString()
                };

                if (initialData) {
                    await updateLog({
                        id: initialData._id,
                        ...logData
                    });
                } else {
                    await createLog(logData);
                }
                onClose();
            } catch (error: any) {
                console.error("Failed to save meal:", error);
                alert(`Failed to save meal: ${error.message || "Unknown error"}`);
                setIsSaving(false);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h3 className="text-lg font-medium text-muted-foreground">Log Meal</h3>
                <div className="flex items-center justify-center gap-2">
                    <div className="relative">
                        <select
                            value={selectedHour}
                            onChange={(e) => setSelectedHour(e.target.value)}
                            className="appearance-none bg-secondary hover:bg-secondary/80 transition-colors text-xl font-semibold py-2 pl-4 pr-8 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                        >
                            {HOURS.map(h => (
                                <option key={h} value={h}>{h}</option>
                            ))}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </div>
                    </div>
                    <span className="text-xl font-bold text-muted-foreground">:</span>
                    <div className="relative">
                        <select
                            value={selectedMinute}
                            onChange={(e) => setSelectedMinute(e.target.value)}
                            className="appearance-none bg-secondary hover:bg-secondary/80 transition-colors text-xl font-semibold py-2 pl-4 pr-8 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                        >
                            {MINUTES.map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            <SuggestionRow
                suggestions={useQuery(api.suggestions.getSuggestions, { type: "food" })?.map(s => ({ name: s.name })) || []}
                type="food"
                onSelect={(name) => {
                    if (!items.includes(name)) {
                        setItems([...items, name]);
                    }
                }}
            />

            {/* Meal Type - Explicit Rows */}
            <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider pl-1">Meal Type</label>
                <div className="space-y-2">
                    {MEAL_ROWS.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex gap-2">
                            {row.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setMealType(type.id)}
                                    className={`flex-1 flex items-center gap-3 p-3 rounded-xl transition-all border border-transparent ${mealType === type.id
                                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20 scale-[1.02]"
                                        : "bg-secondary/50 hover:bg-secondary text-muted-foreground hover:border-border/50"
                                        }`}
                                >
                                    <span className="text-xl">{type.icon}</span>
                                    <span className="text-xs font-bold uppercase tracking-wide text-left truncate">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Food Selection */}
            <div className="space-y-2 relative z-10">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider pl-1">Items</label>
                <FoodCombobox selectedItems={items} onItemsChange={setItems} />
            </div>

            <button
                type="button"
                onClick={save}
                disabled={!mealType || items.length === 0 || isSaving}
                className="w-full p-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl disabled:opacity-50 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                {isSaving ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Saving...</span>
                    </>
                ) : (
                    "Save Meal"
                )}
            </button>
        </div>
    );
}
