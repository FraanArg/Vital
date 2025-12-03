"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { Plus, Trash2, Sliders } from "lucide-react";
import TrackerLayout from "../../components/ui/TrackerLayout";
import SaveButton from "../../components/ui/SaveButton";

export default function CustomTracker({ onClose, selectedDate, initialData }: { onClose: () => void, selectedDate: Date, initialData?: Doc<"logs"> | null }) {
    const [fields, setFields] = useState<{ name: string; value: number; unit: string }[]>(
        initialData?.custom || [{ name: "", value: 0, unit: "" }]
    );
    const [isSaving, setIsSaving] = useState(false);

    const createLog = useMutation(api.logs.createLog);
    const updateLog = useMutation(api.logs.updateLog);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const validFields = fields.filter(f => f.name.trim() !== "");
            if (validFields.length === 0) return;

            if (initialData) {
                await updateLog({ id: initialData._id, custom: validFields, date: selectedDate.toISOString() });
            } else {
                await createLog({ custom: validFields, date: selectedDate.toISOString() });
            }
            onClose();
        } catch (error) {
            console.error("Failed to save custom log:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const addField = () => {
        setFields([...fields, { name: "", value: 0, unit: "" }]);
    };

    const removeField = (index: number) => {
        setFields(fields.filter((_, i) => i !== index));
    };

    const updateField = (index: number, key: keyof typeof fields[0], value: string | number) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], [key]: value };
        setFields(newFields);
    };

    return (
        <TrackerLayout
            title="Custom Tracker"
            icon={Sliders}
            iconColor="text-gray-500"
            iconBgColor="bg-gray-500/10"
            onClose={onClose}
        >
            <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={index} className="p-4 bg-secondary/30 rounded-2xl space-y-3 relative group">
                        <div className="flex gap-2">
                            <input
                                value={field.name}
                                onChange={(e) => updateField(index, "name", e.target.value)}
                                placeholder="Metric Name (e.g. Meditation)"
                                className="flex-1 p-3 rounded-xl bg-background border-none focus:ring-2 focus:ring-primary"
                            />
                            {fields.length > 1 && (
                                <button
                                    onClick={() => removeField(index)}
                                    className="p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={field.value}
                                onChange={(e) => updateField(index, "value", parseFloat(e.target.value))}
                                className="w-24 p-3 rounded-xl bg-background border-none focus:ring-2 focus:ring-primary text-center font-bold"
                            />
                            <input
                                value={field.unit}
                                onChange={(e) => updateField(index, "unit", e.target.value)}
                                placeholder="Unit (e.g. min)"
                                className="flex-1 p-3 rounded-xl bg-background border-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                ))}

                <button
                    onClick={addField}
                    className="w-full p-4 border-2 border-dashed border-border rounded-2xl text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Another Metric</span>
                </button>
            </div>

            <SaveButton
                onClick={handleSave}
                isSaving={isSaving}
                label="Save Custom Log"
                disabled={fields.every(f => !f.name.trim())}
            />
        </TrackerLayout>
    );
}
