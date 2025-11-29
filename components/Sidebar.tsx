"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BarChart3, User, Settings, Utensils } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

const LINKS = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/stats", label: "Statistics", icon: BarChart3 },
    { href: "/foods", label: "Foods", icon: Utensils },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card p-6 h-full">
            <div className="flex items-center gap-3 px-2 mb-8">
                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold">V</span>
                </div>
                <h1 className="font-bold text-xl tracking-tight">Vital</h1>
            </div>

            <nav className="flex-1 space-y-2">
                {LINKS.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group active:scale-95 ${isActive
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-medium"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"}`} />
                            <span>{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto pt-6 border-t border-border space-y-4">
                <div className="flex items-center justify-between px-2">
                    <span className="text-sm font-medium text-muted-foreground">Theme</span>
                    <ThemeToggle />
                </div>
                <div className="flex items-center justify-between px-2">
                    <span className="text-sm font-medium text-muted-foreground">Account</span>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-medium active:scale-95 transition-transform">Sign In</button>
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
