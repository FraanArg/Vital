"use client";

import { useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "./Button";

interface ConfirmDialogProps {
    /** Whether the dialog is open */
    isOpen: boolean;
    /** Callback when dialog should close */
    onClose: () => void;
    /** Callback when user confirms the action */
    onConfirm: () => void;
    /** Dialog title */
    title: string;
    /** Dialog description/message */
    description: string;
    /** Label for the confirm button */
    confirmLabel?: string;
    /** Label for the cancel button */
    cancelLabel?: string;
    /** Variant for the confirm button */
    variant?: "primary" | "destructive";
    /** Whether the confirm action is loading */
    isLoading?: boolean;
}

/**
 * Accessible confirmation dialog for destructive or important actions.
 * Replaces browser's native confirm() with a styled, keyboard-accessible modal.
 */
export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "primary",
    isLoading = false,
}: ConfirmDialogProps) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const confirmButtonRef = useRef<HTMLButtonElement>(null);

    // Handle escape key
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape" && !isLoading) {
            onClose();
        }
    }, [onClose, isLoading]);

    // Focus management and escape key
    useEffect(() => {
        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            // Focus the cancel button (safer default for destructive actions)
            setTimeout(() => {
                dialogRef.current?.focus();
            }, 100);
            // Prevent body scroll
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen, handleKeyDown]);

    // Handle backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isLoading) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={handleBackdropClick}
                    aria-labelledby="dialog-title"
                    aria-describedby="dialog-description"
                    role="alertdialog"
                    aria-modal="true"
                >
                    <motion.div
                        ref={dialogRef}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-md bg-card border border-border/50 rounded-2xl shadow-lg p-6"
                        tabIndex={-1}
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
                            aria-label="Close dialog"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Icon for destructive actions */}
                        {variant === "destructive" && (
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-destructive/10">
                                <AlertTriangle className="w-6 h-6 text-destructive" />
                            </div>
                        )}

                        {/* Content */}
                        <div className="text-center">
                            <h2
                                id="dialog-title"
                                className="text-lg font-semibold mb-2"
                            >
                                {title}
                            </h2>
                            <p
                                id="dialog-description"
                                className="text-sm text-muted-foreground mb-6"
                            >
                                {description}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                fullWidth
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                {cancelLabel}
                            </Button>
                            <Button
                                ref={confirmButtonRef}
                                variant={variant === "destructive" ? "destructive" : "primary"}
                                fullWidth
                                onClick={onConfirm}
                                isLoading={isLoading}
                            >
                                {confirmLabel}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
