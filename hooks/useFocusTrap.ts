import { useEffect, useRef, useCallback } from "react";

/**
 * Hook to trap focus within a container element.
 * Essential for modal accessibility (WCAG 2.1 requirement).
 */
export function useFocusTrap(isActive: boolean = true) {
    const containerRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<Element | null>(null);

    // Get all focusable elements within the container
    const getFocusableElements = useCallback(() => {
        if (!containerRef.current) return [];

        const focusableSelectors = [
            'button:not([disabled])',
            'a[href]',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
        ].join(', ');

        return Array.from(
            containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
        ).filter(el => el.offsetParent !== null); // Filter out hidden elements
    }, []);

    useEffect(() => {
        if (!isActive) return;

        // Store the currently focused element
        previousActiveElement.current = document.activeElement;

        // Focus the first focusable element
        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
            // Small delay to ensure modal is fully rendered
            setTimeout(() => {
                focusableElements[0]?.focus();
            }, 50);
        }

        // Handle tab key navigation
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            const focusableElements = getFocusableElements();
            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            // Shift + Tab
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        // Cleanup: restore focus to previous element
        return () => {
            document.removeEventListener('keydown', handleKeyDown);

            if (previousActiveElement.current instanceof HTMLElement) {
                previousActiveElement.current.focus();
            }
        };
    }, [isActive, getFocusableElements]);

    return containerRef;
}
