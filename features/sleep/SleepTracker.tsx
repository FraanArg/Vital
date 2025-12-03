import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { Moon } from "lucide-react";
import TrackerLayout from "../../components/ui/TrackerLayout";
import SaveButton from "../../components/ui/SaveButton";
import TimePicker from "../../components/ui/TimePicker";

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
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Total Sleep</span>
                    <span className="text-4xl font-bold text-indigo-500 tracking-tight">{duration}h</span>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Bedtime</label>
                        <TimePicker value={start} onChange={setStart} className="w-full" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Wake Time</label>
                        <TimePicker value={end} onChange={setEnd} className="w-full" />
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <SaveButton
                    onClick={handleSave}
                    isSaving={isSaving}
                    label="Save Sleep"
                />
            </div>
        </TrackerLayout>
    );
}
