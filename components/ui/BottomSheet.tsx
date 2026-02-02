"use client";

import { ReactNode, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useDragControls, PanInfo } from "framer-motion";
import { X } from "lucide-react";
import clsx from "clsx";
import { IconButton } from "./IconButton";

interface BottomSheetProps {
    /** Whether the sheet is open */
    isOpen: boolean;
    /** Callback when sheet should close */
    onClose: () => void;
    /** Sheet content */
    children: ReactNode;
    /** Title displayed in the header */
    title?: string;
    /** Optional subtitle */
    subtitle?: string;
    /** Height - "auto" or "full" */
    height?: "auto" | "full";
    /** Whether to show the drag handle */
    showHandle?: boolean;
    /** Whether to close on backdrop click */
    closeOnBackdropClick?: boolean;
}

/**
 * Mobile-first Bottom Sheet Component
 * 
 * iOS-style bottom sheet with drag-to-dismiss, backdrop blur,
 * and safe area support. Perfect for mobile forms and modals.
 * 
 * @example
 * <BottomSheet isOpen={isOpen} onClose={onClose} title="Add Entry">
 *   <form>...</form>
 * </BottomSheet>
 */
export function BottomSheet({
    isOpen,
    onClose,
    children,
    title,
    subtitle,
    height = "auto",
    showHandle = true,
    closeOnBackdropClick = true,
}: BottomSheetProps) {
    const dragControls = useDragControls();

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            document.body.style.touchAction = "none";
        } else {
            document.body.style.overflow = "";
            document.body.style.touchAction = "";
        }
        return () => {
            document.body.style.overflow = "";
            document.body.style.touchAction = "";
        };
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    // Handle drag end
    const handleDragEnd = useCallback(
        (_: never, info: PanInfo) => {
            // Close if dragged down more than 100px or with velocity
            if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose();
            }
        },
        [onClose]
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="sheet-backdrop"
                        onClick={closeOnBackdropClick ? onClose : undefined}
                        aria-hidden="true"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{
                            type: "spring",
                            damping: 30,
                            stiffness: 300,
                        }}
                        drag="y"
                        dragControls={dragControls}
                        dragConstraints={{ top: 0 }}
                        dragElastic={{ top: 0, bottom: 0.5 }}
                        onDragEnd={handleDragEnd}
                        className={clsx(
                            "fixed bottom-0 left-0 right-0 z-50",
                            "bg-card border-t border-border/50",
                            "rounded-t-3xl shadow-lg",
                            // Safe area padding
                            "pb-[env(safe-area-inset-bottom)]",
                            height === "full" && "h-[90vh]",
                            height === "auto" && "max-h-[90vh]"
                        )}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={title ? "sheet-title" : undefined}
                    >
                        {/* Drag Handle */}
                        {showHandle && (
                            <div
                                className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
                                onPointerDown={(e) => dragControls.start(e)}
                            >
                                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
                            </div>
                        )}

                        {/* Header */}
                        {(title || subtitle) && (
                            <div className="flex items-center justify-between px-4 pb-3 border-b border-separator">
                                <div>
                                    {title && (
                                        <h2
                                            id="sheet-title"
                                            className="text-lg font-semibold"
                                        >
                                            {title}
                                        </h2>
                                    )}
                                    {subtitle && (
                                        <p className="text-sm text-muted-foreground">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                                <IconButton
                                    onClick={onClose}
                                    label="Close"
                                    variant="ghost"
                                    size="sm"
                                >
                                    <X className="w-5 h-5" />
                                </IconButton>
                            </div>
                        )}

                        {/* Content */}
                        <div
                            className={clsx(
                                "overflow-y-auto overscroll-contain",
                                height === "full" && "flex-1",
                                height === "auto" && "max-h-[70vh]"
                            )}
                        >
                            <div className="px-4 py-4">{children}</div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default BottomSheet;
