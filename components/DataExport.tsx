"use client";

import { Download, Upload, FileSpreadsheet } from "lucide-react";
import { useRef } from "react";
import { useConvex, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export default function DataExport() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const convex = useConvex();
    const importData = useMutation(api.data.importData);

    const handleExportJSON = async () => {
        try {
            const logs = await convex.query(api.data.exportData);
            const blob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `vital-backup-${new Date().toISOString().split("T")[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to export data.");
        }
    };

    const handleExportCSV = async () => {
        try {
            const logs = await convex.query(api.data.exportData);
            if (!logs || logs.length === 0) {
                alert("No data to export.");
                return;
            }

            // Convert to CSV
            const headers = ["Date", "Water (L)", "Sleep (h)", "Mood", "Exercise", "Food", "Meal"];
            const csvRows = [headers.join(",")];

            for (const log of logs) {
                const row = [
                    log.date,
                    log.water || 0,
                    log.sleep || 0,
                    log.mood || 0,
                    log.exercise ? "Yes" : "No",
                    `"${(log.food || "").replace(/"/g, '""')}"`, // Escape quotes
                    `"${(log.meal?.items?.join(", ") || "").replace(/"/g, '""')}"`
                ];
                csvRows.push(row.join(","));
            }

            const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `vital-data-${new Date().toISOString().split("T")[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("CSV Export failed:", error);
            alert("Failed to export CSV.");
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
                    // Convex handles validation, but we can do a quick check
                    const result = await importData({ logs: data });
                    alert(`Successfully imported ${result.count} logs!`);
                    // No need to reload, Convex is reactive!
                } else {
                    alert("Invalid file format: Expected an array of logs.");
                }
            } catch (error) {
                console.error("Import failed:", error);
                alert("Failed to import data. Check the file format.");
            }
        };
        reader.readAsText(file);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={handleExportCSV}
                className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                title="Export CSV"
            >
                <FileSpreadsheet className="w-5 h-5" />
            </button>
            <button
                onClick={handleExportJSON}
                className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                title="Export JSON (Backup)"
            >
                <Download className="w-5 h-5" />
            </button>
            <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                title="Import JSON"
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
