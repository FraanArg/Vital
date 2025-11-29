"use client";

import { Download, Upload } from "lucide-react";
import { db } from "../lib/db";
import { useRef } from "react";

export default function DataExport() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = async () => {
        try {
            const logs = await db.logs.toArray();
            const blob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `personal-tracker-backup-${new Date().toISOString().split("T")[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to export data.");
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                if (Array.isArray(data)) {
                    // Basic validation: check if items have 'date'
                    const validData = data.map(item => ({
                        ...item,
                        date: new Date(item.date) // Rehydrate date string to Date object
                    }));

                    await db.logs.bulkAdd(validData);
                    alert(`Successfully imported ${validData.length} logs!`);
                    window.location.reload(); // Reload to show new data
                } else {
                    alert("Invalid file format: Expected an array of logs.");
                }
            } catch (error) {
                console.error("Import failed:", error);
                alert("Failed to import data. Check the file format.");
            }
        };
        reader.readAsText(file);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={handleExport}
                className="p-2 rounded-full hover:bg-secondary transition-colors text-muted hover:text-foreground"
                title="Export Data"
            >
                <Download className="w-5 h-5" />
            </button>
            <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-full hover:bg-secondary transition-colors text-muted hover:text-foreground"
                title="Import Data"
            >
                <Upload className="w-5 h-5" />
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept=".json"
                className="hidden"
            />
        </div>
    );
}
