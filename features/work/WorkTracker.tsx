"use client";
import { useState } from 'react';
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

import { Doc } from "../../convex/_generated/dataModel";

export default function WorkTracker({ onClose, selectedDate, initialData }: { onClose: () => void, selectedDate: Date, initialData?: Doc<"logs"> | null }) {
    const [hours, setHours] = useState(initialData?.work || 8);
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
    const updateLog = useMutation(api.logs.updateLog);

    const save = async () => {
        if (initialData) {
            await updateLog({
                id: initialData._id,
                work: hours,
                date: selectedDate.toISOString()
            });
        } else {
            await createLog({ work: hours, date: selectedDate.toISOString() });
        }
        onClose();
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">Work Hours</h3>
            <div className="flex items-center justify-center gap-4">
                <button type="button" onClick={() => setHours((h: number) => Math.max(0, h - 0.5))} className="p-2 bg-secondary rounded-full">-</button>
                <span className="text-2xl font-bold">{hours}h</span>
                <button type="button" onClick={() => setHours((h: number) => h + 0.5)} className="p-2 bg-secondary rounded-full">+</button>
            </div>
            <button type="button" onClick={save} className="w-full p-3 bg-primary text-primary-foreground rounded-xl">
                Save Work
            </button>
        </div>
    );
}
