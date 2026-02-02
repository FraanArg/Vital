"use client";
import { useState } from 'react';
import { db } from '../../lib/db';
import { Button } from '../ui/Button';

export default function FoodTracker({ onClose, selectedDate }: { onClose: () => void, selectedDate: Date }) {
    const [food, setFood] = useState('');

    const save = async () => {
        if (food.trim()) {
            await db.logs.add({ food, date: selectedDate });
            onClose();
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">Food Log</h3>
            <textarea
                value={food}
                onChange={(e) => setFood(e.target.value)}
                placeholder="What did you eat?"
                className="w-full p-3 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary h-24"
            />
            <Button onClick={save} disabled={!food.trim()} fullWidth>
                Save Food
            </Button>
        </div>
    );
}
