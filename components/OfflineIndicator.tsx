"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { WifiOff, CheckCircle2, RefreshCw, CloudOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../lib/db";

export default function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(true);
    const [showOnlineMessage, setShowOnlineMessage] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

    // Update pending count
    const updatePendingCount = useCallback(async () => {
        try {
            const count = await db.syncQueue.count();
            setPendingCount(count);
        } catch (error) {
            console.error("Error counting pending items:", error);
        }
    }, []);

    useEffect(() => {
        // Initial check (client-side only)
        if (typeof window !== 'undefined') {
            setTimeout(() => setIsOnline(navigator.onLine), 0);
        }

        const handleOnline = () => {
            setIsOnline(true);
            setShowOnlineMessage(true);
            setTimeout(() => setShowOnlineMessage(false), 3000);
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        // Check pending count periodically
        updatePendingCount();
        const interval = setInterval(updatePendingCount, 5000);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
            clearInterval(interval);
        };
    }, [updatePendingCount]);

    return (
        <AnimatePresence>
            {/* Offline indicator */}
            {!isOnline && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-24 left-4 right-4 sm:bottom-8 sm:left-auto sm:right-8 sm:w-auto bg-amber-500 text-white px-4 py-3 rounded-xl shadow-lg z-50"
                >
                    <div className="flex items-center gap-3">
                        <WifiOff className="w-5 h-5 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-sm">Sin conexión</p>
                            <p className="text-xs opacity-80">Los cambios se guardarán localmente</p>
                        </div>
                        {pendingCount > 0 && (
                            <div className="flex items-center justify-center w-6 h-6 bg-white/20 rounded-full text-xs font-bold">
                                {pendingCount}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Back online message */}
            {isOnline && showOnlineMessage && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-24 right-4 sm:bottom-8 sm:right-8 bg-emerald-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-50 font-medium text-sm"
                >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Conectado</span>
                    {pendingCount > 0 && (
                        <span className="opacity-80">• Sincronizando {pendingCount}...</span>
                    )}
                </motion.div>
            )}

            {/* Pending sync indicator (when online but have pending items) */}
            {isOnline && !showOnlineMessage && pendingCount > 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="fixed bottom-24 right-4 sm:bottom-8 sm:right-8 bg-blue-500 text-white px-3 py-2 rounded-full shadow-lg flex items-center gap-2 z-50 text-sm"
                >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{pendingCount} pendiente{pendingCount > 1 ? 's' : ''}</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
