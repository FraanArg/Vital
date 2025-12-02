"use client";

import Link from "next/link";
import { Dumbbell, Utensils, ChevronRight } from "lucide-react";

export default function LibraryPage() {
    return (
        <div className="min-h-screen p-4 sm:p-8 pb-24 flex flex-col items-center">
            <div className="w-full max-w-2xl animate-fade-in">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Library</h1>
                    <p className="text-muted-foreground mt-2">Manage your exercises and food database.</p>
                </header>

                <div className="grid gap-4">
                    <Link href="/workouts" className="group relative overflow-hidden bg-card border border-border/50 rounded-3xl p-6 hover:shadow-lg transition-all hover:border-primary/50">
                        <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-blue-500/10" />

                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform">
                                    <Dumbbell className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Workouts</h2>
                                    <p className="text-muted-foreground">Routines, Exercises, and Sports</p>
                                </div>
                            </div>
                            <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                        </div>
                    </Link>

                    <Link href="/foods" className="group relative overflow-hidden bg-card border border-border/50 rounded-3xl p-6 hover:shadow-lg transition-all hover:border-primary/50">
                        <div className="absolute top-0 right-0 p-32 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-orange-500/10" />

                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-orange-500/10 text-orange-500 rounded-2xl group-hover:scale-110 transition-transform">
                                    <Utensils className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Foods</h2>
                                    <p className="text-muted-foreground">Food Database and Meals</p>
                                </div>
                            </div>
                            <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
