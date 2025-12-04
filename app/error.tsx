"use client";

import { useEffect } from "react";
import { RefreshCcw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    const isChunkError = error.message.includes("Loading chunk") || error.name === "ChunkLoadError";

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-destructive/10 text-destructive p-4 rounded-full mb-4">
                <RefreshCcw className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
                {isChunkError
                    ? "A new version of the app is available. Please refresh to update."
                    : "An unexpected error occurred. Please try again."}
            </p>
            <button
                onClick={() => {
                    if (isChunkError) {
                        window.location.reload();
                    } else {
                        reset();
                    }
                }}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
                {isChunkError ? "Refresh Page" : "Try again"}
            </button>
        </div>
    );
}
