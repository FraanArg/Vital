import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Hook that debounces a value.
 * Useful for search inputs to avoid excessive API calls.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Hook that returns a debounced callback function.
 * Useful for event handlers that shouldn't fire too frequently.
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
    callback: T,
    delay: number = 300
): T {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const callbackRef = useRef(callback);

    // Update the ref when callback changes
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const debouncedCallback = useCallback(
        (...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                callbackRef.current(...args);
            }, delay);
        },
        [delay]
    ) as T;

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return debouncedCallback;
}

/**
 * Hook for throttling a callback (fires at most once per interval)
 */
export function useThrottle<T>(value: T, interval: number = 500): T {
    const [throttledValue, setThrottledValue] = useState<T>(value);
    const lastExecuted = useRef<number>(Date.now());

    useEffect(() => {
        if (Date.now() >= lastExecuted.current + interval) {
            lastExecuted.current = Date.now();
            setThrottledValue(value);
        } else {
            const timer = setTimeout(() => {
                lastExecuted.current = Date.now();
                setThrottledValue(value);
            }, interval);

            return () => clearTimeout(timer);
        }
    }, [value, interval]);

    return throttledValue;
}
