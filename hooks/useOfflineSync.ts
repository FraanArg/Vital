"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { db, SyncQueueItem } from "../lib/db";

interface OfflineSyncState {
    isOnline: boolean;
    pendingCount: number;
    isSyncing: boolean;
    lastSyncTime: Date | null;
    error: string | null;
}

export function useOfflineSync() {
    const [state, setState] = useState<OfflineSyncState>({
        isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
        pendingCount: 0,
        isSyncing: false,
        lastSyncTime: null,
        error: null,
    });

    const isSyncingRef = useRef(false);
    const createLog = useMutation(api.logs.createLog);

    // Track online/offline status
    useEffect(() => {
        const handleOnline = () => {
            setState(prev => ({ ...prev, isOnline: true, error: null }));
            // Trigger sync when coming back online
            syncPendingItems();
        };

        const handleOffline = () => {
            setState(prev => ({ ...prev, isOnline: false }));
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        // Initial count
        updatePendingCount();

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    // Update pending count
    const updatePendingCount = useCallback(async () => {
        try {
            const count = await db.syncQueue.count();
            setState(prev => ({ ...prev, pendingCount: count }));
        } catch (error) {
            console.error("[Sync] Error counting pending items:", error);
        }
    }, []);

    // Add item to sync queue
    const queueOperation = useCallback(async (
        operationType: SyncQueueItem["operationType"],
        tableName: string,
        data: Record<string, unknown>
    ) => {
        try {
            await db.syncQueue.add({
                operationType,
                tableName,
                data,
                createdAt: new Date(),
                retryCount: 0,
            });
            await updatePendingCount();
            console.log("[Sync] Queued operation:", operationType, tableName);
        } catch (error) {
            console.error("[Sync] Error queuing operation:", error);
            throw error;
        }
    }, [updatePendingCount]);

    // Sync pending items
    const syncPendingItems = useCallback(async () => {
        if (isSyncingRef.current || !navigator.onLine) return;

        isSyncingRef.current = true;
        setState(prev => ({ ...prev, isSyncing: true, error: null }));

        try {
            const pendingItems = await db.syncQueue.toArray();

            for (const item of pendingItems) {
                try {
                    // Process based on operation type and table
                    if (item.tableName === "logs" && item.operationType === "create") {
                        // Sync log to Convex
                        await createLog(item.data as Parameters<typeof createLog>[0]);
                    }
                    // Add other operation types as needed

                    // Remove from queue on success
                    await db.syncQueue.delete(item.id!);
                    console.log("[Sync] Synced item:", item.id);
                } catch (error) {
                    // Update retry count
                    const errorMessage = error instanceof Error ? error.message : "Unknown error";
                    await db.syncQueue.update(item.id!, {
                        retryCount: item.retryCount + 1,
                        lastError: errorMessage,
                    });
                    console.error("[Sync] Failed to sync item:", item.id, error);

                    // If too many retries, remove from queue
                    if (item.retryCount >= 3) {
                        await db.syncQueue.delete(item.id!);
                        console.warn("[Sync] Removed item after max retries:", item.id);
                    }
                }
            }

            setState(prev => ({
                ...prev,
                isSyncing: false,
                lastSyncTime: new Date(),
            }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Sync failed";
            setState(prev => ({
                ...prev,
                isSyncing: false,
                error: errorMessage,
            }));
        } finally {
            isSyncingRef.current = false;
            await updatePendingCount();
        }
    }, [createLog, updatePendingCount]);

    // Create log with offline support
    const createLogOffline = useCallback(async (data: Parameters<typeof createLog>[0]) => {
        // Always try to save locally first for quick UI response
        try {
            await db.logs.add({
                ...data,
                date: new Date(data.date),
            });
        } catch (e) {
            console.warn("[Sync] Failed to save locally:", e);
        }

        // Try to sync immediately if online
        if (navigator.onLine) {
            try {
                await createLog(data);
                return { success: true, queued: false };
            } catch (error) {
                console.warn("[Sync] Online sync failed, queuing:", error);
            }
        }

        // Queue for later
        await queueOperation("create", "logs", data as Record<string, unknown>);
        return { success: true, queued: true };
    }, [createLog, queueOperation]);

    // Manual sync trigger
    const triggerSync = useCallback(() => {
        if (navigator.onLine) {
            syncPendingItems();
        }
    }, [syncPendingItems]);

    // Clear all pending items (for debugging)
    const clearQueue = useCallback(async () => {
        await db.syncQueue.clear();
        await updatePendingCount();
    }, [updatePendingCount]);

    return {
        ...state,
        createLogOffline,
        queueOperation,
        triggerSync,
        clearQueue,
        updatePendingCount,
    };
}
