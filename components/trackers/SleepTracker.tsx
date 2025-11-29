"use client";
import { useState } from 'react';
import { db } from '../../lib/db';

export default function SleepTracker({ onClose, selectedDate }: { onClose: () => void, selectedDate: Date }) {
    const [hours, setHours] = useState(7);

    const save = async () => {
        await db.logs.add({ sleep: hours, date: selectedDate });
        onClose();
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">Hours of Sleep</h3>
            <div className="flex items-center justify-center gap-4">
                <button onClick={() => setHours(h => Math.max(0, h - 0.5))} className="p-2 bg-secondary rounded-full">-</button>
                <span className="text-2xl font-bold">{hours}h</span>
                <button onClick={() => setHours(h => h + 0.5)} className="p-2 bg-secondary rounded-full">+</button>
            </div>
            <button onClick={save} className="w-full p-3 bg-primary text-primary-foreground rounded-xl">
                Save Sleep
            </button>
        </div>
    );
}
