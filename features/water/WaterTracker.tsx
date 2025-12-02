"use client";
import { useState } from 'react';
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useHaptic } from "../../hooks/useHaptic";

import { Doc } from "../../convex/_generated/dataModel";

export default function WaterTracker({ onClose, selectedDate, initialData }: { onClose: () => void, selectedDate: Date, initialData?: Doc<"logs"> | null }) {
    const [liters, setLiters] = useState(initialData?.water || 0.5);
    const { trigger } = useHaptic();
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
                water: liters,
                date: selectedDate.toISOString()
            });
        } else {
            await createLog({ water: liters, date: selectedDate.toISOString() });
        }
        onClose();
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">Water Intake</h3>
            <div className="flex items-center justify-between bg-secondary/30 rounded-2xl p-2">
                <button
                    onClick={() => {
                        trigger("light");
                        setLiters((l: number) => Math.max(0, Number((l - 0.25).toFixed(2))));
                    }}
                    className="w-12 h-12 bg-background shadow-sm rounded-xl flex items-center justify-center text-xl font-bold hover:scale-105 transition-transform"
                >
                    -
                </button>
                <div className="flex items-center justify-center gap-1">
                    <input
                        autoFocus
                        inputMode="decimal"
                        type="number"
                        value={liters}
                        onChange={(e) => setLiters(parseFloat(e.target.value) || 0)}
                        className="w-24 text-center text-3xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        step="0.25"
                    />
                    <span className="text-xl font-medium text-muted-foreground">L</span>
                </div>
                <button
                    onClick={() => {
                        trigger("light");
                        setLiters((l: number) => Number((l + 0.25).toFixed(2)));
                    }}
                    className="w-12 h-12 bg-background shadow-sm rounded-xl flex items-center justify-center text-xl font-bold hover:scale-105 transition-transform"
                >
                    +
                </button>
            </div>
            <button onClick={() => {
                trigger("success");
                save();
            }} className="w-full p-3 bg-primary text-primary-foreground rounded-xl">
                Save Water
            </button>
        </div>
    );
}
