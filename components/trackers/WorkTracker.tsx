"use client";
import { useState } from 'react';
import { db } from '../../lib/db';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { Minus, Plus } from 'lucide-react';

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
                <IconButton
                    onClick={() => setHours(h => Math.max(0, h - 0.5))}
                    variant="filled"
                    label="Decrease hours"
                >
                    <Minus className="w-4 h-4" />
                </IconButton>
                <span className="text-2xl font-bold">{hours}h</span>
                <IconButton
                    onClick={() => setHours(h => h + 0.5)}
                    variant="filled"
                    label="Increase hours"
                >
                    <Plus className="w-4 h-4" />
                </IconButton>
            </div>
            <Button onClick={save} fullWidth>
                Save Work
            </Button>
        </div>
    );
}
