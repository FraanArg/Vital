"use client";
import { useState } from 'react';
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function WaterTracker({ onClose, selectedDate }: { onClose: () => void, selectedDate: Date }) {
    const [liters, setLiters] = useState(0.5);
    const createLog = useMutation(api.logs.createLog);

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
