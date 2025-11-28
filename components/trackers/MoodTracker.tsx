"use client";
import { useState } from 'react';
import { db } from '../../lib/db';

export default function MoodTracker({ onClose }: { onClose: () => void }) {
    const [rating, setRating] = useState<number | null>(null);

    const save = async () => {
        if (rating) {
            await db.logs.add({ mood: rating, date: new Date() });
            onClose();
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">How are you feeling?</h3>
            <div className="flex justify-between gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                    <button
                        key={num}
                        onClick={() => setRating(num)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${rating === num ? 'bg-primary text-primary-foreground scale-110' : 'bg-secondary hover:bg-secondary/80'
                            }`}
                    >
                        {num}
                    </button>
                ))}
            </div>
            <button onClick={save} disabled={!rating} className="w-full p-3 bg-primary text-primary-foreground rounded-xl disabled:opacity-50">
                Save Mood
            </button>
        </div>
    );
}
