"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StaggeredListProps {
    children: ReactNode[];
    staggerDelay?: number;
    className?: string;
}

/**
 * Wrapper component that animates children with staggered fade-in
 */
export default function StaggeredList({
    children,
    staggerDelay = 0.05,
    className = "",
}: StaggeredListProps) {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: staggerDelay,
            },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 15, scale: 0.98 },
        show: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 24,
            }
        },
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className={className}
        >
            {children.map((child, index) => (
                <motion.div key={index} variants={item}>
                    {child}
                </motion.div>
            ))}
        </motion.div>
    );
}

/**
 * Staggered grid layout
 */
export function StaggeredGrid({
    children,
    staggerDelay = 0.03,
    columns = 2,
    className = "",
}: StaggeredListProps & { columns?: number }) {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: staggerDelay,
            },
        },
    };

    const item = {
        hidden: { opacity: 0, scale: 0.9 },
        show: {
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 25,
            }
        },
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className={`grid gap-3 ${columns === 2 ? "grid-cols-2" :
                    columns === 3 ? "grid-cols-3" :
                        columns === 4 ? "grid-cols-4" : "grid-cols-1"
                } ${className}`}
        >
            {children.map((child, index) => (
                <motion.div key={index} variants={item}>
                    {child}
                </motion.div>
            ))}
        </motion.div>
    );
}
