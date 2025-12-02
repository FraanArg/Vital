"use client";
import { useState } from 'react';
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

import { Doc } from "../../convex/_generated/dataModel";

export default function CustomTracker({ onClose, selectedDate, initialData }: { onClose: () => void, selectedDate: Date, initialData?: Doc<"logs"> | null }) {
    const [name, setName] = useState(initialData?.custom?.[0]?.name || '');
    const [value, setValue] = useState(initialData?.custom?.[0]?.value?.toString() || '');
    const [unit, setUnit] = useState(initialData?.custom?.[0]?.unit || '');

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
        if (name && value) {
            if (initialData) {
                await updateLog({
                    id: initialData._id,
                    custom: [{ name, value: Number(value), unit }],
                    date: selectedDate.toISOString()
                });
            } else {
                await createLog({
                    custom: [{ name, value: Number(value), unit }],
                    date: selectedDate.toISOString()
                });
            }
            onClose();
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">Custom Tracker</h3>
            <div className="space-y-3">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tracker Name (e.g. Meditation)"
                    className="w-full p-3 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex gap-2">
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Value"
                        className="flex-1 p-3 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                        type="text"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        placeholder="Unit (e.g. min)"
                        className="w-24 p-3 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>
            <button
                type="button"
                onClick={save}
                disabled={!name || !value}
                className="w-full p-3 bg-primary text-primary-foreground rounded-xl disabled:opacity-50"
            >
                Save Custom Log
            </button>
        </div>
    );
}
