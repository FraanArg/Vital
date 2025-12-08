"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Download, Loader2 } from "lucide-react";

interface ChartExportProps {
    chartRef: React.RefObject<HTMLElement | null>;
    filename?: string;
}

export default function ChartExport({ chartRef, filename = "chart" }: ChartExportProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (!chartRef.current) return;

        setIsExporting(true);
        try {
            const canvas = await html2canvas(chartRef.current, {
                backgroundColor: null,
                scale: 2, // Higher quality
                logging: false,
            });

            const link = document.createElement("a");
            link.download = `${filename}-${new Date().toISOString().split("T")[0]}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        } catch (error) {
            console.error("Export failed:", error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={isExporting}
            className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
            title="Export as PNG"
        >
            {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : (
                <Download className="w-4 h-4 text-muted-foreground" />
            )}
        </button>
    );
}

// Hook for easy integration
export function useChartExport() {
    const chartRef = useRef<HTMLDivElement>(null);
    return { chartRef, ChartExportButton: () => <ChartExport chartRef={chartRef} /> };
}
