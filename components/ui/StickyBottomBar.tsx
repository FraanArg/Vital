"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

interface StickyBottomBarProps {
    children: ReactNode;
    className?: string;
    /** Show backdrop blur effect */
    blur?: boolean;
    /** Show top border */
    bordered?: boolean;
}

/**
 * Sticky Bottom Action Bar
 * 
 * Use for primary form actions on mobile. Sticks to the bottom
 * of the screen with safe area support for notched devices.
 * 
 * @example
 * <StickyBottomBar>
 *   <Button fullWidth>Save Changes</Button>
 * </StickyBottomBar>
 */
export function StickyBottomBar({
    children,
    className,
    blur = true,
    bordered = true,
}: StickyBottomBarProps) {
    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className={clsx(
                "sticky bottom-0 left-0 right-0 z-40",
                "px-4 py-3",
                // Safe area padding for notched devices
                "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
                blur && "bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60",
                !blur && "bg-background",
                bordered && "border-t border-separator",
                className
            )}
        >
            <div className="container-mobile mx-auto">
                {children}
            </div>
        </motion.div>
    );
}

export default StickyBottomBar;
