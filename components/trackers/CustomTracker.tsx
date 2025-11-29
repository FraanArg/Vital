"use client";
import { useState } from 'react';
import { db } from '../../lib/db';

export default function CustomTracker({ onClose, selectedDate }: { onClose: () => void, selectedDate: Date }) {
    const [name, setName] = useState('');
    const [value, setValue] = useState('');
    const [unit, setUnit] = useState('');

    const save = async () => {
        if (name && value) {
            // We need to fetch existing log for this date or create a new one if we want to merge custom fields
            // For simplicity in this version, we'll just add a new log entry with the custom field
            // In a real app, you might want to upsert
            await db.logs.add({
                custom: [{ name, value: Number(value), unit }],
                date: selectedDate
            });
            onClose();
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">Custom Tracker</h3>
            <div className="space-y-3">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tracker Name (e.g. Meditation)"
                    className="w-full p-3 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex gap-2">
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Value"
                        className="flex-1 p-3 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                        type="text"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        placeholder="Unit (e.g. min)"
                        className="w-24 p-3 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>
            <button
                type="button"
                onClick={save}
                disabled={!name || !value}
                className="w-full p-3 bg-primary text-primary-foreground rounded-xl disabled:opacity-50"
            >
                Save Custom Log
            </button>
        </div>
    );
}
