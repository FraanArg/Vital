"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { motion } from "framer-motion";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

/**
 * Enhanced Input with floating label, glow focus, and icon support
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, className = "", ...props }, ref) => {
        return (
            <div className="relative">
                {label && (
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {icon}
                        </span>
                    )}
                    <input
                        ref={ref}
                        className={`
                            w-full px-4 py-3 
                            bg-secondary/50 
                            border border-border/50 
                            rounded-xl 
                            text-foreground 
                            placeholder:text-muted-foreground/60
                            transition-all duration-200
                            focus:outline-none 
                            focus:border-primary/50
                            focus:ring-2 
                            focus:ring-primary/20
                            focus:bg-secondary/80
                            disabled:opacity-50 
                            disabled:cursor-not-allowed
                            ${icon ? "pl-10" : ""}
                            ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}
                            ${className}
                        `}
                        {...props}
                    />
                </div>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-1"
                    >
                        {error}
                    </motion.p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;

/**
 * Textarea variant with same styling
 */
export const Textarea = forwardRef<
    HTMLTextAreaElement,
    React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }
>(({ label, error, className = "", ...props }, ref) => {
    return (
        <div className="relative">
            {label && (
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                    {label}
                </label>
            )}
            <textarea
                ref={ref}
                className={`
                    w-full px-4 py-3 
                    bg-secondary/50 
                    border border-border/50 
                    rounded-xl 
                    text-foreground 
                    placeholder:text-muted-foreground/60
                    transition-all duration-200
                    focus:outline-none 
                    focus:border-primary/50
                    focus:ring-2 
                    focus:ring-primary/20
                    focus:bg-secondary/80
                    disabled:opacity-50 
                    disabled:cursor-not-allowed
                    resize-none
                    ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}
                    ${className}
                `}
                {...props}
            />
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-1"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
});

Textarea.displayName = "Textarea";
