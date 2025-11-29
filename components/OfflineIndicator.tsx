"use client";

import { useState, useEffect } from "react";
import { WifiOff, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(true);
    const [showOnlineMessage, setShowOnlineMessage] = useState(false);

    useEffect(() => {
        // Initial check (client-side only)
        if (typeof window !== 'undefined') {
            setIsOnline(navigator.onLine);
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

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return (
        <AnimatePresence>
            {!isOnline && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-24 right-4 sm:bottom-8 sm:right-8 bg-destructive text-destructive-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-50 font-medium text-sm"
                >
                    <WifiOff className="w-4 h-4" />
                    <span>Offline</span>
                </motion.div>
            )}
            {isOnline && showOnlineMessage && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-24 right-4 sm:bottom-8 sm:right-8 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-50 font-medium text-sm"
                >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Back Online</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
