"use client";
import { useState } from 'react';
import { db } from '../../lib/db';

export default function WaterTracker({ onClose }: { onClose: () => void }) {
    const [glasses, setGlasses] = useState(1);

    const save = async () => {
        await db.logs.add({ water: glasses, date: new Date() });
        onClose();
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">Water Intake</h3>
            <div className="flex items-center justify-center gap-4">
                <button onClick={() => setGlasses(g => Math.max(0, g - 1))} className="p-2 bg-secondary rounded-full">-</button>
                <span className="text-2xl font-bold">{glasses} glasses</span>
                <button onClick={() => setGlasses(g => g + 1)} className="p-2 bg-secondary rounded-full">+</button>
            </div>
            <button onClick={save} className="w-full p-3 bg-primary text-primary-foreground rounded-xl">
                Save Water
            </button>
        </div>
    );
}
