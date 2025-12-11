"use client";

import { useState, useEffect } from "react";
import { Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SaveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isSaving?: boolean;
    isSuccess?: boolean;
    label?: string;
    successLabel?: string;
}

export default function SaveButton({
    isSaving,
    isSuccess,
    label = "Save",
    successLabel = "Saved!",
    className = "",
    ...props
}: SaveButtonProps) {
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (isSuccess) {
            setShowSuccess(true);
            const timer = setTimeout(() => setShowSuccess(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess]);

    return (
        <button
            disabled={isSaving || props.disabled}
            className={`w-full p-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2 ${className}`}
            {...props}
        >
            <AnimatePresence mode="wait">
                {isSaving ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2"
                    >
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Saving...</span>
                    </motion.div>
                ) : showSuccess ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                            <Check className="w-5 h-5" />
                        </motion.div>
                        <span>{successLabel}</span>
                    </motion.div>
                ) : (
                    <motion.span
                        key="label"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {label}
                    </motion.span>
                )}
            </AnimatePresence>
        </button>
    );
}
