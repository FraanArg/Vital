"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { Moon } from "lucide-react";
import TrackerLayout from "../../components/ui/TrackerLayout";
import SaveButton from "../../components/ui/SaveButton";

export default function SleepTracker({ onClose, selectedDate, initialData }: { onClose: () => void, selectedDate: Date, initialData?: Doc<"logs"> | null }) {
    const [start, setStart] = useState(initialData?.sleep_start || "23:00");
    const [end, setEnd] = useState(initialData?.sleep_end || "07:00");
    const [duration, setDuration] = useState(initialData?.sleep || 8);
    const [isSaving, setIsSaving] = useState(false);

    const createLog = useMutation(api.logs.createLog);
    const updateLog = useMutation(api.logs.updateLog);

    useEffect(() => {
        if (start && end) {
            const [startH, startM] = start.split(':').map(Number);
            const [endH, endM] = end.split(':').map(Number);

            let startMinutes = startH * 60 + startM;
            let endMinutes = endH * 60 + endM;

            if (endMinutes < startMinutes) {
                endMinutes += 24 * 60; // Crossed midnight
            }

            const diffMinutes = endMinutes - startMinutes;
            setDuration(Number((diffMinutes / 60).toFixed(1)));
        }
    }, [start, end]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const logData = {
                sleep: duration,
                sleep_start: start,
                sleep_end: end,
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
        } catch (error) {
            console.error("Failed to save sleep:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <TrackerLayout
            title="Sleep Tracking"
            icon={Moon}
            iconColor="text-indigo-500"
            iconBgColor="bg-indigo-500/10"
            onClose={onClose}
        >
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Total Sleep</span>
                    <span className="text-2xl font-bold text-indigo-500">{duration}h</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Bedtime</label>
                        <input
                            type="time"
                            value={start}
                            onChange={(e) => setStart(e.target.value)}
                            className="w-full p-4 rounded-2xl bg-secondary/50 border border-border/10 focus:bg-secondary focus:ring-2 focus:ring-indigo-500/50 transition-all text-center text-xl font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Wake Time</label>
                        <input
                            type="time"
                            value={end}
                            onChange={(e) => setEnd(e.target.value)}
                            className="w-full p-4 rounded-2xl bg-secondary/50 border border-border/10 focus:bg-secondary focus:ring-2 focus:ring-indigo-500/50 transition-all text-center text-xl font-bold"
                        />
                    </div>
                </div>
            </div>

            <SaveButton
                onClick={handleSave}
                isSaving={isSaving}
                label="Save Sleep"
            />
        </TrackerLayout>
    );
}
