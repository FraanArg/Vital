"use client";
import { useState } from 'react';
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function JournalTracker({ onClose, selectedDate, initialData }: { onClose: () => void, selectedDate: Date, initialData?: any }) {
    const [entry, setEntry] = useState(initialData?.journal || '');
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
        if (entry.trim()) {
            if (initialData) {
                await updateLog({
                    id: initialData._id,
                    journal: entry,
                    date: selectedDate.toISOString()
                });
            } else {
                await createLog({ journal: entry, date: selectedDate.toISOString() });
            }
            onClose();
        }
    };

    return (
        <div className="space-y-4 pb-4">
            <h3 className="text-xl font-semibold">Daily Journal</h3>
            <textarea
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="Write about your day..."
                className="w-full h-32 p-3 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary resize-none"
            />
            <button
                type="button"
                onClick={save}
                disabled={!entry.trim()}
                className="w-full p-3 bg-primary text-primary-foreground rounded-xl disabled:opacity-50"
            >
                Save Entry
            </button>
        </div>
    );
}
