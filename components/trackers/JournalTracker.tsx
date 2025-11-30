"use client";
import { useState } from 'react';
import { db } from '../../lib/db';

export default function JournalTracker({ onClose, selectedDate }: { onClose: () => void, selectedDate: Date }) {
    const [entry, setEntry] = useState('');

    const save = async () => {
        if (entry.trim()) {
            await db.logs.add({ journal: entry, date: selectedDate });
            onClose();
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">Daily Journal</h3>
            <textarea
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="Write about your day..."
                className="w-full h-32 p-3 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary resize-none"
            />
            <button
                type="button"
                onClick={save}
                disabled={!entry.trim()}
                className="w-full p-3 bg-primary text-primary-foreground rounded-xl disabled:opacity-50"
            >
                Save Entry
            </button>
        </div>
    );
}
