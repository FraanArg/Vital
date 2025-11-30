"use client";
import { useState } from 'react';
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function WaterTracker({ onClose, selectedDate }: { onClose: () => void, selectedDate: Date }) {
    const [liters, setLiters] = useState(0.5);
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

    const save = async () => {
        await createLog({ water: liters, date: selectedDate.toISOString() });
        onClose();
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">Water Intake</h3>
            <div className="flex items-center justify-center gap-4">
                <button onClick={() => setLiters(l => Math.max(0, l - 0.25))} className="p-2 bg-secondary rounded-full">-</button>
                <span className="text-2xl font-bold">{liters} L</span>
                <button onClick={() => setLiters(l => l + 0.25)} className="p-2 bg-secondary rounded-full">+</button>
            </div>
            <button onClick={save} className="w-full p-3 bg-primary text-primary-foreground rounded-xl">
                Save Water
            </button>
        </div>
    );
}
