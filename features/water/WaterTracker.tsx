"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { Droplets, Plus, Minus } from "lucide-react";
import TrackerLayout from "../../components/ui/TrackerLayout";
import SaveButton from "../../components/ui/SaveButton";

export default function WaterTracker({ onClose, selectedDate, initialData }: { onClose: () => void, selectedDate: Date, initialData?: Doc<"logs"> | null }) {
    const [amount, setAmount] = useState(initialData?.water || 250);
    const [isSaving, setIsSaving] = useState(false);

    const createLog = useMutation(api.logs.createLog);
    const updateLog = useMutation(api.logs.updateLog);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (initialData) {
                await updateLog({ id: initialData._id, water: amount, date: selectedDate.toISOString() });
            } else {
                await createLog({ water: amount, date: selectedDate.toISOString() });
            }
            onClose();
        } catch (error) {
            console.error("Failed to save water:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <TrackerLayout
            title="Water Intake"
            icon={Droplets}
            iconColor="text-blue-500"
            iconBgColor="bg-blue-500/10"
            onClose={onClose}
        >
            <div className="flex flex-col items-center justify-center py-8 space-y-8">
                <div className="relative">
                    <div className="w-48 h-48 rounded-full border-4 border-blue-100 dark:border-blue-900/30 flex items-center justify-center relative overflow-hidden bg-blue-50/50 dark:bg-blue-900/10">
                        <div
                            className="absolute bottom-0 left-0 right-0 bg-blue-500/20 transition-all duration-500 ease-out"
                            style={{ height: `${Math.min((amount / 3000) * 100, 100)}%` }}
                        />
                        <div className="text-center z-10">
                            <span className="text-5xl font-bold text-blue-600 dark:text-blue-400">{amount}</span>
                            <span className="text-sm text-muted-foreground block mt-1">ml</span>
                        </div>
                    </div>

                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                        <button
                            onClick={() => setAmount(Math.max(0, amount - 250))}
                            className="p-3 rounded-full bg-background shadow-lg border border-border hover:scale-110 transition-transform active:scale-95"
                        >
                            <Minus className="w-5 h-5 text-muted-foreground" />
                        </button>
                        <button
                            onClick={() => setAmount(amount + 250)}
                            className="p-3 rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/30 hover:scale-110 transition-transform active:scale-95"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3 w-full">
                    {[250, 500, 750].map((val) => (
                        <button
                            key={val}
                            onClick={() => setAmount(val)}
                            className={`p-3 rounded-xl border text-sm font-medium transition-all ${amount === val
                                    ? "bg-blue-500/10 border-blue-500 text-blue-600"
                                    : "bg-secondary/50 border-transparent hover:bg-secondary"
                                }`}
                        >
                            {val}ml
                        </button>
                    ))}
                </div>
            </div>

            <SaveButton
                onClick={handleSave}
                isSaving={isSaving}
                label="Save Water"
            />
        </TrackerLayout>
    );
}
