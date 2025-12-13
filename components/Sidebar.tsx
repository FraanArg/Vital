"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BarChart3, User, Folder } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { clsx } from "clsx";
import { motion } from "framer-motion";

const NAV_ITEMS = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/stats", label: "Statistics", icon: BarChart3 },
    { href: "/library", label: "Library", icon: Folder },
    { href: "/profile", label: "Profile", icon: User },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex flex-col w-64 bg-card/50 backdrop-blur-sm border-r border-separator h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                    <span className="text-primary-foreground font-bold text-lg">V</span>
                </div>
                <h1 className="font-bold text-xl tracking-tight">Vital</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-2">
                <ul className="space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={clsx(
                                        "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-fast group",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                        isActive
                                            ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    )}
                                    aria-current={isActive ? "page" : undefined}
                                >
                                    <motion.div whileTap={{ scale: 0.95 }}>
                                        <Icon className={clsx(
                                            "w-5 h-5 transition-transform duration-fast",
                                            !isActive && "group-hover:scale-105"
                                        )} />
                                    </motion.div>
                                    <span className="text-sm">{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer */}
            <div className="px-4 py-4 border-t border-separator space-y-3">
                {/* Theme Toggle */}
                <div className="flex items-center justify-between px-2 py-1">
                    <span className="text-sm text-muted-foreground">Theme</span>
                    <ThemeToggle />
                </div>

                {/* Account */}
                <div className="flex items-center justify-between px-2 py-1">
                    <span className="text-sm text-muted-foreground">Account</span>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                                Sign In
                            </button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                </div>
            </div>
        </aside>
    );
}
