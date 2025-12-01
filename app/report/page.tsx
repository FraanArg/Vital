"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { format, subDays } from "date-fns";
import { Calendar, Filter, Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ReportView from "../../components/ReportView";

export default function ReportPage() {
    const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), "yyyy-MM-dd"));
    const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [categories, setCategories] = useState<string[]>(["food", "exercise", "water", "sleep", "mood"]);

    // Fetch logs
    // Note: We fetch a bit more and filter client side for simplicity with the date range inputs
    // In a real app with huge data, we'd pass the precise range to the query
    const logs = useQuery(api.logs.getLogs, {
        from: new Date(startDate).toISOString(),
        to: new Date(endDate + "T23:59:59").toISOString()
    });

    const toggleCategory = (cat: string) => {
        setCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-background pb-20 print:pb-0 print:bg-white">
            {/* Header - Hidden on Print */}
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50 print:hidden">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="font-bold text-lg">Nutritionist Report</h1>
                    </div>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity"
                    >
                        <Printer className="w-4 h-4" />
                        Print / PDF
                    </button>
                </div>
            </header>

            <div className="max-w-4xl mx-auto p-4 md:p-8 grid md:grid-cols-[300px_1fr] gap-8 print:block print:p-0">

                {/* Controls Sidebar - Hidden on Print */}
                <aside className="space-y-6 print:hidden">
                    {/* Date Range */}
                    <section className="bg-card p-5 rounded-2xl border border-border/50 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 font-semibold text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            Date Range
                        </div>
                        <div className="grid gap-3">
                            <div>
                                <label className="text-xs font-medium ml-1 mb-1 block">From</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full p-2 rounded-lg bg-secondary border-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium ml-1 mb-1 block">To</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full p-2 rounded-lg bg-secondary border-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Categories */}
                    <section className="bg-card p-5 rounded-2xl border border-border/50 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 font-semibold text-sm text-muted-foreground">
                            <Filter className="w-4 h-4" />
                            Include Categories
                        </div>
                        <div className="space-y-2">
                            {["food", "exercise", "water", "sleep", "mood"].map(cat => (
                                <label key={cat} className="flex items-center gap-3 p-2 hover:bg-secondary/50 rounded-lg cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={categories.includes(cat)}
                                        onChange={() => toggleCategory(cat)}
                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="capitalize font-medium">{cat}</span>
                                </label>
                            ))}
                        </div>
                    </section>
                </aside>

                {/* Main Content / Print View */}
                <main className="bg-card min-h-[500px] rounded-2xl border border-border/50 shadow-sm p-8 print:border-none print:shadow-none print:p-0">
                    <div className="mb-8 border-b border-border/50 pb-6 print:mb-6">
                        <h2 className="text-3xl font-bold mb-2">Health Log Report</h2>
                        <p className="text-muted-foreground print:text-black">
                            {format(new Date(startDate), "MMMM do, yyyy")} - {format(new Date(endDate), "MMMM do, yyyy")}
                        </p>
                    </div>

                    {logs === undefined ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-8 w-48 bg-secondary rounded" />
                            <div className="h-24 bg-secondary rounded" />
                            <div className="h-24 bg-secondary rounded" />
                        </div>
                    ) : (
                        <ReportView logs={logs} categories={categories} />
                    )}
                </main>
            </div>
        </div>
    );
}
