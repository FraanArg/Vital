"use client";
import { useState } from 'react';
import { db } from '../../lib/db';

export default function WorkTracker({ onClose, selectedDate }: { onClose: () => void, selectedDate: Date }) {
    const [hours, setHours] = useState(8);

    const save = async () => {
        await db.logs.add({ work: hours, date: selectedDate });
        onClose();
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">Work Hours</h3>
            <div className="flex items-center justify-center gap-4">
                <button type="button" onClick={() => setHours(h => Math.max(0, h - 0.5))} className="p-2 bg-secondary rounded-full">-</button>
                <span className="text-2xl font-bold">{hours}h</span>
                <button type="button" onClick={() => setHours(h => h + 0.5)} className="p-2 bg-secondary rounded-full">+</button>
            </div>
            <button type="button" onClick={save} className="w-full p-3 bg-primary text-primary-foreground rounded-xl">
                Save Work
            </button>
        </div>
    );
}
