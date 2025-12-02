"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Trophy, List } from "lucide-react";
import RoutinesTab from "../../components/workouts/RoutinesTab";
import ExercisesTab from "../../components/workouts/ExercisesTab";
import SportsTab from "../../components/workouts/SportsTab";

export default function WorkoutsPage() {
    const [activeTab, setActiveTab] = useState<"routines" | "exercises" | "sports">("routines");

    return (
        <div className="pb-24 pt-safe px-4 max-w-md mx-auto">
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Workouts</h1>
                    <p className="text-muted-foreground">Manage your training.</p>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex p-1 bg-secondary/50 rounded-xl mb-6 relative">
                <div className="absolute inset-0 flex" aria-hidden="true">
                    <div className={`flex-1 transition-all duration-300 ease-out rounded-lg ${activeTab === "routines" ? "bg-background shadow-sm m-1" : "bg-transparent"}`} />
                    <div className={`flex-1 transition-all duration-300 ease-out rounded-lg ${activeTab === "exercises" ? "bg-background shadow-sm m-1" : "bg-transparent"}`} />
                    <div className={`flex-1 transition-all duration-300 ease-out rounded-lg ${activeTab === "sports" ? "bg-background shadow-sm m-1" : "bg-transparent"}`} />
                </div>

                <button
                    onClick={() => setActiveTab("routines")}
                    className={`flex-1 relative z-10 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === "routines" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                    <List className="w-4 h-4" /> Routines
                </button>
                <button
                    onClick={() => setActiveTab("exercises")}
                    className={`flex-1 relative z-10 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === "exercises" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                    <Dumbbell className="w-4 h-4" /> Exercises
                </button>
                <button
                    onClick={() => setActiveTab("sports")}
                    className={`flex-1 relative z-10 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === "sports" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                    <Trophy className="w-4 h-4" /> Sports
                </button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === "routines" && <RoutinesTab />}
                    {activeTab === "exercises" && <ExercisesTab />}
                    {activeTab === "sports" && <SportsTab />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
