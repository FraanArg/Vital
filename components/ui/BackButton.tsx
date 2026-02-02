"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { IconButton } from "./IconButton";

interface BackButtonProps {
    /** Custom back route - defaults to router.back() */
    href?: string;
    /** Accessible label */
    label?: string;
    /** Additional class names */
    className?: string;
}

/**
 * Consistent Back Button for mobile navigation.
 * 
 * Use in PageHeader actions or standalone for consistent
 * back navigation across the app.
 * 
 * @example
 * <PageHeader
 *   title="Settings"
 *   actions={<BackButton />}
 * />
 */
export function BackButton({
    href,
    label = "Go back",
    className,
}: BackButtonProps) {
    const router = useRouter();

    const handleClick = () => {
        if (href) {
            router.push(href);
        } else {
            router.back();
        }
    };

    return (
        <IconButton
            onClick={handleClick}
            label={label}
            variant="ghost"
            size="md"
            className={className}
        >
            <ChevronLeft className="w-5 h-5" />
        </IconButton>
    );
}

export default BackButton;
