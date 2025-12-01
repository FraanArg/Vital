"use client";

import DataExport from "../../components/DataExport";
import Link from "next/link";
import { ThemeToggle } from "../../components/ThemeToggle";
import { Trash2, ChevronRight } from "lucide-react";
import { db } from "../../lib/db";

export default function SettingsPage() {
    const clearData = async () => {
        if (confirm("Are you sure you want to delete ALL data? This cannot be undone.")) {
            await db.logs.clear();
            alert("All data cleared.");
            window.location.reload();
        }
    };

    return (
        <div className="min-h-screen p-4 sm:p-8 pb-24 flex flex-col items-center">
            <div className="w-full max-w-2xl animate-fade-in">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground mt-2">Manage your preferences and data.</p>
                </header>

                <div className="space-y-6">
                    {/* Appearance */}
                    <section className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Appearance</h2>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Theme</span>
                            <ThemeToggle />
                        </div>
                    </section>

                    {/* Customization */}
                    <section className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Customization</h2>
                        <div className="space-y-1">
                            <Link href="/settings/manage" className="flex items-center justify-between group p-2 -mx-2 hover:bg-secondary rounded-xl transition-colors">
                                <div>
                                    <p className="font-medium">Manage Items</p>
                                    <p className="text-sm text-muted-foreground">Add or remove sports and foods</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                            </Link>
                            <Link href="/report" className="flex items-center justify-between group p-2 -mx-2 hover:bg-secondary rounded-xl transition-colors">
                                <div>
                                    <p className="font-medium">Nutritionist Report</p>
                                    <p className="text-sm text-muted-foreground">Export data for your appointments</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                            </Link>
                        </div>
                    </section>

                    {/* Data Management */}
                    <section className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Data Management</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Export / Import</p>
                                    <p className="text-sm text-muted-foreground">Backup your data to JSON</p>
                                </div>
                                <DataExport />
                            </div>

                            <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-destructive">Danger Zone</p>
                                    <p className="text-sm text-muted-foreground">Delete all your logs permanently</p>
                                </div>
                                <button
                                    onClick={clearData}
                                    className="p-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
