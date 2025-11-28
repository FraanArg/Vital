"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BarChart2, User, Settings } from "lucide-react";
import { clsx } from "clsx";

export default function BottomNav() {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Today", icon: LayoutDashboard },
        { href: "/stats", label: "Stats", icon: BarChart2 },
        { href: "/profile", label: "Profile", icon: User },
        { href: "/settings", label: "Settings", icon: Settings },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border pb-safe z-50">
            <div className="flex justify-around items-center h-16 px-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={clsx(
                                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon className={clsx("w-6 h-6", isActive && "fill-current")} />
                            <span className="text-[10px] font-medium">{link.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
