import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import FoodCombobox from "../../components/FoodCombobox";
import { Utensils } from "lucide-react";
import TrackerLayout from "../../components/ui/TrackerLayout";
import SaveButton from "../../components/ui/SaveButton";
import ChipSelector from "../../components/ui/ChipSelector";
import TimePicker from "../../components/ui/TimePicker";
import CollapsibleNote from "../../components/ui/CollapsibleNote";

const MEAL_TYPES = [
    { id: "desayuno", label: "Desayuno", icon: "☕" },
    { id: "colacion_am", label: "Colación (AM)", icon: "🍎" },
    { id: "almuerzo", label: "Almuerzo", icon: "🍽️" },
    { id: "colacion_pm", label: "Colación (Siesta)", icon: "🍎" },
    { id: "merienda", label: "Merienda", icon: "🫖" },
    { id: "colacion_night", label: "Colación (PM)", icon: "🍎" },
    { id: "cena", label: "Cena", icon: "🌙" },
    { id: "postre", label: "Postre", icon: "🍰" }
];

export default function FoodTracker({ onClose, selectedDate, initialData }: { onClose: () => void, selectedDate: Date, initialData?: Doc<"logs"> | null }) {
    const [activeTab, setActiveTab] = useState<"meal" | "quick">("meal");
    const [mealType, setMealType] = useState<string | null>(initialData?.meal?.type || null);
    const [time, setTime] = useState(initialData?.meal?.time || "12:00");
    const [items, setItems] = useState<string[]>(initialData?.meal?.items || []);
    const [quickLog, setQuickLog] = useState(initialData?.food || "");
    const [isSaving, setIsSaving] = useState(false);

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

        // Round to nearest 15 minutes
        let roundedMinute = Math.round(currentMinute / 15) * 15;
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
            else if (currentHour >= 15 && currentHour < 17) setMealType("colacion_pm");
            else if (currentHour >= 17 && currentHour < 19) setMealType("merienda");
            else if (currentHour >= 19 && currentHour < 21) setMealType("colacion_night");
            else if (currentHour >= 21 && currentHour < 23) setMealType("cena");
            else setMealType("postre");
        }
    }, [initialData]);

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
            alert(`Failed to save meal: ${error.message || "Unknown error"}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <TrackerLayout
            title="Food & Meals"
            icon={Utensils}
            iconColor="text-orange-600 dark:text-orange-400"
            iconBgColor="bg-orange-100 dark:bg-orange-900/30"
            onClose={onClose}
        >
            <div className="flex p-1 bg-secondary/50 rounded-xl mb-6">
                <button
                    onClick={() => setActiveTab("meal")}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "meal" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                    Detailed Meal
                </button>
                <button
                    onClick={() => setActiveTab("quick")}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "quick" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                    Quick Log
                </button>
            </div>

            {activeTab === "meal" ? (
                <div className="space-y-8">
                    {/* Time & Meal Type */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-muted-foreground">Time</label>
                            <TimePicker value={time} onChange={setTime} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Meal Type</label>
                            <ChipSelector
                                options={MEAL_TYPES}
                                selectedId={mealType}
                                onSelect={setMealType}
                            />
                        </div>
                    </div>

                    {/* Food Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Items</label>
                        <FoodCombobox selectedItems={items} onItemsChange={setItems} />
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <textarea
                        value={quickLog}
                        onChange={(e) => setQuickLog(e.target.value)}
                        placeholder="What did you eat?"
                        className="w-full p-0 text-lg bg-transparent border-none focus:ring-0 placeholder:text-muted-foreground/50 resize-none min-h-[120px]"
                        autoFocus
                    />
                </div>
            )}

            <div className="mt-8">
                <SaveButton
                    onClick={handleSave}
                    disabled={activeTab === "meal" ? (!mealType || items.length === 0) : !quickLog.trim()}
                    isSaving={isSaving}
                    label="Save Meal"
                />
            </div>
        </TrackerLayout>
    );
}
