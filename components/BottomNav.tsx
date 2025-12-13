"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BarChart2, User, Folder } from "lucide-react";
import { clsx } from "clsx";
import { useHaptic } from "../hooks/useHaptic";
import { motion } from "framer-motion";

const NAV_ITEMS = [
    { href: "/", label: "Today", icon: LayoutDashboard },
    { href: "/stats", label: "Stats", icon: BarChart2 },
    { href: "/library", label: "Library", icon: Folder },
    { href: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
    const pathname = usePathname();
    const { trigger } = useHaptic();

    return (
        <nav
            className="md:hidden fixed bottom-0 left-0 right-0 z-50"
            role="navigation"
            aria-label="Main navigation"
        >
            {/* Backdrop blur effect */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-separator" />

            {/* Safe area padding for notched devices */}
            <div className="relative flex justify-around items-stretch h-[50px] px-4 pb-safe">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => trigger("light")}
                            className={clsx(
                                "flex flex-col items-center justify-center flex-1 min-w-[64px] py-2 transition-colors duration-fast",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset rounded-lg",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground active:text-foreground"
                            )}
                            aria-current={isActive ? "page" : undefined}
                        >
                            <motion.div
                                initial={false}
                                animate={{ scale: isActive ? 1 : 1 }}
                                whileTap={{ scale: 0.9 }}
                                transition={{ duration: 0.1 }}
                            >
                                <Icon
                                    className={clsx(
                                        "w-6 h-6 mb-0.5",
                                        isActive && "stroke-[2.5px]"
                                    )}
                                />
                            </motion.div>
                            <span className={clsx(
                                "text-[10px] font-medium leading-tight",
                                isActive && "font-semibold"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
