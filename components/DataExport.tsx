'use client';

import { db } from '../lib/db';
import { Download } from 'lucide-react';

export default function DataExport() {
    const handleExport = async () => {
        const logs = await db.logs.toArray();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "tracker_data.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return (
        <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors"
        >
            <Download className="w-4 h-4" />
            Export for AI
        </button>
    );
}
