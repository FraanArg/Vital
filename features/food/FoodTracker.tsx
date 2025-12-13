"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import FoodCombobox from "../../components/FoodCombobox";
import { Clock, ChevronRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MEAL_TYPES = [
    { id: "desayuno", label: "Desayuno", icon: "☕" },
    { id: "colacion_am", label: "Colación AM", icon: "🍎" },
    { id: "almuerzo", label: "Almuerzo", icon: "🍽️" },
    { id: "colacion_pm", label: "Colación PM", icon: "🍎" },
    { id: "merienda", label: "Merienda", icon: "🫖" },
    { id: "cena", label: "Cena", icon: "🌙" },
];

const TIME_PRESETS = [
    { label: "Now", value: "now" },
    { label: "08:00", value: "08:00" },
    { label: "12:00", value: "12:00" },
    { label: "16:00", value: "16:00" },
    { label: "20:00", value: "20:00" },
];

interface FoodTrackerProps {
    onClose: () => void;
    selectedDate: Date;
    initialData?: Doc<"logs"> | null;
}

function FoodTracker({ onClose, selectedDate, initialData }: FoodTrackerProps) {
    const [activeTab, setActiveTab] = useState<"meal" | "quick">("meal");
    const [mealType, setMealType] = useState<string | null>(initialData?.meal?.type || null);
    const [time, setTime] = useState(initialData?.meal?.time || "12:00");
    const [items, setItems] = useState<string[]>(initialData?.meal?.items || []);
    const [quickLog, setQuickLog] = useState(initialData?.food || "");
    const [isSaving, setIsSaving] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const createLog = useMutation(api.logs.createLog);
    const updateLog = useMutation(api.logs.updateLog);

    // Auto-select meal and time based on current time ONLY if not editing
    useEffect(() => {
        if (initialData) {
            if (initialData.food) setActiveTab("quick");
            return;
        }

        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // Round to nearest 5 minutes
        let roundedMinute = Math.round(currentMinute / 5) * 5;
        let roundedHour = currentHour;
        if (roundedMinute === 60) {
            roundedMinute = 0;
            roundedHour += 1;
        }

        setTime(`${roundedHour.toString().padStart(2, '0')}:${roundedMinute.toString().padStart(2, '0')}`);

        if (!mealType) {
            if (currentHour >= 6 && currentHour < 10) setMealType("desayuno");
            else if (currentHour >= 10 && currentHour < 12) setMealType("colacion_am");
            else if (currentHour >= 12 && currentHour < 15) setMealType("almuerzo");
            else if (currentHour >= 15 && currentHour < 18) setMealType("colacion_pm");
            else if (currentHour >= 18 && currentHour < 20) setMealType("merienda");
            else setMealType("cena");
        }
    }, [initialData, mealType]);

    const handleTimePreset = useCallback((preset: string) => {
        if (preset === "now") {
            const now = new Date();
            const h = now.getHours().toString().padStart(2, '0');
            const m = (Math.round(now.getMinutes() / 5) * 5).toString().padStart(2, '0');
            setTime(`${h}:${m === '60' ? '00' : m}`);
        } else {
            setTime(preset);
        }
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (activeTab === "meal") {
                if (!mealType || items.length === 0) return;
                const mealData = {
                    type: mealType,
                    items: items,
                    time: time
                };

                if (initialData) {
                    await updateLog({
                        id: initialData._id,
                        meal: mealData,
                        date: selectedDate.toISOString()
                    });
                } else {
                    await createLog({
                        meal: mealData,
                        date: selectedDate.toISOString()
                    });
                }
            } else {
                if (!quickLog.trim()) return;
                if (initialData) {
                    await updateLog({
                        id: initialData._id,
                        food: quickLog,
                        date: selectedDate.toISOString()
                    });
                } else {
                    await createLog({
                        food: quickLog,
                        date: selectedDate.toISOString()
                    });
                }
            }
            onClose();
        } catch (error: any) {
            console.error("Failed to save meal:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const isValid = activeTab === "meal" ? (mealType && items.length > 0) : quickLog.trim().length > 0;

    return (
        <div className="flex flex-col space-y-6">
            {/* iOS Segmented Control */}
            <div className="relative flex p-1 bg-secondary/50 rounded-xl">
                <motion.div
                    className="absolute inset-y-1 bg-background rounded-lg shadow-sm"
                    initial={false}
                    animate={{
                        x: activeTab === "meal" ? 4 : "calc(50% + 2px)",
                        width: "calc(50% - 6px)"
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
                <button
                    onClick={() => setActiveTab("meal")}
                    className={`relative flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors z-10 ${activeTab === "meal" ? "text-foreground" : "text-muted-foreground"
                        }`}
                >
                    Detailed
                </button>
                <button
                    onClick={() => setActiveTab("quick")}
                    className={`relative flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors z-10 ${activeTab === "quick" ? "text-foreground" : "text-muted-foreground"
                        }`}
                >
                    Quick Note
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === "meal" ? (
                    <motion.div
                        key="meal"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-5"
                    >
                        {/* Time Section - iOS Form Row Style */}
                        <div className="bg-secondary/30 rounded-2xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-border/30">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Time</span>
                            </div>

                            {/* Time Row */}
                            <div className="px-4 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="bg-transparent text-lg font-medium border-none focus:outline-none focus:ring-0 p-0"
                                    />
                                </div>
                            </div>

                            {/* Time Presets */}
                            <div className="px-4 pb-3 flex gap-2 flex-wrap">
                                {TIME_PRESETS.map((preset) => (
                                    <button
                                        key={preset.value}
                                        onClick={() => handleTimePreset(preset.value)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${time === preset.value || (preset.value === "now" && false)
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-secondary text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Meal Type Section - 2 Column Grid */}
                        <div className="bg-secondary/30 rounded-2xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-border/30">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Meal Type</span>
                            </div>
                            <div className="p-3 grid grid-cols-2 gap-2">
                                {MEAL_TYPES.map((meal) => {
                                    const isSelected = mealType === meal.id;
                                    return (
                                        <button
                                            key={meal.id}
                                            onClick={() => setMealType(meal.id)}
                                            className={`flex items-center gap-2.5 px-3 py-3 rounded-xl transition-all ${isSelected
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "bg-background/50 text-foreground hover:bg-background"
                                                }`}
                                        >
                                            <span className="text-xl">{meal.icon}</span>
                                            <span className="text-sm font-medium truncate">{meal.label}</span>
                                            {isSelected && <Check className="w-4 h-4 ml-auto shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Food Items Section */}
                        <div className="bg-secondary/30 rounded-2xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-border/30">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Items</span>
                            </div>
                            <div className="p-4">
                                <FoodCombobox selectedItems={items} onItemsChange={setItems} />
                                {items.length === 0 && (
                                    <p className="text-xs text-muted-foreground mt-2">Add at least one item to save</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="quick"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                    >
                        <div className="bg-secondary/30 rounded-2xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-border/30">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quick Note</span>
                            </div>
                            <div className="p-4">
                                <textarea
                                    value={quickLog}
                                    onChange={(e) => setQuickLog(e.target.value)}
                                    placeholder="What did you eat? (e.g., 'Salad with chicken for lunch')"
                                    className="w-full text-base bg-transparent border-none focus:ring-0 placeholder:text-muted-foreground/50 resize-none min-h-[100px] p-0"
                                    autoFocus
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Save Button */}
            <div className="pt-4 border-t border-border/30">
                <button
                    onClick={handleSave}
                    disabled={!isValid || isSaving}
                    className={`w-full py-4 rounded-2xl text-base font-semibold transition-all ${isValid && !isSaving
                            ? "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]"
                            : "bg-secondary text-muted-foreground cursor-not-allowed"
                        }`}
                >
                    {isSaving ? (
                        <span className="flex items-center justify-center gap-2">
                            <motion.div
                                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            Saving...
                        </span>
                    ) : (
                        `Save ${activeTab === "meal" ? "Meal" : "Note"}`
                    )}
                </button>
            </div>
        </div>
    );
}

export default memo(FoodTracker);
