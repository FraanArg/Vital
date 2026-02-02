"use client";

import { ReactNode, useState, useRef } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Trash2, Edit } from "lucide-react";
import clsx from "clsx";

interface SwipeAction {
    icon: ReactNode;
    label: string;
    color: string;
    bgColor: string;
    onClick: () => void;
}

interface SwipeableRowProps {
    children: ReactNode;
    /** Left swipe action (usually edit) */
    leftAction?: SwipeAction;
    /** Right swipe action (usually delete) */
    rightAction?: SwipeAction;
    /** Threshold to trigger action (default: 80px) */
    threshold?: number;
    /** Additional class names */
    className?: string;
    /** Disable swipe */
    disabled?: boolean;
}

/**
 * Swipeable Row Component
 * 
 * Add swipe-to-reveal actions on list items.
 * Swipe left for right action, swipe right for left action.
 * 
 * @example
 * <SwipeableRow
 *   rightAction={{
 *     icon: <Trash2 />,
 *     label: "Delete",
 *     color: "text-white",
 *     bgColor: "bg-red-500",
 *     onClick: () => handleDelete()
 *   }}
 * >
 *   <ListItem />
 * </SwipeableRow>
 */
export function SwipeableRow({
    children,
    leftAction,
    rightAction,
    threshold = 80,
    className,
    disabled = false,
}: SwipeableRowProps) {
    const [isDragging, setIsDragging] = useState(false);
    const constraintsRef = useRef(null);
    const x = useMotionValue(0);

    // Calculate action visibility based on drag position
    const leftOpacity = useTransform(x, [0, threshold], [0, 1]);
    const rightOpacity = useTransform(x, [-threshold, 0], [1, 0]);
    const leftScale = useTransform(x, [0, threshold], [0.8, 1]);
    const rightScale = useTransform(x, [-threshold, 0], [1, 0.8]);

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        setIsDragging(false);

        // Trigger left action
        if (info.offset.x > threshold && leftAction) {
            leftAction.onClick();
        }
        // Trigger right action
        else if (info.offset.x < -threshold && rightAction) {
            rightAction.onClick();
        }
    };

    if (disabled) {
        return <div className={className}>{children}</div>;
    }

    return (
        <div ref={constraintsRef} className={clsx("relative overflow-hidden", className)}>
            {/* Left Action (revealed on right swipe) */}
            {leftAction && (
                <motion.div
                    className={clsx(
                        "absolute left-0 top-0 bottom-0 flex items-center justify-center px-4",
                        leftAction.bgColor
                    )}
                    style={{ opacity: leftOpacity, scale: leftScale }}
                >
                    <div className={clsx("flex flex-col items-center gap-1", leftAction.color)}>
                        {leftAction.icon}
                        <span className="text-xs font-medium">{leftAction.label}</span>
                    </div>
                </motion.div>
            )}

            {/* Right Action (revealed on left swipe) */}
            {rightAction && (
                <motion.div
                    className={clsx(
                        "absolute right-0 top-0 bottom-0 flex items-center justify-center px-4",
                        rightAction.bgColor
                    )}
                    style={{ opacity: rightOpacity, scale: rightScale }}
                >
                    <div className={clsx("flex flex-col items-center gap-1", rightAction.color)}>
                        {rightAction.icon}
                        <span className="text-xs font-medium">{rightAction.label}</span>
                    </div>
                </motion.div>
            )}

            {/* Main Content */}
            <motion.div
                drag="x"
                dragConstraints={{ left: rightAction ? -threshold * 1.5 : 0, right: leftAction ? threshold * 1.5 : 0 }}
                dragElastic={0.1}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={handleDragEnd}
                style={{ x }}
                className={clsx(
                    "relative bg-card",
                    isDragging && "cursor-grabbing"
                )}
            >
                {children}
            </motion.div>
        </div>
    );
}

// Preset actions
export const deleteAction = (onClick: () => void): SwipeAction => ({
    icon: <Trash2 className="w-5 h-5" />,
    label: "Delete",
    color: "text-white",
    bgColor: "bg-red-500",
    onClick,
});

export const editAction = (onClick: () => void): SwipeAction => ({
    icon: <Edit className="w-5 h-5" />,
    label: "Edit",
    color: "text-white",
    bgColor: "bg-blue-500",
    onClick,
});

export default SwipeableRow;
