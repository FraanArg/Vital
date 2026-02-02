"use client";
import { useState } from 'react';
import { db } from '../../lib/db';
import { Button } from '../ui/Button';

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
            <Button onClick={save} disabled={!entry.trim()} fullWidth>
                Save Entry
            </Button>
        </div>
    );
}
