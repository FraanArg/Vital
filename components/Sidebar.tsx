"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BarChart2, User, Settings } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { clsx } from "clsx";

export default function Sidebar() {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Dashboard", icon: LayoutDashboard },
        { href: "/stats", label: "Statistics", icon: BarChart2 },
        { href: "/profile", label: "Profile", icon: User },
        { href: "/settings", label: "Settings", icon: Settings },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-border bg-background/80 backdrop-blur-xl p-6 z-40">
            <div className="mb-8">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                    Tracker
                </h1>
            </div>

            <nav className="flex-1 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                    : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon className={clsx("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                            <span className="font-medium">{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="pt-6 border-t border-border">
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-secondary/50">
                    <span className="text-sm font-medium">Theme</span>
                    <ThemeToggle />
                </div>
            </div>
        </aside>
    );
}
