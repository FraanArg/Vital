"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Loader2, UploadCloud } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function SyncData() {
    const { user } = useUser();
    const createLog = useMutation(api.logs.createLog);
    const [syncing, setSyncing] = useState(false);
    const [synced, setSynced] = useState(false);

    const handleSync = async () => {
        if (!user) return;
        setSyncing(true);
        try {
            // Use native IndexedDB to bypass Dexie version/schema errors
            const logs = await new Promise<unknown[]>((resolve, reject) => {
                const request = indexedDB.open("PersonalTrackerDB");
                request.onerror = () => reject(request.error);
                request.onsuccess = () => {
                    const db = request.result;
                    if (!db.objectStoreNames.contains("logs")) {
                        resolve([]); // No logs table
                        return;
                    }
                    const transaction = db.transaction("logs", "readonly");
                    const store = transaction.objectStore("logs");
                    const getAll = store.getAll();
                    getAll.onsuccess = () => resolve(getAll.result);
                    getAll.onerror = () => reject(getAll.error);
                };
            });

            console.log("Found logs:", logs.length);

            for (const logItem of logs) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const log = logItem as any;
                // Convert Date to ISO string for Convex
                const { ...logData } = log;
                delete logData.id; // Remove id if it exists

                // Ensure date is a string if it's a Date object
                let dateStr = log.date;
                if (log.date instanceof Date) {
                    dateStr = log.date.toISOString();
                } else if (typeof log.date === 'string') {
                    // Already a string
                } else {
                    // Fallback for missing date
                    dateStr = new Date().toISOString();
                }

                await createLog({
                    ...logData,
                    date: dateStr,
                });
            }
            setSynced(true);
        } catch (error) {
            console.error("Sync failed:", error);
            alert("Sync failed: " + (error instanceof Error ? error.message : "Unknown error"));
        } finally {
            setSyncing(false);
        }
    };

    if (!user) return null;

    if (synced) {
        return (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl mb-6 flex items-center gap-3 text-green-600 dark:text-green-400">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                </div>
                <div>
                    <h3 className="font-bold">Data Synced!</h3>
                    <p className="text-sm opacity-90">Your history is safe in the cloud.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-card rounded-2xl border border-border/50 shadow-sm mb-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-lg">Sync Local Data</h3>
                    <p className="text-sm text-muted-foreground">Upload your local history to your profile.</p>
                </div>
                <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                    {syncing ? "Syncing..." : "Sync Now"}
                </button>
            </div>
        </div>
    );
}
