"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { BookOpen } from "lucide-react";
import TrackerLayout from "../../components/ui/TrackerLayout";
import SaveButton from "../../components/ui/SaveButton";

export default function JournalTracker({ onClose, selectedDate, initialData }: { onClose: () => void, selectedDate: Date, initialData?: Doc<"logs"> | null }) {
    const [entry, setEntry] = useState(initialData?.journal || "");
    const [isSaving, setIsSaving] = useState(false);

    const createLog = useMutation(api.logs.createLog);
    const updateLog = useMutation(api.logs.updateLog);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (entry.trim()) {
                if (initialData) {
                    await updateLog({ id: initialData._id, journal: entry, date: selectedDate.toISOString() });
                } else {
                    await createLog({ journal: entry, date: selectedDate.toISOString() });
                }
                onClose();
            }
        } catch (error) {
            console.error("Failed to save journal:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <TrackerLayout
            title="Journal"
            icon={BookOpen}
            iconColor="text-pink-500"
            iconBgColor="bg-pink-500/10"
            onClose={onClose}
        >
            <div className="space-y-4 h-full flex flex-col">
                <textarea
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    placeholder="Write your thoughts..."
                    className="flex-1 w-full p-4 rounded-2xl bg-secondary/50 border border-border/10 focus:bg-secondary focus:ring-2 focus:ring-pink-500/50 transition-all resize-none min-h-[300px]"
                    autoFocus
                />
            </div>

            <SaveButton
                onClick={handleSave}
                isSaving={isSaving}
                label="Save Entry"
                disabled={!entry.trim()}
            />
        </TrackerLayout>
    );
}
