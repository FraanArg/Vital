"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { FunctionReference, FunctionArgs, FunctionReturnType } from "convex/server";
import { useHaptics } from "./useHaptics";

interface OptimisticState<T> {
    pending: boolean;
    error: Error | null;
    optimisticData: T | null;
}

interface UseOptimisticMutationOptions<T> {
    onSuccess?: (result: any) => void;
    onError?: (error: Error) => void;
    hapticOnSuccess?: boolean;
    hapticOnError?: boolean;
}

/**
 * Hook that wraps a Convex mutation with optimistic UI updates
 * Shows changes immediately while the mutation is in flight
 */
export function useOptimisticMutation<Mutation extends FunctionReference<"mutation">>(
    mutation: Mutation,
    options: UseOptimisticMutationOptions<FunctionArgs<Mutation>> = {}
) {
    const [state, setState] = useState<OptimisticState<FunctionArgs<Mutation>>>({
        pending: false,
        error: null,
        optimisticData: null,
    });

    const mutate = useMutation(mutation);
    const haptics = useHaptics();

    const execute = useCallback(
        async (args: FunctionArgs<Mutation>): Promise<FunctionReturnType<Mutation> | null> => {
            // Start optimistic update
            setState({
                pending: true,
                error: null,
                optimisticData: args,
            });

            try {
                const result = await mutate(args);

                // Success
                setState({
                    pending: false,
                    error: null,
                    optimisticData: null,
                });

                if (options.hapticOnSuccess !== false) {
                    haptics.success();
                }

                options.onSuccess?.(result);
                return result;
            } catch (error) {
                // Rollback optimistic update
                setState({
                    pending: false,
                    error: error as Error,
                    optimisticData: null,
                });

                if (options.hapticOnError !== false) {
                    haptics.error();
                }

                options.onError?.(error as Error);
                return null;
            }
        },
        [mutate, haptics, options]
    );

    return {
        execute,
        ...state,
    };
}

/**
 * Simple loading state hook for mutations
 */
export function useMutationState() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const wrap = useCallback(async <T>(promise: Promise<T>): Promise<T | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await promise;
            setIsLoading(false);
            return result;
        } catch (e) {
            setError(e as Error);
            setIsLoading(false);
            return null;
        }
    }, []);

    return {
        isLoading,
        error,
        wrap,
        reset: () => setError(null),
    };
}
