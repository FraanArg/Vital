"use client";
import { useState, useEffect } from 'react';
import { useMutation, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Loader2 } from "lucide-react";

export default function SleepTracker({ onClose, selectedDate }: { onClose: () => void, selectedDate: Date }) {
    const [start, setStart] = useState("23:00");
    const [end, setEnd] = useState("07:00");
    const [duration, setDuration] = useState(8);
    const [isSaving, setIsSaving] = useState(false);
    const createLog = useMutation(api.logs.createLog).withOptimisticUpdate((localStore, args) => {
        const { date, ...logData } = args;
        const logDate = new Date(date);
        const start = new Date(logDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(logDate);
        end.setHours(23, 59, 59, 999);

        const queryArgs = { from: start.toISOString(), to: end.toISOString() };
        const existingLogs = localStore.getQuery(api.logs.getLogs, queryArgs);

        if (existingLogs) {
            const newLog: any = {
                _id: crypto.randomUUID(),
                _creationTime: Date.now(),
                userId: "temp-optimistic-id",
                date: date,
                ...logData
            };
            localStore.setQuery(api.logs.getLogs, queryArgs, [...existingLogs, newLog]);
        }
    });

    const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();

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

    const save = async () => {
        if (!isAuthenticated) {
            alert("Please sign in to save your sleep log.");
            return;
        }

        setIsSaving(true);
        try {
            // Construct the date object using the Wake Time (end)
            const [endH, endM] = end.split(':').map(Number);
            const logDate = new Date(selectedDate);
            logDate.setHours(endH, endM, 0, 0);

            await createLog({
                sleep: duration,
                sleep_start: start,
                sleep_end: end,
                date: logDate.toISOString()
            });
            onClose();
        } catch (error) {
            console.error("Failed to save sleep log:", error);
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Sleep Tracking</h3>
                <span className="text-2xl font-bold text-primary">{duration}h</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Bedtime</label>
                    <input
                        type="time"
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                        className="w-full p-3 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary text-center font-medium"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Wake Time</label>
                    <input
                        type="time"
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                        className="w-full p-3 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary text-center font-medium"
                    />
                </div>
            </div>

            <button
                onClick={save}
                disabled={isSaving || isAuthLoading}
                className="w-full p-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {isSaving || isAuthLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {isSaving ? "Saving..." : isAuthLoading ? "Verifying..." : "Save Sleep"}
            </button>

            {!isAuthenticated && !isAuthLoading && (
                <p className="text-xs text-center text-red-500">
                    You must be signed in to save data.
                </p>
            )}
        </div>
    );
}
