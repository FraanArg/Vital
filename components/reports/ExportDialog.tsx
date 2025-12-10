"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { X, Printer, FileText, Loader2, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReportView from "./ReportView";
import { format, subDays } from "date-fns";

interface ExportDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ExportDialog({ isOpen, onClose }: ExportDialogProps) {
    const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), "yyyy-MM-dd"));
    const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [selectedTypes, setSelectedTypes] = useState<string[]>(["food", "exercise", "water"]);
    const [showReport, setShowReport] = useState(false);

    // Query is always active if showReport is true, fetching live data
    const reportData = useQuery(api.reports.generateReport, showReport ? {
        startDate,
        endDate,
        types: selectedTypes
    } : "skip");

    const handleGenerate = () => {
        setShowReport(true);
    };

    const handleClose = () => {
        setShowReport(false);
        onClose();
    };

    const toggleType = (type: string) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {/* Main Dialog */}
            {!showReport ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-card w-full max-w-md rounded-3xl shadow-2xl border border-border/50 overflow-hidden"
                    >
                        <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">Export Report</h2>
                                    <p className="text-xs text-muted-foreground">Generate a summary for your nutritionist</p>
                                </div>
                            </div>
                            <button onClick={handleClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Date Range */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Date Range</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <span className="text-xs text-muted-foreground ml-1">From</span>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="w-full pl-10 pr-3 py-2.5 bg-secondary rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <span className="text-xs text-muted-foreground ml-1">To</span>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="w-full pl-10 pr-3 py-2.5 bg-secondary rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Data Types */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Include Data</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {["food", "exercise", "water"].map((type) => (
                                        <label key={type} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors border border-transparent hover:border-primary/20">
                                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${selectedTypes.includes(type) ? "bg-primary border-primary" : "border-muted-foreground/30"}`}>
                                                {selectedTypes.includes(type) && <div className="w-2.5 h-2.5 bg-primary-foreground rounded-sm" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={selectedTypes.includes(type)}
                                                onChange={() => toggleType(type)}
                                            />
                                            <span className="capitalize font-medium">{type} Logs</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-border/50 bg-muted/30">
                            <button
                                onClick={handleGenerate}
                                disabled={selectedTypes.length === 0}
                                className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                            >
                                Generate Report
                            </button>
                        </div>
                    </motion.div>
                </div>
            ) : (
                /* Full Screen Report Preview */
                <div id="printable-report" className="fixed inset-0 z-[100] bg-white overflow-auto animate-in fade-in duration-300">
                    {/* Toolbar */}
                    <div className="sticky top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 flex justify-between items-center z-10">
                        <button
                            onClick={() => setShowReport(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4" />
                            Close
                        </button>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    const printContent = document.getElementById('report-content');
                                    if (!printContent) return;

                                    const printWindow = window.open('', '_blank', 'width=800,height=600');
                                    if (!printWindow) {
                                        alert('Please allow popups to print the report');
                                        return;
                                    }

                                    printWindow.document.write(`
                                        <!DOCTYPE html>
                                        <html>
                                        <head>
                                            <title>Reporte de Salud</title>
                                            <style>
                                                * { margin: 0; padding: 0; box-sizing: border-box; }
                                                body { 
                                                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                                                    background: white;
                                                    color: black;
                                                    font-size: 12px;
                                                }
                                                @media print {
                                                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                                                }
                                            </style>
                                        </head>
                                        <body>${printContent.innerHTML}</body>
                                        </html>
                                    `);
                                    printWindow.document.close();
                                    printWindow.focus();
                                    setTimeout(() => {
                                        printWindow.print();
                                        printWindow.close();
                                    }, 500);
                                }}
                                className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors shadow-lg"
                            >
                                <Printer className="w-4 h-4" />
                                Print / Save PDF
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div id="report-content" className="min-h-screen bg-gray-50 print:bg-white print:min-h-0 print:h-auto pb-20 print:pb-0">
                        {reportData === undefined ? (
                            <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400 gap-4">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <p>Generating report...</p>
                            </div>
                        ) : (
                            <ReportView
                                data={reportData}
                                startDate={new Date(startDate)}
                                endDate={new Date(endDate)}
                            />
                        )}
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}
