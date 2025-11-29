"use client";
import { useState, useEffect } from 'react';
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function SleepTracker({ onClose, selectedDate }: { onClose: () => void, selectedDate: Date }) {
    const [start, setStart] = useState("23:00");
    const [end, setEnd] = useState("07:00");
    const [duration, setDuration] = useState(8);
    const createLog = useMutation(api.logs.createLog);

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
        await createLog({
            sleep: duration,
            sleep_start: start,
            sleep_end: end,
            date: selectedDate.toISOString()
        });
        onClose();
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

            <button onClick={save} className="w-full p-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-sm hover:shadow-md transition-all">
                Save Sleep
            </button>
        </div>
    );
}
