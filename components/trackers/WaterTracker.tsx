"use client";
import { useState } from 'react';
import { db } from '../../lib/db';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { Minus, Plus } from 'lucide-react';

export default function WaterTracker({ onClose, selectedDate }: { onClose: () => void, selectedDate: Date }) {
    const [glasses, setGlasses] = useState(1);

    const save = async () => {
        await db.logs.add({ water: glasses, date: selectedDate });
        onClose();
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">Water Intake</h3>
            <div className="flex items-center justify-center gap-4">
                <IconButton
                    onClick={() => setGlasses(g => Math.max(0, g - 1))}
                    variant="filled"
                    label="Decrease glasses"
                >
                    <Minus className="w-4 h-4" />
                </IconButton>
                <span className="text-2xl font-bold">{glasses} glasses</span>
                <IconButton
                    onClick={() => setGlasses(g => g + 1)}
                    variant="filled"
                    label="Increase glasses"
                >
                    <Plus className="w-4 h-4" />
                </IconButton>
            </div>
            <Button onClick={save} fullWidth>
                Save Water
            </Button>
        </div>
    );
}
