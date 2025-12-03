"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { Briefcase, Clock } from "lucide-react";
import TrackerLayout from "../../components/ui/TrackerLayout";
import SaveButton from "../../components/ui/SaveButton";

export default function WorkTracker({ onClose, selectedDate, initialData }: { onClose: () => void, selectedDate: Date, initialData?: Doc<"logs"> | null }) {
    const [hours, setHours] = useState(initialData?.work || 8);
    const [isSaving, setIsSaving] = useState(false);

    const createLog = useMutation(api.logs.createLog);
    const updateLog = useMutation(api.logs.updateLog);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (initialData) {
                await updateLog({ id: initialData._id, work: hours, date: selectedDate.toISOString() });
            } else {
                await createLog({ work: hours, date: selectedDate.toISOString() });
            }
            onClose();
        } catch (error) {
            console.error("Failed to save work:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <TrackerLayout
            title="Work Log"
            icon={Briefcase}
            iconColor="text-orange-500"
            iconBgColor="bg-orange-500/10"
            onClose={onClose}
        >
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Hours Worked</label>
                    <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-2xl">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                        <input
                            type="range"
                            min="0"
                            max="16"
                            step="0.5"
                            value={hours}
                            onChange={(e) => setHours(parseFloat(e.target.value))}
                            className="flex-1 accent-orange-500"
                        />
                        <span className="text-2xl font-bold w-16 text-right text-orange-500">{hours}h</span>
                    </div>
                </div>
            </div>

            <SaveButton
                onClick={handleSave}
                isSaving={isSaving}
                label="Save Work"
            />
        </TrackerLayout>
    );
}
